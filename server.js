const express = require('express');
const cors = require('cors');
const https = require('https');
const crypto = require('crypto');
const path = require('path');

const app = express();

// Upstash Redis (免费 10k/天 持久化)
let redis;
try {
  const { Redis } = require('@upstash/redis');
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });
    console.log('Upstash Redis connected');
  }
} catch(e) { console.log('Upstash Redis unavailable:', e.message); redis = null; }

const memStore = {};
async function kvGet(key) {
  try { if (redis) { const v = await redis.get(key); return v; } } catch(e) { console.error('Redis get error:', e.message); }
  return memStore[key];
}
async function kvSet(key, val) {
  try { if (redis) { await redis.set(key, val); return; } } catch(e) { console.error('Redis set error:', e.message); }
  memStore[key] = val;
}
async function kvIncr(key) {
  try { if (redis) return await redis.incr(key); } catch(e) { console.error('Redis incr error:', e.message); }
  var v = (memStore[key] || 0) + 1; memStore[key] = v; return v;
}
function getIP(req) { return req.headers['x-forwarded-for'] || 'unknown'; }
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
  p += '【景点规则·签证官视角】\n';
  p += '1. 合理性第一: 半天≤2个景点，全天≤3个，考虑排队+游览+交通时间\n';
  p += '2. 邻近原则: 同一天景点必须步行可达或同一片区\n';
  p += '3. 闭馆检查: 标注周几闭馆(如"⚠ 周一闭馆")，避免安排闭馆日参观\n';
  p += '4. 换乘日: 只安排1个轻松景点，不计入全天游览\n';
  p += '5. 到达日: 不安排需要门票的景点\n';
  p += '6. 威尼斯: 交通写Vaporetto，禁写Metro\n\n';
  p += '【酒店规则】\n';
  p += '1. 酒店品牌:' + (budgetHotel[b.level]||'舒适型酒店') + '\n';
  p += '2. 酒店位置: 必须靠近当天最后一个景点，步行不超过15分钟或地铁2站内\n';
  p += '3. 地址格式: 真实街道名+门牌号+邮编+城市，如"Via Roma 37, 20123 Milan, Italy"\n\n';
  p += '【交通规则】\n';
  p += '1. 禁止写具体航班号: 只写"国际航班(出发城市→目的地)"或"Flight(Dep→Arr)"，不写CA749等具体号\n';
  p += '2. 跨城火车写车站名，如"Train: Milano Centrale→Venezia Mestre"\n';
  p += '3. 非枢纽城市(如Nice/Naples/Dubrovnik)返程标注"需经停/转机"\n';
  p += '\n【到达日规则·极其重要】\n';
  p += '1. 国际到达当天必须考虑: 入境排队30-60分钟、取行李20分钟、机场到市区30-90分钟\n';
  p += '2. 到达日下午实际可用时间仅2-3小时，最多安排1个轻松景点（酒店附近漫步即可）\n';
  p += '3. 到达日不要安排需要门票的景点（下午太晚可能已关门）\n';
  p += '4. 到达日住宿说明写"抵达入住，周边适应"\n';
  if (b.localItinerary && b.localItinerary.days) {
    p += '\n【基础行程(必须审查并修正不合理之处)】\n' + JSON.stringify(b.localItinerary) + '\n';
    p += '\n你是签证官视角的行程审查专家。请逐天检查并修正:\n';
    p += '【合理性优先·宁可少不可滥】\n';
    p += '1. 每天景点数必须合理: 考虑开门时间+排队+游览+交通，半天最多2个、全天最多3个大型景点\n';
    p += '2. 同一天的景点必须地理位置相邻(步行15分钟内或同一片区)，严禁跨区跑\n';
    p += '3. 必须检查周几: 欧洲许多博物馆周一闭馆、部分周日缩短营业，标注"⚠ 周一闭馆"等提醒\n';
    p += '4. 换乘日只安排到达城市1个轻松景点，不计入全天游览\n';
    p += '5. 到达日不安排需要门票的景点(可能已关门)\n';
    p += '6. touringSpots保持原样双语格式不变\n';
    p += '7. accommodation写详细: "X晚\n酒店品牌·名称\n地址: 真实地址"\n';
    p += '8. transportation写具体: 机场到市区交通方式+预计时间\n';
  } else {
    p += '\n从零规划行程。遵循上述所有合理性原则。\n';
  }
  p += '\n返回格式:{"route":"城市1→城市2","days":[{"day":1,"date":"YYYY-MM-DD","city":"城市名","touringSpots":["景点1 / Attraction1"],"accommodation":"住宿中英双语","transportation":"交通中英双语"}]}\n';
  p += 'touringSpots保持原样不要重复翻译。accommodation和transportation用中文。只返回JSON。';
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
app.post('/api/generate-itinerary', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || 'unknown';
  const b = req.body;
  if (!b.cities || !b.days) return res.status(400).json({ error:'缺少参数', fallback:true });
  // 免费用户1次，PRO用户每次消耗1次
  const remaining = await kvGet('pro:' + ip);
  const proCount = Number(remaining) || 0;

  if (proCount > 0) {
    // PRO用户：消耗1次
    await kvSet('pro:' + ip, String(proCount - 1));
    await kvIncr('stats:ai_used');
  } else {
    // 免费用户
    const used = await kvIncr('free:' + ip);
    if (used > 1) return res.status(429).json({ error:'次数已用完，请输入兑换码', fallback:true, needRedeem:true });
  }

  if (!checkRateLimit(ip)) return res.status(429).json({ error:'今日额度用完(5次/天)', fallback:true });

  const key = ck({cities:b.cities,days:b.days,level:b.level,departure:b.departure});
  const hit = cached(key);
  if (hit) return res.json({ ...hit, source:'cache' });

  console.log('[Qwen] Calling API for ' + b.cities?.length + ' cities, ' + b.days + ' days');
  callQwen(buildPrompt(b), (err, result) => {
    if (err || !result) {
      console.log('[Qwen] FAILED: ' + (err?.message || 'no result'));
      return res.json({ error:err?.message||'AI unavailable', fallback:true });
    }
    console.log('[Qwen] SUCCESS — response length: ' + result.length + ' chars');
    console.log('[Qwen] First 200 chars: ' + result.substring(0, 200));
    let json = result.trim();
    if (json.startsWith('```')) json = json.replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'');
    try { const p=JSON.parse(json); setc(key,p); res.json({...p, source:'qwen'}); }
    catch(e) { res.json({ error:'AI返回非JSON', fallback:true }); }
  });
});


app.get('/api/debug', (req, res) => {
  res.json({
    redis: !!redis,
    redis_url: process.env.UPSTASH_REDIS_REST_URL ? 'set' : 'missing',
    codes: VALID_CODES.length + ' codes loaded',
    qwen: !!QWEN_API_KEY
  });
});

app.get('/api/status', (req, res) => res.json({ status:'ok', qwen:!!QWEN_API_KEY }));


// ===== 兑换码 + 用户系统 (Vercel KV 持久化) =====
const VALID_CODES = (process.env.REDEEM_CODES || 'SCHENGEN2024,TRAVELFREE,VIP-EU-001').split(',');
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

// KV helper: get/set with memory fallback


app.post('/api/redeem', async (req, res) => {
  const ip = getIP(req);
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: '请输入兑换码' });

  const upper = code.toUpperCase().trim();

  if (!VALID_CODES.includes(upper) && !upper.startsWith('SCH-') && !upper.startsWith('VIP-') && !upper.startsWith('FREE-') && !upper.startsWith('TEST-') && !upper.startsWith('NEW-') && !upper.startsWith('AUTO-')) {
    return res.json({ valid: false, message: '兑换码无效' });
  }

  const used = await kvGet('code:' + upper);
  if (used) return res.json({ valid: false, message: '该兑换码已被使用' });

  await kvSet('code:' + upper, '1');
  await kvSet('pro:' + ip, '3');
  await kvIncr('stats:redeemed');
  await kvSet('redeemed:' + upper, new Date().toISOString());
  res.json({ valid: true, message: '兑换成功！已解锁PRO版', type: 'lifetime' });
});

app.get('/api/user/status', async (req, res) => {
  const ip = getIP(req);
  const remaining = await kvGet('pro:' + ip);
  const freeUsed = await kvGet('free:' + ip) || 0;
  res.json({
    pro: Number(remaining) > 0,
    remaining: Number(remaining) || 0,
    freeUsed: Number(freeUsed),
    freeLimit: 1
  });
});

app.post('/api/admin/generate-codes', (req, res) => {
  const { key, prefix, count } = req.body;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: '无权限' });

  const n = Math.min(count || 10, 50);
  const generated = [];
  for (let i = 0; i < n; i++) {
    const code = (prefix || 'SCH') + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    generated.push(code);
  }
  res.json({ generated, note: '请将以上code添加到Vercel环境变量 REDEEM_CODES 中(逗号分隔)' });
});


// ===== 自动发货：从码池中取一个未使用的兑换码 =====
app.post('/api/dispense-code', async (req, res) => {
  const { key } = req.body;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: '无权限' });

  // Try to find an unused code from the pool
  // Codes are stored as 'pool:CODE' in Redis, value = 'available' or 'used'
  // We scan through pool keys to find an available one
  for (let attempt = 0; attempt < 50; attempt++) {
    // Generate a random pool code
    const prefix = 'AUTO';
    const suffix = require('crypto').randomBytes(3).toString('hex').toUpperCase();
    const code = prefix + '-' + suffix;

    const existing = await kvGet('code:' + code);
    if (!existing) {
      // This code hasn't been used yet — reserve it
      await kvSet('code:' + code, 'reserved');
      await kvSet('code:' + code + ':reserved_at', new Date().toISOString());
      return res.json({ code, message: '新码已分配，发给用户即可' });
    }
  }

  res.status(500).json({ error: '生成失败，请重试' });
});

// 查看剩余可用码数量
app.get('/api/dispense-status', async (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: '无权限' });

  const redeemed = await kvGet('stats:redeemed') || 0;
  const aiUsed = await kvGet('stats:ai_used') || 0;

  res.json({
    totalRedeemed: Number(redeemed),
    totalAiUsed: Number(aiUsed),
    note: 'POST /api/dispense-code 获取新码发给用户'
  });
});

app.get('/api/admin/codes', async (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: '无权限' });

  // Aggregate stats from Redis counters
  const redeemedTotal = Number(await kvGet('stats:redeemed') || 0);
  const aiUsedTotal = Number(await kvGet('stats:ai_used') || 0);

  // Collect all known codes and check if redeemed
  const recent = [];
  const allToCheck = [...VALID_CODES];
  for (const c of allToCheck) {
    const ts = await kvGet('redeemed:' + c.trim());
    if (ts) recent.push({ code: c.trim(), at: ts });
  }

  res.json({
    redeemedTotal,
    aiUsedTotal,
    recentRedemptions: recent,
    validCodesAvailable: VALID_CODES.length
  });
});

module.exports = app;
