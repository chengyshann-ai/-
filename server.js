// 申根行程助手 — 后端 API 服务
// 启动: QWEN_API_KEY=xxx node server.js
// 部署: Vercel (vercel.json 已配置)

const express = require('express');
const cors = require('cors');
const https = require('https');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50kb' }));

// ===== 静态文件 =====
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== 配置 =====
const QWEN_API_KEY = process.env.QWEN_API_KEY;

// ===== 限流 =====
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

// ===== 请求缓存 =====
const cache = new Map();
function getCacheKey(params) {
  return crypto.createHash('md5').update(JSON.stringify(params)).digest('hex');
}
function checkCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) {
    cache.delete(key);
    return null;
  }
  return entry.result;
}
function setCache(key, result) {
  cache.set(key, { result, timestamp: Date.now() });
  if (cache.size > 100) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now - v.timestamp > 24 * 60 * 60 * 1000) cache.delete(k);
    }
  }
}

// ===== 构建 prompt =====
function buildPrompt({ cities, days, level, departure, startDate, localItinerary }) {
  const levelMap = {
    budget: '经济型(住宿350元/晚)',
    mid: '舒适型(住宿750元/晚)',
    luxury: '豪华型(住宿1800元/晚)'
  };
  let prompt = '你是欧洲申根签证行程规划专家。必须返回合法JSON。不要Markdown。\n\n';
  prompt += '参数:\n- 天数: ' + days + '\n- 预算: ' + (levelMap[level] || level) + '\n';
  prompt += '- 路线: ' + departure + ' → ' + (cities || []).join(' → ') + '\n- 出发: ' + startDate + '\n';
  if (localItinerary && localItinerary.days) {
    prompt += '\n基础行程:\n' + JSON.stringify(localItinerary, null, 2) + '\n请补充 hotel_area、transportation、activities。';
  } else {
    prompt += '\n请从零规划完整行程JSON。';
  }
  prompt += '\n\n格式: {"route":"...","days":[{"day":1,"date":"YYYY-MM-DD","city":"城市,国家","touringSpots":["景点"],"accommodation":"住宿","transportation":"交通"}]}\n只返回JSON。';
  return prompt;
}

// ===== Qwen API =====
function callQwen(prompt, callback) {
  if (!QWEN_API_KEY) return callback(null, null);

  const body = JSON.stringify({
    model: 'qwen-plus',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4000
  });

  const req = https.request({
    hostname: 'dashscope.aliyuncs.com',
    port: 443,
    path: '/compatible-mode/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + QWEN_API_KEY
    },
    timeout: 30000
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (res.statusCode !== 200) {
          console.error('Qwen error:', json.error?.message || json.message);
          return callback(new Error(json.error?.message || 'API error'), null);
        }
        callback(null, json.choices?.[0]?.message?.content);
      } catch(e) { callback(e, null); }
    });
  });
  req.on('error', e => callback(e, null));
  req.write(body);
  req.end();
}

// ===== API 路由 =====
app.post('/api/generate-itinerary', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
  const { cities, days } = req.body;
  if (!cities || !days) return res.status(400).json({ error: '缺少城市或天数', fallback: true });

  if (!checkRateLimit(ip)) return res.status(429).json({ error: '今日额度已用完(5次/天)', fallback: true });

  const cacheKey = getCacheKey({ cities, days, level: req.body.level, departure: req.body.departure });
  const cached = checkCache(cacheKey);
  if (cached) return res.json({ ...cached, source: 'cache' });

  const prompt = buildPrompt(req.body);

  callQwen(prompt, (err, result) => {
    if (err || !result) return res.json({ error: err?.message || 'AI unavailable', fallback: true });

    let json = result.trim();
    if (json.startsWith('```')) json = json.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');

    try {
      const parsed = JSON.parse(json);
      setCache(cacheKey, parsed);
      res.json({ ...parsed, source: 'qwen' });
    } catch(e) {
      res.json({ error: 'AI返回非JSON', fallback: true });
    }
  });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', qwen: !!QWEN_API_KEY, cache: cache.size });
});

// Vercel 导出；本地开发时启动监听
if (require.main === module) {
  const PORT = process.env.PORT || 8765;
  app.listen(PORT, () => {
    console.log('🚀 http://localhost:' + PORT);
    console.log('千问API:', QWEN_API_KEY ? '✅' : '⚠');
  });
}

module.exports = app;
