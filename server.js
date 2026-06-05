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
  const lm = { budget:'经济型', mid:'舒适型', luxury:'豪华型' };
  let p = '你是欧洲旅行专家，熟悉小红书热门推荐、Google Maps高分景点、当地特色市场和街区。\n';
  p += '输出纯JSON，禁止任何解释、禁止Markdown、禁止攻略文字。\n\n';
  p += '参数: ' + b.days + '天 ' + (lm[b.level]||'') + ' ' + b.departure + '→' + (b.cities||[]).join('→') + ' ' + b.startDate + '\n\n';
  p += '【景点规则】\n';
  p += '1. 每天2-3个景点，经典打卡+隐藏宝藏结合。除了必去地标，还要加入:\n';
  p += '   - 小红书热门推荐的小众打卡点\n';
  p += '   - Google Maps 4.5分以上的本地餐馆/咖啡馆\n';
  p += '   - 步行可达的公园、公共市场(如Mercato Centrale)、美食街\n';
  p += '   - 拍照好看的街区、河边步道、日落观景点\n';
  p += '2. 景点格式: "景点中文 / English Name"，不加任何括号、距离、说明\n';
  p += '3. 同城市多天，每天景点严禁重复\n';
  p += '4. 周一闭馆的不安排；换乘日最多1个景点；到达日不安排需门票景点\n\n';
  p += '【交通规则·极简】\n';
  p += '格式必须严格为以下之一，不多写一个字:\n';
  p += '  - 步行\n';
  p += '  - 步行+地铁\n';
  p += '  - 步行+公交\n';
  p += '  - 火车: 出发城市 → 到达城市\n';
  p += '  - 飞机: 出发城市 → 到达城市\n';
  p += '  - 步行+水上巴士(Vaporetto)  ← 仅威尼斯\n';
  p += '  - 飞机+出租车\n';
  p += '禁止写距离、时间、解释、换乘说明、机场快线等任何额外文字\n\n';
  p += '【住宿规则】\n';
  p += '格式: "X晚\n酒店品牌\n地址: 街道, 城市"，不加任何其他文字\n';
  p += '酒店位置: 靠近市中心或主要景点区\n\n';
  p += '【禁止出现的内容】\n';
  p += '1. 禁止"酒店周边漫游""酒店周边漫步""自由探索"等无意义填充\n';
  p += '2. 禁止任何形式的攻略建议、温馨提示、注意事项\n';
  p += '3. 禁止在景点名后加括号说明(如"外观""内部""周一闭馆"等)\n';
  if (b.localItinerary && b.localItinerary.days) {
    p += '\n参考行程(必须实质改进，丰富景点):\n' + JSON.stringify(b.localItinerary) + '\n';
  }
  p += '\n返回纯JSON:{"route":"城市1→城市2","days":[{"day":1,"date":"YYYY-MM-DD","city":"城市,国家","touringSpots":["景点"],"accommodation":"X晚\\n酒店\\n地址","transportation":"步行+地铁"}]}';
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
module.exports.callQwen = callQwen;
module.exports.buildPrompt = buildPrompt;
