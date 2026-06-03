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
  const lm = { budget:'经济型', mid:'舒适型', luxury:'豪华型' };
  let p = '你是申根签证行程规划专家。返回合法JSON。不要Markdown。\n\n';
  p += '天数:'+b.days+' 预算:'+(lm[b.level]||b.level)+' 路线:'+b.departure+'→'+(b.cities||[]).join('→')+' 日期:'+b.startDate+'\n';
  if (b.localItinerary && b.localItinerary.days) {
    p += '\n基础行程:\n'+JSON.stringify(b.localItinerary)+'\n补充hotel_area/transportation/activities。';
  } else { p += '\n从零规划行程JSON。'; }
  p += '\n\n格式:{"route":"...","days":[{"day":1,"date":"YYYY-MM-DD","city":"城市","touringSpots":["景点"],"accommodation":"住宿","transportation":"交通"}]}\n只返回JSON。';
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

module.exports = app;
