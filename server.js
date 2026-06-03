// 申根行程助手 — API 服务 (Vercel Serverless)
// 静态文件由 Vercel 直接托管，这里只处理 /api/*

const express = require('express');
const cors = require('cors');
const https = require('https');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50kb' }));

const QWEN_API_KEY = process.env.QWEN_API_KEY;

const rateLimit = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 24 * 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

const cache = new Map();
function getCacheKey(params) {
  return crypto.createHash('md5').update(JSON.stringify(params)).digest('hex');
}
function checkCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) { cache.delete(key); return null; }
  return entry.result;
}
function setCache(key, result) {
  cache.set(key, { result, timestamp: Date.now() });
}

function buildPrompt({ cities, days, level, departure, startDate, localItinerary }) {
  const lm = { budget:'经济型', mid:'舒适型', luxury:'豪华型' };
  let p = '你是申根签证行程规划专家。返回合法JSON。不要Markdown。\n\n';
  p += '天数:'+days+' 预算:'+(lm[level]||level)+' 路线:'+departure+'→'+(cities||[]).join('→')+' 日期:'+startDate+'\n';
  if (localItinerary && localItinerary.days) {
    p += '\n基础行程:\n'+JSON.stringify(localItinerary)+'\n请补充hotel_area/transportation/activities。';
  } else {
    p += '\n请从零规划行程JSON。';
  }
  p += '\n\n格式:{"route":"...","days":[{"day":1,"date":"YYYY-MM-DD","city":"城市","touringSpots":["景点"],"accommodation":"住宿","transportation":"交通"}]}\n只返回JSON。';
  return p;
}

function callQwen(prompt, callback) {
  if (!QWEN_API_KEY) return callback(null, null);
  const body = JSON.stringify({ model:'qwen-plus', messages:[{role:'user',content:prompt}], temperature:0.7, max_tokens:4000 });
  const req = https.request({
    hostname:'dashscope.aliyuncs.com', port:443, path:'/compatible-mode/v1/chat/completions', method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+QWEN_API_KEY}, timeout:30000
  }, res => {
    let d=''; res.on('data',c=>d+=c); res.on('end',()=>{
      try { const j=JSON.parse(d); callback(null, j.choices?.[0]?.message?.content); } catch(e) { callback(e,null); }
    });
  });
  req.on('error',e=>callback(e,null)); req.write(body); req.end();
}

app.post('/api/generate-itinerary', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || 'unknown';
  const { cities, days, level, departure, startDate, localItinerary } = req.body;
  if (!cities || !days) return res.status(400).json({ error:'缺少参数', fallback:true });
  if (!checkRateLimit(ip)) return res.status(429).json({ error:'今日额度用完(5次/天)', fallback:true });

  const ck = getCacheKey({cities,days,level,departure});
  const cached = checkCache(ck);
  if (cached) return res.json({...cached, source:'cache'});

  callQwen(buildPrompt(req.body), (err, result) => {
    if (err || !result) return res.json({ error:err?.message||'AI unavailable', fallback:true });
    let json = result.trim();
    if (json.startsWith('```')) json = json.replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'');
    try { const p=JSON.parse(json); setCache(ck,p); res.json({...p, source:'qwen'}); }
    catch(e) { res.json({ error:'AI返回非JSON', fallback:true }); }
  });
});

app.get('/api/status', (req, res) => {
  res.json({ status:'ok', qwen:!!QWEN_API_KEY, cache:cache.size });
});

module.exports = app;
