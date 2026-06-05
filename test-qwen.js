// 千问 API 测试脚本
// 用法: QWEN_API_KEY=sk-xxx node test-qwen.js
const { callQwen, buildPrompt } = require('./server.js');

const testItinerary = {
  cities: ['米兰', '威尼斯', '佛罗伦萨', '罗马'],
  days: 10,
  level: 'mid',
  departure: '上海',
  startDate: '2026-07-01',
  localItinerary: {
    days: [
      { day: 1, date: '2026-07-01', city: '米兰, 意大利', spots: 'Duomo di Milano 米兰大教堂\nGalleria Vittorio Emanuele II 埃马努埃莱二世拱廊' },
      { day: 2, date: '2026-07-02', city: '米兰, 意大利', spots: 'Castello Sforzesco 斯福尔扎城堡\nParco Sempione 森皮奥内公园' },
      { day: 3, date: '2026-07-03', city: '威尼斯, 意大利', spots: 'Piazza San Marco 圣马可广场\nPonte di Rialto 里亚托桥' },
      { day: 4, date: '2026-07-04', city: '威尼斯, 意大利', spots: 'Ponte dei Sospiri 叹息桥\nBurano Island 彩色岛' },
      { day: 5, date: '2026-07-05', city: '佛罗伦萨, 意大利', spots: 'Duomo 圣母百花大教堂\nPonte Vecchio 老桥' },
      { day: 6, date: '2026-07-06', city: '佛罗伦萨, 意大利', spots: 'Uffizi Gallery 乌菲兹美术馆\nPiazzale Michelangelo 米开朗基罗广场' },
      { day: 7, date: '2026-07-07', city: '罗马, 意大利', spots: 'Colosseo 斗兽场\nRoman Forum 古罗马广场' },
      { day: 8, date: '2026-07-08', city: '罗马, 意大利', spots: 'Vatican Museums 梵蒂冈博物馆\nSt. Peter Basilica 圣彼得大教堂' },
      { day: 9, date: '2026-07-09', city: '罗马, 意大利', spots: 'Trevi Fountain 特雷维喷泉\nSpanish Steps 西班牙广场' },
      { day: 10, date: '2026-07-10', city: '罗马, 意大利', spots: 'Pantheon 万神殿\nPiazza Navona 纳沃纳广场' }
    ]
  }
};

console.log('=== 发送给千问的 Prompt ===');
const prompt = buildPrompt(testItinerary);
console.log(prompt.substring(0, 500) + '...\n');

console.log('=== 调用千问 API ===');
callQwen(prompt, (err, result) => {
  if (err) {
    console.error('❌ 失败:', err.message);
    process.exit(1);
  }
  if (!result) {
    console.log('⚠️ QWEN_API_KEY 未设置，返回空');
    process.exit(0);
  }
  console.log('✅ 成功! 返回长度:', result.length, '字符');
  console.log('=== 千问原始返回(前1000字符) ===');
  console.log(result.substring(0, 1000));
  
  // Try to parse JSON
  try {
    let json = result.trim();
    if (json.startsWith('```')) json = json.replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'');
    const parsed = JSON.parse(json);
    console.log('\n=== 解析成功 ===');
    console.log('Route:', parsed.route);
    console.log('Days:', parsed.days?.length);
    if (parsed.days?.[0]) {
      console.log('Day 1 spots:', parsed.days[0].touringSpots);
      console.log('Day 1 accommodation:', parsed.days[0].accommodation?.substring(0, 100));
      console.log('Day 1 transportation:', parsed.days[0].transportation?.substring(0, 100));
    }
  } catch(e) {
    console.log('JSON解析失败:', e.message);
  }
});
