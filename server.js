// 申根行程助手 — 后端 API 服务
// 部署: Vercel / Cloudflare Workers / Node Express
// 启动: QWEN_API_KEY=xxx node server.js
// 模型: 阿里云百炼 Qwen-Plus (OpenAI Compatible API)

const express = require('express');
const cors = require('cors');
const https = require('https');
const crypto = require('crypto');

// Load .env in development
try { require('dotenv').config(); } catch(e) {}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50kb' }));

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const PORT = process.env.PORT || 8765;

// Qwen OpenAI Compatible API config
const QWEN_BASE = 'dashscope.aliyuncs.com';
const QWEN_PATH = '/compatible-mode/v1/chat/completions';
const QWEN_MODEL = 'qwen-plus';

// ===== Rate Limiting =====
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

// ===== Request Cache =====
const cache = new Map();

function getCacheKey(params) {
  const str = JSON.stringify(params);
  return crypto.createHash('md5').update(str).digest('hex');
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

// ===== Qwen API Call (OpenAI Compatible) =====
function callQwen(prompt, callback) {
  if (!QWEN_API_KEY) {
    callback(null, null);
    return;
  }

  const body = JSON.stringify({
    model: QWEN_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4000
  });

  const req = https.request({
    hostname: QWEN_BASE,
    port: 443,
    path: QWEN_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + QWEN_API_KEY
    },
    timeout: 30000
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (res.statusCode !== 200) {
          console.error('Qwen API error:', res.statusCode, json.error?.message || json.message);
          callback(new Error(json.error?.message || 'API error ' + res.statusCode), null);
          return;
        }
        const content = json.choices?.[0]?.message?.content;
        callback(null, content);
      } catch(e) {
        callback(e, null);
      }
    });
  });

  req.on('error', (e) => callback(e, null));
  req.on('timeout', () => { req.destroy(); callback(new Error('API timeout'), null); });
  req.write(body);
  req.end();
}

// ===== Build AI Prompt =====
function buildPrompt(itinerary, days, level, departure, startDate) {
  const levelMap = {
    budget: '经济型(住宿350元/晚, 餐饮150元/天)',
    mid: '舒适型(住宿750元/晚, 餐饮300元/天)',
    luxury: '豪华型(住宿1800元/晚, 餐饮600元/天)'
  };

  return `你是欧洲申根签证行程规划专家。

必须返回合法JSON。不要Markdown。不要解释。不要代码块。

参数:
- 旅行天数: ${days}天
- 预算: ${levelMap[level] || level}
- 出发城市: ${departure} (中国)
- 出发日期: ${startDate}

基础行程:
${JSON.stringify(itinerary, null, 2)}

请为每天补充:
1. hotel_area: 靠近景点的区域（真实地名，如"7th arrondissement"或"米兰中央车站附近"）
2. activities: 2-4个具体景点（中英双语，如"Eiffel Tower 埃菲尔铁塔"）
3. transport: 实际交通方式（注意威尼斯是水城，用Vaporetto不写Metro）
4. accommodation_summary: N晚住宿说明（如"2 nights in Milan (6.15-6.17)"）

返回格式:
{
  "route": "城市1 → 城市2 → ...",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "city": "城市名, 国家",
      "touringSpots": ["景点1", "景点2"],
      "accommodation": "住宿详情",
      "transportation": "交通详情"
    }
  ]
}

只返回JSON。`;
}

// ===== API Endpoint =====
app.post('/api/generate-itinerary', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const { cities, days, level, departure, startDate, localItinerary } = req.body;

  if (!cities || !days) {
    return res.status(400).json({ error: 'Missing required fields: cities, days' });
  }

  // Rate limit check
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: '今日免费额度已用完（5次/天），请明天再试或使用本地规则引擎',
      fallback: true
    });
  }

  // Check cache
  const cacheKey = getCacheKey({ cities, days, level, departure });
  const cached = checkCache(cacheKey);
  if (cached) {
    console.log(`[${new Date().toISOString()}] Cache hit for ${ip}`);
    return res.json({ ...cached, source: 'cache' });
  }

  // Build prompt
  const prompt = buildPrompt(localItinerary || { days: [] }, days, level, departure, startDate);

  // Call Qwen
  console.log(`[${new Date().toISOString()}] Calling Qwen for ${ip}...`);
  callQwen(prompt, (err, content) => {
    if (err || !content) {
      console.log(`[${new Date().toISOString()}] Qwen failed, returning fallback signal`);
      return res.json({
        error: err?.message || 'AI service unavailable',
        fallback: true
      });
    }

    // Parse response
    let json = content.trim();
    if (json.startsWith('```')) json = json.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');

    try {
      const result = JSON.parse(json);
      setCache(cacheKey, result);
      console.log(`[${new Date().toISOString()}] Qwen success for ${ip}`);
      res.json({ ...result, source: 'qwen' });
    } catch(e) {
      console.error('Failed to parse Qwen response:', e.message);
      res.json({
        error: 'AI returned invalid format, using local generation',
        fallback: true
      });
    }
  });
});

// Health check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    qwen_configured: !!QWEN_API_KEY,
    model: QWEN_MODEL,
    cache_size: cache.size
  });
});

// ===== Start =====
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 申根行程 API 已启动 → http://localhost:${PORT}`);
    console.log(`   千问API: ${QWEN_API_KEY ? '✅ 已配置' : '⚠ 未配置（将使用本地规则）'}`);
    console.log(`   模型: ${QWEN_MODEL}`);
    console.log(`   POST /api/generate-itinerary`);
    console.log(`   GET  /api/status`);
  });
}

module.exports = app;
