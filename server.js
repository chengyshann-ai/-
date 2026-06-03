const express = require('express');
const cors = require('cors');
const https = require('https');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50kb' }));

const QWEN_API_KEY = process.env.QWEN_API_KEY;

// ===== 静态文件 — 直接 sendFile =====
const ROOT = __dirname;
app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.get('/app.js', (req, res) => res.sendFile(path.join(ROOT, 'app.js')));
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ===== 限流 & 缓存 =====
const rateLimit = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const e = rateLimit.get(ip);
  if (!e || now > e.resetTime) { rateLimit.set(ip, { count: 1, resetTime: now + 86400000 }); return true; }
  if (e.count >= 5) return false;
  e.count++; return true;
}
const cache = new Map();
function ck(p) { return crypto.createHash('md5').update(JSON.stringify(p)).digest('hex'); }
function cached(k) {
  const e = cache.get(k); if (!e) return null;
  if (Date.now() - e.t > 86400000) { cache.delete(k); return null; }
  return e.r;
}
function setc(k, r) { cache.set(k, { r, t: Date.now() }); }

// ===== Prompt =====
function buildPrompt(b) {
  const lm = { budget:'经济型(住宿350元/晚)', mid:'舒适型(住宿750元/晚)', luxury:'豪华型(住宿1800元/晚)' };
  const budgetHotel = { budget:'经济连锁酒店如Ibis、Motel One或评价好的民宿', mid:'四星级酒店如NH Collection、Mercure、Holiday Inn', luxury:'五星级如Hilton、Marriott、Kempinski' };
  let p = '你是欧洲申根签证专业行程规划师。必须返回合法JSON，不要Markdown。\n\n';
  p += '【参数】\n';
  p += '- 天数:' + b.days + '天\n- 预算:' + (lm[b.level]||b.level) + '\n';
  p += '- 路线:' + b.departure + ' → ' + (b.cities||[]).join(' → ') + '\n- 出发日期:' + b.startDate + '\n\n';
  p += '【景点规则】\n';
  p += '1. 每天安排2-4个景点，必须是该城市最著名、签证官认可的经典景点\n';
  p += '2. 同一天的景点必须地理位置相邻（步行可达或同一片区），不要跨区跑\n';
  p += '3. 跨城换乘日只安排1个轻松景点，不安排博物馆/美术馆等需3小时以上的\n';
  p += '4. 威尼斯市内交通必须写Vaporetto水上巴士，禁止写Metro\n\n';
  p += '【酒店规则】\n';
  p += '1. 酒店品牌:' + (budgetHotel[b.level]||'舒适型酒店') + '\n';
  p += '2. 酒店位置: 必须靠近当天最后一个景点，步行不超过15分钟或地铁2站内\n';
  p += '3. 地址格式: 真实街道名+门牌号+邮编+城市，如"Via Roma 37, 20123 Milan, Italy"\n\n';
  p += '【交通规则】\n';
  p += '1. 国际航班到达不早于8:00、不晚于22:00；出发航班不早于10:00\n';
  p += '2. 跨城火车优先选2-4小时车程，标注主要车站名如"Milano Centrale→Venezia Mestre"\n';
  p += '3. 非枢纽城市(如Nice/Naples/Dubrovnik)返程需标注经停/转机，不写直飞\n';
  if (b.localItinerary && b.localItinerary.days) {
    p += '\n【基础行程(在此基础上优化)】\n' + JSON.stringify(b.localItinerary) + '\n';
  }
  p += '\n返回格式:{"route":"...","days":[{"day":1,"date":"YYYY-MM-DD","city":"城市,国家","touringSpots":["景点1中英双语","景点2"],"accommodation":"N晚说明\n酒店名\nHotel Add: 地址","transportation":"交通详情"}]}\n只返回JSON。';
  return p;
}

// ===== Qwen =====
function callQwen(prompt, cb) {
  if (!QWEN_API_KEY) return cb(null, null);
  const body = JSON.stringify({ model:'qwen-plus', messages:[{role:'user',content:prompt}], temperature:0.7, max_tokens:4000 });
  https.request({
    hostname:'dashscope.aliyuncs.com', port:443, path:'/compatible-mode/v1/chat/completions', method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+QWEN_API_KEY}, timeout:30000
  }, res => {
    let d=''; res.on('data',c=>d+=c); res.on('end',()=>{
      try { const j=JSON.parse(d); cb(null, j.choices?.[0]?.message?.content); } catch(e) { cb(e,null); }
    });
  }).on('error',e=>cb(e,null)).end(body);
}

// ===== API =====
app.post('/api/generate-itinerary', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || 'unknown';
  const b = req.body;
  if (!b.cities || !b.days) return res.status(400).json({ error:'缺少参数', fallback:true });
  if (!checkRateLimit(ip)) return res.status(429).json({ error:'今日额度用完(5次/天)', fallback:true });

  const key = ck({cities:b.cities,days:b.days,level:b.level,departure:b.departure});
  const hit = cached(key);
  if (hit) return res.json({ ...hit, source:'cache' });

  callQwen(buildPrompt(b), (err, result) => {
    if (err || !result) return res.json({ error:err?.message||'AI unavailable', fallback:true });
    let json = result.trim();
    if (json.startsWith('```')) json = json.replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'');
    try { const p=JSON.parse(json); setc(key,p); res.json({...p, source:'qwen'}); }
    catch(e) { res.json({ error:'AI返回非JSON', fallback:true }); }
  });
});

app.get('/api/status', (req, res) => res.json({ status:'ok', qwen:!!QWEN_API_KEY }));


// ===== 兑换码系统 =====
const CODES_FILE = path.join(__dirname, 'codes.json');
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

function loadCodes() {
  try { return JSON.parse(fs.readFileSync(CODES_FILE, 'utf8')); }
  catch(e) { return { codes: {} }; }
}
function saveCodes(data) {
  fs.writeFileSync(CODES_FILE, JSON.stringify(data, null, 2));
}

// 验证并消耗兑换码
app.post('/api/redeem', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: '请输入兑换码' });

  const data = loadCodes();
  const upper = code.toUpperCase().trim();
  const entry = data.codes[upper];

  if (!entry) return res.json({ valid: false, message: '兑换码无效' });
  if (entry.used) return res.json({ valid: false, message: '该兑换码已被使用' });

  // 消耗兑换码
  entry.used = true;
  entry.usedAt = new Date().toISOString();
  saveCodes(data);

  res.json({ valid: true, message: '兑换成功！解锁全部功能', type: entry.type });
});

// 批量生成兑换码（需admin key）
app.post('/api/admin/generate-codes', (req, res) => {
  const { key, prefix, count } = req.body;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: '无权限' });

  const data = loadCodes();
  const n = Math.min(count || 10, 100);
  const generated = [];

  for (let i = 0; i < n; i++) {
    let code;
    do {
      code = (prefix || 'SCH') + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    } while (data.codes[code]);
    data.codes[code] = { used: false, created: new Date().toISOString(), type: 'lifetime' };
    generated.push(code);
  }

  saveCodes(data);
  res.json({ generated, count: generated.length });
});

// 查询兑换码状态
app.get('/api/admin/codes', (req, res) => {
  const key = req.query.key;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: '无权限' });

  const data = loadCodes();
  const list = Object.entries(data.codes).map(([code, info]) => ({ code, ...info }));
  res.json({ total: list.length, used: list.filter(c => c.used).length, codes: list });
});

module.exports = app;
