// 申根行程助手 — 前端逻辑

// ==================== FULL SCHENGEN DATA (29 countries, 100+ cities) ====================
var DATA = {
  AT:{name:'奥地利',en:'Austria',capital:'维也纳',cities:[
    {n:'维也纳',en:'Vienna',lat:48.2082,lng:16.3738,spots:['Schönbrunn Palace 美泉宫','Hofburg 霍夫堡皇宫','Stephansdom 圣斯蒂芬大教堂','Belvedere 美景宫','Musikverein 金色大厅','Prater 普拉特公园','Kunsthistorisches Museum 艺术史博物馆','Naschmarkt 纳什市场','Staatsoper 国家歌剧院','Hundertwasserhaus 百水公寓']},
    {n:'萨尔茨堡',en:'Salzburg',lat:47.8095,lng:13.0550,spots:['Festung Hohensalzburg 萨尔茨堡要塞','Mirabell Palace 米拉贝尔宫','Mozarts Geburtshaus 莫扎特故居','Hellbrunn Palace 海尔布伦宫','Getreidegasse 粮食胡同','Salzburg Cathedral 萨尔茨堡大教堂']},
    {n:'哈尔施塔特',en:'Hallstatt',lat:47.5622,lng:13.6493,spots:['Hallstätter See 哈尔施塔特湖','Salzwelten 盐矿','Skywalk 观景台','Market Square 集市广场','Beinhaus 人骨教堂']}
  ]},
  BE:{name:'比利时',en:'Belgium',capital:'布鲁塞尔',cities:[
    {n:'布鲁塞尔',en:'Brussels',lat:50.8503,lng:4.3517,spots:['Grand Place 大广场','Atomium 原子球塔','Manneken Pis 撒尿小童','Parc du Cinquantenaire 五十周年纪念公园','Royal Palace 皇宫','Musée Magritte 马格里特博物馆','EU Quarter 欧盟区','Galeries Royales 圣于贝尔长廊']},
    {n:'布鲁日',en:'Bruges',lat:51.2093,lng:3.2247,spots:['Belfry 钟楼','Minnewater 爱之湖','Basilica of the Holy Blood 圣血教堂','Canal Boat Tour 运河游船','Markt 集市广场','Groeninge Museum 格罗宁格博物馆']}
  ]},
  BG:{name:'保加利亚',en:'Bulgaria',capital:'索非亚',cities:[
    {n:'索非亚',en:'Sofia',lat:42.6977,lng:23.3219,spots:['Alexander Nevsky Cathedral 涅夫斯基大教堂','Vitosha Boulevard 维托沙大道','Boyana Church 博亚纳教堂','National Palace of Culture 国家文化宫','St. George Rotunda 圣乔治圆厅','Vitosha Mountain 维托沙山']}
  ]},
  HR:{name:'克罗地亚',en:'Croatia',capital:'萨格勒布',cities:[
    {n:'杜布罗夫尼克',en:'Dubrovnik',lat:42.6507,lng:18.0944,spots:['City Walls 古城墙','Stradun 斯特拉顿街','Fort Lovrijenac 要塞','Cable Car 缆车','Lokrum Island 洛克鲁姆岛','Rector\'s Palace 总督宫','Banje Beach 班杰海滩']},
    {n:'萨格勒布',en:'Zagreb',lat:45.8150,lng:15.9819,spots:['Upper Town 上城区','St. Marks Church 圣马可教堂','Dolac Market 多拉克市场','Museum of Broken Relationships 失恋博物馆','Zagreb Cathedral 大教堂','Mirogoj Cemetery 米罗戈伊公墓']},
    {n:'斯普利特',en:'Split',lat:43.5081,lng:16.4402,spots:['Diocletian\'s Palace 戴克里先宫','Riva 海滨大道','Marjan Hill 马尔扬山','Bacvice Beach 巴奇维斯海滩','Mestrovic Gallery 梅什特罗维奇美术馆']}
  ]},
  CZ:{name:'捷克',en:'Czechia',capital:'布拉格',cities:[
    {n:'布拉格',en:'Prague',lat:50.0755,lng:14.4378,spots:['Charles Bridge 查理大桥','Prague Castle 布拉格城堡','Old Town Square 老城广场','Astronomical Clock 天文钟','Dancing House 跳舞的房子','Vyšehrad 高堡','Petřín Hill 佩特任山','Jewish Quarter 犹太区','Lennon Wall 列侬墙','Wenceslas Square 瓦茨拉夫广场']},
    {n:'CK小镇',en:'Český Krumlov',lat:48.8127,lng:14.3176,spots:['Český Krumlov Castle 城堡','Vltava River 伏尔塔瓦河','Cloak Bridge 斗篷桥','Eggenberg Brewery 啤酒厂','Regional Museum 地区博物馆']}
  ]},
  DK:{name:'丹麦',en:'Denmark',capital:'哥本哈根',cities:[
    {n:'哥本哈根',en:'Copenhagen',lat:55.6761,lng:12.5683,spots:['Little Mermaid 小美人鱼','Nyhavn 新港','Tivoli Gardens 蒂沃利公园','Christiansborg Palace 克里斯蒂安堡宫','Rosenborg Castle 罗森堡宫','Freetown Christiania 自由城','Strøget 步行街','Amalienborg Palace 阿美琳堡']}
  ]},
  EE:{name:'爱沙尼亚',en:'Estonia',capital:'塔林',cities:[
    {n:'塔林',en:'Tallinn',lat:59.4370,lng:24.7536,spots:['Tallinn Old Town 塔林老城','Toompea Castle 座堂山城堡','Nevsky Cathedral 涅夫斯基大教堂','Town Hall Square 市政厅广场','Kadriorg Palace 卡德里奥宫','Seaplane Harbour 水上飞机港','Telliskivi Creative City 创意城']}
  ]},
  FI:{name:'芬兰',en:'Finland',capital:'赫尔辛基',cities:[
    {n:'赫尔辛基',en:'Helsinki',lat:60.1699,lng:24.9384,spots:['Helsinki Cathedral 大教堂','Suomenlinna 芬兰堡','Temppeliaukio Church 岩石教堂','Market Square 集市广场','Seurasaari Open-Air Museum 伴侣岛露天博物馆','Löyly Sauna 蒸汽桑拿','Design District 设计区']}
  ]},
  FR:{name:'法国',en:'France',capital:'巴黎',cities:[
    {n:'巴黎',en:'Paris',lat:48.8566,lng:2.3522,spots:['Eiffel Tower 埃菲尔铁塔','Louvre Museum 卢浮宫','Arc de Triomphe 凯旋门','Notre-Dame 巴黎圣母院','Montmartre 蒙马特高地','Seine River Cruise 塞纳河游船','Musée d\'Orsay 奥赛博物馆','Sacré-Cœur 圣心大教堂','Versailles 凡尔赛宫','Le Marais 玛黑区','Luxembourg Gardens 卢森堡公园','Latin Quarter 拉丁区']},
    {n:'尼斯',en:'Nice',lat:43.7102,lng:7.2620,spots:['Promenade des Anglais 英国人漫步大道','Old Town 老城区','Castle Hill 城堡山','Baie des Anges 天使湾','Cours Saleya Market 萨莱亚市场','Matisse Museum 马蒂斯博物馆','Villefranche-sur-Mer 滨海自由城']},
    {n:'里昂',en:'Lyon',lat:45.7640,lng:4.8357,spots:['Basilique Notre-Dame de Fourvière 富维耶圣母院','Vieux Lyon 老城区','Place Bellecour 白莱果广场','Parc de la Tête d\'Or 金头公园','Traboules 秘密通道','Musée des Confluences 汇流博物馆']}
  ]},
  DE:{name:'德国',en:'Germany',capital:'柏林',cities:[
    {n:'柏林',en:'Berlin',lat:52.5200,lng:13.4050,spots:['Brandenburg Gate 勃兰登堡门','Berlin Wall Memorial 柏林墙遗址','Museum Island 博物馆岛','Reichstag Building 国会大厦','Checkpoint Charlie 查理检查站','East Side Gallery 东边画廊','Potsdamer Platz 波茨坦广场','Tiergarten 蒂尔加滕公园','Charlottenburg Palace 夏洛滕堡宫']},
    {n:'慕尼黑',en:'Munich',lat:48.1351,lng:11.5820,spots:['Marienplatz 玛利亚广场','Neues Rathaus 新市政厅','Englischer Garten 英国花园','BMW Museum 宝马博物馆','Nymphenburg Palace 宁芬堡宫','Viktualienmarkt 谷物市场','Pinakothek 绘画陈列馆','Olympiapark 奥林匹克公园']},
    {n:'法兰克福',en:'Frankfurt',lat:50.1109,lng:8.6821,spots:['Römerberg 罗马广场','Eurotower 欧元塔','Main River 美因河','Goethe House 歌德故居','Städel Museum 施泰德博物馆','Palmengarten 棕榈园','Main Tower 美因塔']},
    {n:'汉堡',en:'Hamburg',lat:53.5511,lng:9.9937,spots:['Miniatur Wunderland 微缩景观世界','Elbphilharmonie 易北爱乐厅','Speicherstadt 仓库城','Fish Market 鱼市场','HafenCity 港口新城','Reeperbahn 绳索街','Planten un Blomen 花卉植物园']}
  ]},
  GR:{name:'希腊',en:'Greece',capital:'雅典',cities:[
    {n:'雅典',en:'Athens',lat:37.9838,lng:23.7275,spots:['Acropolis 雅典卫城','Parthenon 帕特农神庙','Syntagma Square 宪法广场','Plaka 普拉卡老城区','Acropolis Museum 卫城博物馆','Ancient Agora 古市集','Mount Lycabettus 利卡维多斯山','Monastiraki Flea Market 跳蚤市场']},
    {n:'圣托里尼',en:'Santorini',lat:36.3932,lng:25.4615,spots:['Oia Sunset 伊亚日落','Blue Domes 蓝顶教堂','Red Beach 红沙滩','Fira Town 费拉镇','Akrotiri Ruins 阿克罗蒂里遗址','Wine Tasting 圣岛品酒','Kamari Beach 卡马利海滩']}
  ]},
  HU:{name:'匈牙利',en:'Hungary',capital:'布达佩斯',cities:[
    {n:'布达佩斯',en:'Budapest',lat:47.4979,lng:19.0402,spots:['Parliament Building 国会大厦','Fisherman\'s Bastion 渔人堡','Chain Bridge 链子桥','Széchenyi Baths 塞切尼温泉浴场','Buda Castle 城堡山','Heroes\' Square 英雄广场','Great Market Hall 大市场','Gellért Hill 盖勒特山','Danube River Cruise 多瑙河游船']}
  ]},
  IS:{name:'冰岛',en:'Iceland',capital:'雷克雅未克',cities:[
    {n:'雷克雅未克',en:'Reykjavik',lat:64.1466,lng:-21.9426,spots:['Hallgrímskirkja 大教堂','Blue Lagoon 蓝湖温泉','Golden Circle 黄金圈','Northern Lights 北极光','Harpa Concert Hall 哈帕音乐厅','Perlan 珍珠楼','Whale Watching 观鲸之旅']}
  ]},
  IT:{name:'意大利',en:'Italy',capital:'罗马',cities:[
    {n:'罗马',en:'Rome',lat:41.9028,lng:12.4964,spots:['Colosseo 斗兽场','Vatican Museums 梵蒂冈博物馆','Trevi Fountain 特雷维喷泉','Spanish Steps 西班牙广场','Pantheon 万神殿','Roman Forum 古罗马广场','Piazza Navona 纳沃纳广场','Borghese Gallery 博尔盖塞美术馆','Castel Sant\'Angelo 圣天使城堡','Trastevere 台伯河岸区','Capitoline Hill 卡比托利欧山']},
    {n:'威尼斯',en:'Venice',lat:45.4408,lng:12.3155,spots:['Piazza San Marco 圣马可广场','Grand Canal 大运河','Ponte dei Sospiri 叹息桥','Ponte di Rialto 里亚托桥','Gondola 贡多拉','Doge\'s Palace 总督宫','Burano Island 彩色岛','Peggy Guggenheim 古根海姆美术馆']},
    {n:'佛罗伦萨',en:'Florence',lat:43.7696,lng:11.2558,spots:['Duomo 圣母百花大教堂','Uffizi Gallery 乌菲兹美术馆','Ponte Vecchio 老桥','Piazzale Michelangelo 米开朗基罗广场','Accademia Gallery 学院美术馆','Palazzo Vecchio 旧宫','Boboli Gardens 波波里花园','Santa Croce 圣十字教堂']},
    {n:'米兰',en:'Milan',lat:45.4642,lng:9.1900,spots:['Duomo di Milano 米兰大教堂','Galleria Vittorio Emanuele II 埃马努埃莱二世拱廊','Castello Sforzesco 斯福尔扎城堡','Santa Maria delle Grazie 感恩圣母堂','Parco Sempione 森皮奥内公园','Brera District 布雷拉区','Navigli Canals 纳维利运河区','Pinacoteca di Brera 布雷拉美术馆']},
    {n:'那不勒斯',en:'Naples',lat:40.8518,lng:14.2681,spots:['Pompeii 庞贝古城','Museo Archeologico Nazionale 国家考古博物馆','Spaccanapoli 斯帕卡纳波利老街','Piazza del Plebiscito 平民表决广场','Isola di Capri 卡普里岛','Castel dell\'Ovo 蛋堡','Underground Naples 地下那不勒斯']}
  ]},
  LV:{name:'拉脱维亚',en:'Latvia',capital:'里加',cities:[
    {n:'里加',en:'Riga',lat:56.9496,lng:24.1052,spots:['Riga Old Town 里加老城','House of the Blackheads 黑头宫','Central Market 中央市场','Art Nouveau District 新艺术区','Freedom Monument 自由纪念碑','Latvian Ethnographic Museum 民族博物馆']}
  ]},
  LI:{name:'列支敦士登',en:'Liechtenstein',capital:'瓦杜兹',cities:[
    {n:'瓦杜兹',en:'Vaduz',lat:47.1410,lng:9.5215,spots:['Vaduz Castle 瓦杜兹城堡','Kunstmuseum 艺术博物馆','Postage Stamp Museum 邮票博物馆','Alte Rheinbrücke 莱茵河老桥']}
  ]},
  LT:{name:'立陶宛',en:'Lithuania',capital:'维尔纽斯',cities:[
    {n:'维尔纽斯',en:'Vilnius',lat:54.6872,lng:25.2797,spots:['Vilnius Old Town 老城','Gediminas Tower 格迪米纳斯塔','Užupis 对岸共和国','Gate of Dawn 黎明门','Vilnius Cathedral 大教堂','Museum of Genocide Victims 种族屠杀博物馆']}
  ]},
  LU:{name:'卢森堡',en:'Luxembourg',capital:'卢森堡市',cities:[
    {n:'卢森堡市',en:'Luxembourg City',lat:49.6117,lng:6.1300,spots:['Bock Casemates 博克要塞','Grand Ducal Palace 大公宫殿','Chemin de la Corniche 风景走廊','Place d\'Armes 兵器广场','MUDAM 现代艺术博物馆','Pétrusse Valley 佩特吕斯河谷']}
  ]},
  MT:{name:'马耳他',en:'Malta',capital:'瓦莱塔',cities:[
    {n:'瓦莱塔',en:'Valletta',lat:35.8997,lng:14.5147,spots:['St. John\'s Co-Cathedral 圣约翰大教堂','Upper Barrakka Gardens 上巴拉卡花园','Grand Harbour 大港','Mdina 姆迪纳古城','Blue Grotto 蓝洞','Marsaxlokk 渔村']}
  ]},
  NL:{name:'荷兰',en:'Netherlands',capital:'阿姆斯特丹',cities:[
    {n:'阿姆斯特丹',en:'Amsterdam',lat:52.3676,lng:4.9041,spots:['Van Gogh Museum 梵高博物馆','Rijksmuseum 国立博物馆','Anne Frank House 安妮之家','Canal Cruise 运河游船','Dam Square 水坝广场','Jordaan District 约旦区','Vondelpark 冯德尔公园','A\'DAM Lookout 阿丹观景台']},
    {n:'鹿特丹',en:'Rotterdam',lat:51.9244,lng:4.4777,spots:['Cube Houses 立方屋','Erasmus Bridge 伊拉斯谟桥','Markthal 市场大厅','Euromast 欧洲桅杆','Delfshaven 代尔夫斯港']}
  ]},
  NO:{name:'挪威',en:'Norway',capital:'奥斯陆',cities:[
    {n:'奥斯陆',en:'Oslo',lat:59.9139,lng:10.7522,spots:['Vigeland Sculpture Park 维格兰雕塑公园','Oslo Opera House 歌剧院','Munch Museum 蒙克博物馆','Akershus Fortress 城堡','Viking Ship Museum 维京船博物馆','Holmenkollen 跳台滑雪场','Fram Museum 极地船博物馆']},
    {n:'卑尔根',en:'Bergen',lat:60.3913,lng:5.3221,spots:['Bryggen Wharf 布吕根码头','Mount Fløyen 弗洛伊恩山','Fish Market 鱼市场','Fjord Cruise 峡湾游船','Mount Ulriken 乌尔里肯山','Fantoft Stave Church 木板教堂']}
  ]},
  PL:{name:'波兰',en:'Poland',capital:'华沙',cities:[
    {n:'华沙',en:'Warsaw',lat:52.2297,lng:21.0122,spots:['Warsaw Old Town 老城','Royal Castle 皇家城堡','Łazienki Park 瓦津基公园','Palace of Culture 科学文化宫','POLIN Museum 波兰犹太人博物馆','Warsaw Uprising Museum 起义博物馆']},
    {n:'克拉科夫',en:'Krakow',lat:50.0647,lng:19.9450,spots:['Wawel Castle 瓦维尔城堡','Main Square 中央广场','Wieliczka Salt Mine 维利奇卡盐矿','Auschwitz Memorial 奥斯维辛纪念馆','Kazimierz 卡齐米日犹太区','Schindler\'s Factory 辛德勒工厂']}
  ]},
  PT:{name:'葡萄牙',en:'Portugal',capital:'里斯本',cities:[
    {n:'里斯本',en:'Lisbon',lat:38.7223,lng:-9.1393,spots:['Belém Tower 贝伦塔','Jerónimos Monastery 热罗尼莫斯修道院','Alfama 阿尔法玛老城','Tram 28 28路电车','Cabo da Roca 罗卡角','São Jorge Castle 圣乔治城堡','LX Factory 创意园区','Time Out Market 美食市场']},
    {n:'波尔图',en:'Porto',lat:41.1579,lng:-8.6291,spots:['Dom Luís I Bridge 路易一世大桥','Ribeira Square 里贝拉广场','Livraria Lello 莱罗书店','Port Wine Cellars 波特酒窖','São Bento Station 圣本笃车站','Clérigos Tower 牧师塔','Serralves Museum 塞拉维斯博物馆']}
  ]},
  RO:{name:'罗马尼亚',en:'Romania',capital:'布加勒斯特',cities:[
    {n:'布加勒斯特',en:'Bucharest',lat:44.4268,lng:26.1025,spots:['Palace of the Parliament 议会宫','Old Town 老城区','Romanian Athenaeum 雅典娜神庙','Village Museum 乡村博物馆','Herăstrău Park 赫拉斯特劳公园']}
  ]},
  SK:{name:'斯洛伐克',en:'Slovakia',capital:'布拉迪斯拉发',cities:[
    {n:'布拉迪斯拉发',en:'Bratislava',lat:48.1486,lng:17.1077,spots:['Bratislava Castle 城堡','Old Town 老城区','UFO Bridge 飞碟桥','Blue Church 蓝色教堂','Slavin Memorial 斯拉文纪念碑','Danube Promenade 多瑙河滨水区']}
  ]},
  SI:{name:'斯洛文尼亚',en:'Slovenia',capital:'卢布尔雅那',cities:[
    {n:'卢布尔雅那',en:'Ljubljana',lat:46.0569,lng:14.5058,spots:['Ljubljana Castle 城堡','Triple Bridge 三重桥','Dragon Bridge 龙桥','Tivoli Park 蒂沃利公园','Metelkova Art Center 梅特尔科瓦艺术中心','Central Market 中央市场']},
    {n:'布莱德湖',en:'Lake Bled',lat:46.3636,lng:14.0938,spots:['Bled Castle 布莱德城堡','Bled Island 布莱德岛','Lake Bled 布莱德湖','Vintgar Gorge 文特加峡谷','Bohinj Lake 博希尼湖','Straža Hill 斯特拉扎山']}
  ]},
  ES:{name:'西班牙',en:'Spain',capital:'马德里',cities:[
    {n:'巴塞罗那',en:'Barcelona',lat:41.3874,lng:2.1686,spots:['Sagrada Família 圣家堂','Park Güell 奎尔公园','Casa Batlló 巴特罗之家','La Rambla 兰布拉大道','Gothic Quarter 哥特区','La Boqueria 波盖利亚市场','Casa Milà 米拉之家','Montjuïc 蒙锥克山','Barceloneta Beach 海滩','Camp Nou 诺坎普球场','Palau de la Música 音乐宫']},
    {n:'马德里',en:'Madrid',lat:40.4168,lng:-3.7038,spots:['Prado Museum 普拉多博物馆','Royal Palace 王宫','Puerta del Sol 太阳门广场','Retiro Park 丽池公园','Plaza Mayor 主广场','Reina Sofia Museum 索菲亚王后艺术中心','Gran Vía 格兰大道','Temple of Debod 德波神庙']},
    {n:'塞维利亚',en:'Seville',lat:37.3891,lng:-5.9845,spots:['Seville Cathedral 大教堂','Plaza de España 西班牙广场','Real Alcázar 阿尔卡萨宫','Torre del Oro 黄金塔','Metropol Parasol 都市阳伞','Santa Cruz Quarter 圣克鲁斯区','Triana District 特里亚纳区']}
  ]},
  SE:{name:'瑞典',en:'Sweden',capital:'斯德哥尔摩',cities:[
    {n:'斯德哥尔摩',en:'Stockholm',lat:59.3293,lng:18.0686,spots:['Gamla Stan 老城','Vasa Museum 瓦萨博物馆','City Hall 市政厅','ABBA Museum 博物馆','Djurgården 动物园岛','Skansen 斯堪森露天博物馆','Fotografiska 摄影博物馆','Södermalm 南城']}
  ]},
  CH:{name:'瑞士',en:'Switzerland',capital:'伯尔尼',cities:[
    {n:'苏黎世',en:'Zurich',lat:47.3769,lng:8.5417,spots:['Lake Zurich 苏黎世湖','Bahnhofstrasse 班霍夫大街','Old Town 老城区','Kunsthaus 美术馆','Lindenhof 林登霍夫山','ETH Zurich 苏黎世联邦理工学院','Uetliberg 于特利山']},
    {n:'日内瓦',en:'Geneva',lat:46.2044,lng:6.1432,spots:['Jet d\'Eau 大喷泉','Palais des Nations 万国宫','St. Pierre Cathedral 圣彼得大教堂','Flower Clock 花钟','Patek Philippe Museum 百达翡丽博物馆','Old Town 老城区','CERN 欧洲核子研究中心']},
    {n:'因特拉肯',en:'Interlaken',lat:46.6863,lng:7.8632,spots:['Jungfraujoch 少女峰','Harder Kulm 哈德山','Paragliding 滑翔伞','Lake Thun 图恩湖','Lake Brienz 布里恩茨湖','Schynige Platte 施尼格普拉特']},
    {n:'卢塞恩',en:'Lucerne',lat:47.0502,lng:8.3093,spots:['Chapel Bridge 卡佩尔桥','Lion Monument 狮子纪念碑','Pilatus 皮拉图斯山','Lake Lucerne 琉森湖','Old Town 老城区','Swiss Transport Museum 交通博物馆','Rigi Mountain 瑞吉山']}
  ]}
};

var CODES = Object.keys(DATA);

// Country flag emojis
var FLAGS = {AT:'🇦🇹',BE:'🇧🇪',BG:'🇧🇬',HR:'🇭🇷',CZ:'🇨🇿',DK:'🇩🇰',EE:'🇪🇪',FI:'🇫🇮',FR:'🇫🇷',DE:'🇩🇪',GR:'🇬🇷',HU:'🇭🇺',IS:'🇮🇸',IT:'🇮🇹',LV:'🇱🇻',LI:'🇱🇮',LT:'🇱🇹',LU:'🇱🇺',MT:'🇲🇹',NL:'🇳🇱',NO:'🇳🇴',PL:'🇵🇱',PT:'🇵🇹',RO:'🇷🇴',SK:'🇸🇰',SI:'🇸🇮',ES:'🇪🇸',SE:'🇸🇪',CH:'🇨🇭'};

var DEPARTURE_CITIES = ['北京','上海','广州','深圳','成都','杭州','南京','武汉','重庆','西安','厦门','青岛','昆明','长沙','天津'];

// ==================== HOTEL DATA (budget/mid/luxury) ====================
var HOTELS = {
  budget:[
    {chain:'a&o Hostel',suffix:'Hostel'},{chain:'MEININGER Hotel',suffix:'Hotel'},
    {chain:'Generator Hostel',suffix:'Hostel'},{chain:'Wombats City Hostel',suffix:'Hostel'}
  ],
  mid:[
    {chain:'NH Collection',suffix:'Hotel'},{chain:'Mercure',suffix:'Hotel'},
    {chain:'Holiday Inn',suffix:'Hotel'},{chain:'Ibis Styles',suffix:'Hotel'},
    {chain:'Motel One',suffix:'Hotel'}
  ],
  luxury:[
    {chain:'Kempinski',suffix:'Hotel & Spa'},{chain:'Hilton',suffix:'Hotel & Resort'},
    {chain:'Marriott',suffix:'Grand Hotel'},{chain:'InterContinental',suffix:'Hotel'},
    {chain:'Radisson Blu',suffix:'Hotel'}
  ]
};

function getHotel(city, level, dayIdx) {
  var opts = HOTELS[level];
  var h = opts[dayIdx % opts.length];
  return h.chain + ' ' + city.en + ' ' + h.suffix;
}
function getHotelAddr(city, countryCode) {
  // Country-appropriate street names and formats
  var addrMap = {
    IT: { streets: ['Via Roma','Via Nazionale','Corso Italia','Via Garibaldi','Via Dante','Via Verdi','Via Cavour','Via Milano'], fmt: '{street} {num}, {zip} {city}, Italy' },
    FR: { streets: ['Rue de Rivoli','Avenue des Champs-Élysées','Boulevard Haussmann','Rue Saint-Honoré','Rue de la Paix','Avenue Victor Hugo'], fmt: '{num} {street}, {zip} {city}, France' },
    DE: { streets: ['Hauptstrasse','Berliner Strasse','Bahnhofstrasse','Goethestrasse','Schillerstrasse','Königsallee'], fmt: '{street} {num}, {zip} {city}, Germany' },
    ES: { streets: ['Gran Vía','Calle Mayor','Paseo de la Castellana','Calle de Alcalá','Rambla Catalunya','Avenida Diagonal'], fmt: '{street} {num}, {zip} {city}, Spain' },
    AT: { streets: ['Mariahilfer Strasse','Kärntner Strasse','Ringstrasse','Graben','Herrengasse'], fmt: '{street} {num}, {zip} {city}, Austria' },
    CH: { streets: ['Bahnhofstrasse','Rue du Rhône','Pilatusstrasse','Limmatquai','Bundesplatz'], fmt: '{street} {num}, {zip} {city}, Switzerland' },
    NL: { streets: ['Damrak','Prinsengracht','Keizersgracht','Herengracht','Leidsestraat'], fmt: '{street} {num}, {zip} {city}, Netherlands' },
    PT: { streets: ['Avenida da Liberdade','Rua Augusta','Rua Garrett','Avenida dos Aliados'], fmt: '{street} {num}, {zip} {city}, Portugal' },
    GR: { streets: ['Ermou Street','Adrianou Street','Mitropoleos Street','Vasilissis Sofias Avenue'], fmt: '{street} {num}, {zip} {city}, Greece' },
    CZ: { streets: ['Václavské náměstí','Pařížská','Národní třída','Jungmannova'], fmt: '{street} {num}, {zip} {city}, Czech Republic' },
    HU: { streets: ['Andrássy út','Váci utca','Kossuth Lajos utca','Rákóczi út'], fmt: '{street} {num}, {zip} {city}, Hungary' },
    PL: { streets: ['Marszałkowska','Krakowskie Przedmieście','Nowy Świat','Aleje Jerozolimskie'], fmt: '{street} {num}, {zip} {city}, Poland' },
    SE: { streets: ['Drottninggatan','Kungsgatan','Sveavägen','Birger Jarlsgatan'], fmt: '{street} {num}, {zip} {city}, Sweden' },
    DK: { streets: ['Strøget','Vesterbrogade','Nørrebrogade','Østerbrogade'], fmt: '{street} {num}, {zip} {city}, Denmark' },
    NO: { streets: ['Karl Johans gate','Bogstadveien','Hegdehaugsveien','Drammensveien'], fmt: '{street} {num}, {zip} {city}, Norway' },
    FI: { streets: ['Mannerheimintie','Aleksanterinkatu','Esplanadi','Bulevardi'], fmt: '{street} {num}, {zip} {city}, Finland' },
  };
  var c = countryCode || 'IT';
  var map = addrMap[c] || { streets: ['High Street','Main Street','Park Lane','Church Street'], fmt: '{num} {street}, {zip} {city}' };
  var idx = Math.abs((city.lat * 100) % map.streets.length) | 0;
  var num = 10 + Math.abs((city.lng * 37) % 190) | 0;
  var zip = (c === 'DE' || c === 'AT') ? (10000 + Math.abs(city.lat * 1000 % 90000) | 0) : (10000 + Math.abs(city.lng * 700 % 90000) | 0);
  return map.fmt.replace('{street}', map.streets[idx]).replace('{num}', num).replace('{zip}', zip).replace('{city}', city.en);
}

// ==================== TRANSPORT (inter-city) ====================
function getIntercityTransport(from, to) {
  var d = Math.abs(from.lat - to.lat) + Math.abs(from.lng - to.lng);
  if (d < 8) {
    return 'Train: ______ (请填写车次)\n' + from.en + ' → ' + to.en + '\n市内: Walking / Metro';
  }
  if (d < 15) {
    return 'Train: ______ (请填写车次)\n' + from.en + ' Hbf → ' + to.en + ' Hbf\n市内: Walking / Metro';
  }
  return '✈ Flight: ______ (请填写航班号)\n' + from.en + ' → ' + to.en + '\n市内: Walking / Metro / Taxi';
}

// ==================== STATE ====================
var selectedCities = new Set();
var currentItin = null, currentItinId = null;
var currentLang = 'zh', isLiked = false;
var likeData = {}, recipeReg = {};
var toastTimer = null;

function loadLikes() { try { var d=localStorage.getItem('schengen_l3'); if(d) likeData=JSON.parse(d); } catch(e){} }
function saveLikes() { try { localStorage.setItem('schengen_l3',JSON.stringify(likeData)); } catch(e){} }
function loadRecipes() { try { var d=localStorage.getItem('schengen_r3'); if(d) recipeReg=JSON.parse(d); } catch(e){} }
loadLikes(); loadRecipes();

// ==================== CITY SELECTION ====================
function toggleCity(city) {
  if (!city || !city.n) return;
  // Find the checkbox for this city and toggle it
  var cb = document.querySelector('.city-cb[value="' + city.n + '"]');
  if (cb) {
    cb.checked = !cb.checked;
    if (cb.checked) selectedCities.add(city.n);
    else selectedCities.delete(city.n);
    var row = cb.parentElement;
    if (row) {
      if (cb.checked) row.classList.add('selected');
      else row.classList.remove('selected');
    }
  } else {
    if (selectedCities.has(city.n)) selectedCities.delete(city.n);
    else selectedCities.add(city.n);
    updateCityPanel();
  }
  updateSelectedDisplay();
}

function updateCityPanel() {
  var panel = document.getElementById('city-panel');
  if (!panel) return;
  var html = '';
  for (var i = 0; i < CODES.length; i++) {
    var code = CODES[i], country = DATA[code];
    html += '<div class="country-group"><div class="country-label" data-country="'+code+'"><span class="flag">'+(FLAGS[code]||'📍')+'</span> '+country.name+' <span style="font-weight:400;color:var(--text2);font-size:10px">'+country.cities.length+'城</span></div>';
    for (var j = 0; j < country.cities.length; j++) {
      var c = country.cities[j];
      var checked = selectedCities.has(c.n) ? ' checked' : '';
      var sel = checked ? ' selected' : '';
      html += '<label class="city-row'+sel+'">';
      html += '<input type="checkbox" class="city-cb" value="'+c.n+'"'+checked+' style="display:none">';
      html += '<span class="dot"></span>'+c.n;
      html += '</label>';
    }
    html += '</div>';
  }
  panel.innerHTML = html;
}

function updateSelectedDisplay() {
  document.getElementById('selected-count').textContent = selectedCities.size;
  var names = []; selectedCities.forEach(function(n){ names.push(n); });
  document.getElementById('selected-names').textContent = names.length > 0 ? names.join('、') : '未选择';
}


function selectAllCapitals() {
  for (var i = 0; i < CODES.length; i++) {
    var c = DATA[CODES[i]].cities[0];
    if (c && !selectedCities.has(c.n)) selectedCities.add(c.n);
  }
  updateCityPanel();
  updateSelectedDisplay();
}
// ==================== ITINERARY GENERATION ====================
function generateItinerary() {
  try {
  if (selectedCities.size === 0) { showToast('请至少选择一个城市'); return; }

  // Premium enforced by server (Redis counter)

  var daysEl = document.getElementById('days-input');
  var levelEl = document.getElementById('level-input');
  var depEl = document.getElementById('departure-input');
  var dateEl = document.getElementById('start-date-input');
  if (!daysEl || !levelEl || !depEl || !dateEl) { showToast('页面加载未完成，请刷新'); return; }
  var days = parseInt(daysEl.value);
  var level = levelEl.value;
  var departure = depEl.value;
  var startDate = dateEl.value;

  if (!startDate) { showToast('请选择出发日期'); return; }

  // === LOCAL generation ===
  if (selectedCities.size < 2) showToast('建议至少选择2个城市');

  // Build city list
  var cities = [];
  for (var i = 0; i < CODES.length; i++) {
    var code = CODES[i];
    for (var j = 0; j < DATA[code].cities.length; j++) {
      var c = DATA[code].cities[j];
      if (selectedCities.has(c.n)) cities.push({n:c.n,en:c.en,lat:c.lat,lng:c.lng,spots:c.spots,country:code,cname:DATA[code].name,cen:DATA[code].en});
    }
  }
  cities.sort(function(a,b){ return a.lng - b.lng; });

  // Generate days
  var daysPerCity = Math.max(1, Math.floor(days / cities.length));
  var extraDays = days - (daysPerCity * cities.length);
  var dayNum = 1, start = new Date(startDate + 'T00:00:00');
  var rows = [], stayGroups = [];

  for (var i = 0; i < cities.length; i++) {
    var city = cities[i], nDays = daysPerCity + (i < extraDays ? 1 : 0);
    var stayStartDay = dayNum, stayEndDay = dayNum + nDays - 1;
    var stayStartDate = new Date(start); stayStartDate.setDate(stayStartDate.getDate() + stayStartDay - 1);
    var stayEndDate = new Date(start); stayEndDate.setDate(stayEndDate.getDate() + stayEndDay - 1);
    var hotelInfo = getHotel(city, level, i) + '\nHotel Add: ' + getHotelAddr(city, city.country);

    var citySpotIdx = 0;
    for (var d = 0; d < nDays; d++) {
      var date = new Date(start); date.setDate(date.getDate() + dayNum - 1);
      var dateStr = date.toISOString().split('T')[0];
      var isFirstDay = d === 0, isLastDay = d === nDays - 1;
      var spots = city.spots || [];
      var touringSpots = '', transport = '';

      // Heavy spots (museums, ruins, full-day attractions) — avoid on transit days
      var isHeavySpot = function(s) {
        return /Museum|博物馆|美术馆|Gallery|Galleria|Vatican|梵蒂冈|Pompeii|庞贝|Versailles|凡尔赛|Jungfraujoch|少女峰|Uffizi|乌菲兹|Louvre|卢浮宫|Accademia|学院/.test(s);
      };
      // City-specific transport — Venice has no metro, only water transport
      var getLocalTransport = function(cityObj) {
        if (cityObj.n === '威尼斯' || cityObj.en === 'Venice')
          return 'Walking / Vaporetto (Water Bus) / Water Taxi';
        if (cityObj.en === 'Amsterdam' || cityObj.en === 'Rotterdam')
          return 'Walking / Tram / Metro / Bicycle';
        return 'Walking / Metro / Public Transportation';
      };
      // Take next N unused spots, optionally skip heavy attractions
      var takeSpots = function(n, skipHeavy) {
        var result = [];
        var tried = 0;
        while (result.length < n && citySpotIdx < spots.length && tried < spots.length) {
          var s = spots[citySpotIdx];
          citySpotIdx++;
          tried++;
          if (skipHeavy && isHeavySpot(s)) continue;
          result.push(s);
        }
        if (result.length === 0 && spots.length > 0) result.push('自由探索 ' + city.n + ' 老城区');
        return result.join('\n');
      };

      if (i === 0 && isFirstDay) {
        // Arrival day: fewer spots since travel takes time
        touringSpots = takeSpots(1, true);
        var arr = departure.split('').reduce(function(s,c){return s+c.charCodeAt(0);},0);
        transport = '✈ Flight: ______ (请填写航班号)\n' + departure + ' → ' + city.en + '\n机场至酒店: ______ (请填写交通方式)';
      } else if (isFirstDay && i > 0) {
        // Travel day: only 1 light spot, no museums
        touringSpots = takeSpots(1, true);
        transport = getIntercityTransport(cities[i-1], city);
      } else if (i === cities.length - 1 && isLastDay) {
        // Departure day: just 1-2 spots
        touringSpots = takeSpots(1);
        transport = (function() {
        var hubs = ['Paris','Frankfurt','Amsterdam','Rome','Milan','Madrid','Barcelona','Munich','Zurich','Vienna','Lisbon','Athens','Brussels','Copenhagen','Stockholm','Helsinki','Oslo','Warsaw','Budapest','Prague','Berlin'];
        if (hubs.indexOf(city.en) >= 0) {
          return '✈ Flight: ______ (请填写航班号)\n' + city.en + ' → ' + departure + '\n酒店至机场: Taxi / Airport Shuttle';
        }
        return '✈ Flight: ______ (请填写航班号)\n' + city.en + ' → (经停/转机: ______ 例如 Frankfurt/Munich/Istanbul)\n → ' + departure + '\n酒店至机场: Taxi / Airport Shuttle';
      })();
      } else {
        // Full sightseeing day: 3-4 spots
        touringSpots = takeSpots(3);
        transport = getLocalTransport(city);
      }

      rows.push({
        day: dayNum, date: dateStr, city: city.n + ', ' + city.cname, cityEn: city.en + ', ' + city.cen,
        spots: touringSpots || spots[0],
        hotel: (isFirstDay ? (nDays + ' nights in ' + city.en + ' (' + stayStartDate.toISOString().split('T')[0] + '-' + stayEndDate.toISOString().split('T')[0] + ')\n' + hotelInfo) : ''),
        transport: transport,
        country: city.cname, countryEn: city.cen,
        hotelShort: (isFirstDay ? getHotel(city, level, i) : '')
      });
      dayNum++;
    }
  }

  // Budget
  var hc={budget:350,mid:750,luxury:1800}, mc={budget:150,mid:300,luxury:600};
  var ltc={budget:80,mid:150,luxury:300}, icc={budget:350,mid:750,luxury:1800};
  var fc={budget:4000,mid:6000,luxury:15000}, ac={budget:500,mid:1500,luxury:3000};
  var b = {
    flight:fc[level], hotel:hc[level]*days, meals:mc[level]*days,
    localTransport:ltc[level]*days, interCity:icc[level]*Math.max(0,cities.length-1),
    attractions:ac[level], other:0
  };
  b.other = Math.round((b.hotel+b.meals+b.flight+b.interCity+b.attractions+b.localTransport)*0.12);
  b.total = b.flight+b.hotel+b.meals+b.localTransport+b.interCity+b.attractions+b.other;

  var routeKey = cities.map(function(c){ return c.n; }).join('-')+'|'+days+'|'+level;
  currentItinId = 'itin_'+simpleHash(routeKey);
  isLiked = !!likeData[currentItinId];

  currentItin = { days:days, cities:cities, route:cities.map(function(c){ return c.n; }).join(' → '),
    routeEn:cities.map(function(c){ return c.en; }).join(' → '),
    rows:rows, budget:b, level:level, departure:departure, startDate:startDate };

  saveRecipe(currentItin);

  // Render immediately with local data
  renderItinerary(); renderTable();
  document.getElementById('config-section').classList.add('hidden');
  document.getElementById('result-section').classList.remove('hidden');
  document.getElementById('like-section').classList.remove('hidden');
  document.getElementById('popular-section').classList.remove('hidden');
  switchTab('itinerary', document.querySelector('.tab-btn[data-tab="itinerary"]'));
  updateLikeUI(); renderPopular();
  window.scrollTo(0,0);
  // Show source: check API status and display badge
  fetch('/api/status').then(function(r){return r.json()}).then(function(d){
    setTimeout(function(){
      var h = document.querySelector('.itinerary-header h2');
      if (h && d.qwen && h.querySelector('.ai-badge') === null) {
        h.innerHTML += ' <span class="ai-badge" style="display:inline-block;background:#f0f0f5;color:#86868b;font-size:11px;padding:2px 8px;border-radius:10px;margin-left:8px;font-weight:600">📝 本地生成（千问就绪·下次增强）</span>';
      }
    }, 500);
  }).catch(function(){});

  // Skip AI enhancement for free users
  if (!isPremium) {
    renderItinerary(); renderTable();
    document.getElementById('like-section').classList.remove('hidden');
    document.getElementById('popular-section').classList.remove('hidden');
    updateLikeUI(); renderPopular();
    window.scrollTo(0,0);
    var remaining = 0;
    showToast('本地规则已生成。输入兑换码解锁AI增强（1码3次）');
    return;
  }

  // Save local copy for toggle
  var localItinCopy = currentItin;
  localItinCopy.source = 'local';

  // Show AI loading hint with toggle
  var hintDiv = document.createElement('div');
  hintDiv.id = 'ai-hint';
  hintDiv.style.cssText = 'text-align:center;padding:10px 14px;margin:10px 0;background:#f0f3ff;border-radius:8px;font-size:12px;color:#4361ee;font-weight:500;border:1px solid #d0d8ff';
  hintDiv.innerHTML = '⏳ 千问AI增强中... 预计5-15秒';
  var tab = document.getElementById('tab-itinerary');
  if (tab && tab.firstChild) tab.insertBefore(hintDiv, tab.firstChild);

  window._aiReady = false;
  window._localItin = localItinCopy;
  window._aiItin = null;

  window.showLocal = function() {
    currentItin = window._localItin;
    renderItinerary(); renderTable();
    var h = document.getElementById('ai-hint');
    if (h) h.innerHTML = '📝 本地规则版 | <a href="#" onclick="showAI()" style="color:#4361ee">查看AI增强版</a>' + (window._aiReady ? '' : ' (等待中...)');
  };
  window.showAI = function() {
    if (window._aiItin) {
      currentItin = window._aiItin;
      renderItinerary(); renderTable();
      var h = document.getElementById('ai-hint');
      if (h) { h.style.background = '#e8fce8'; h.style.color = '#34c759'; h.style.borderColor = '#b8e6b8'; h.innerHTML = '🧠 千问AI增强版 | <a href="#" onclick="showLocal()" style="color:#4361ee">切换本地版</a>'; }
    }
  };

  // Call AI
  tryEnhanceWithAI(localItinCopy, function(enhanced) {
    if (enhanced) {
      enhanced.source = 'qwen';
      window._aiItin = enhanced;
      window._aiReady = true;
      currentItin = enhanced;
      currentItinId = 'ai_' + Date.now();
      saveRecipe(currentItin);
      renderItinerary(); renderTable();
      var h = document.getElementById('ai-hint');
      if (h) { h.style.background = '#e8fce8'; h.style.color = '#34c759'; h.style.borderColor = '#b8e6b8'; h.innerHTML = '🧠 千问AI增强版 ✅ | <a href="#" onclick="showLocal()" style="color:#4361ee">切换本地版</a>'; }
      showToast('✨ 千问AI增强完成！');
    } else {
      var h = document.getElementById('ai-hint');
      if (h) { h.style.background = '#fff5f5'; h.style.color = '#ff9500'; h.style.borderColor = '#ffd0d0'; h.innerHTML = '📝 千问未响应，使用本地规则'; }
    }
  });

  } catch(e) { showToast('生成出错: ' + e.message); console.error(e); }
}

var WEEKDAYS_ZH = ['周日','周一','周二','周三','周四','周五','周六'];
var WEEKDAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function formatDateWithWeekday(dateStr, lang) {
  var d = new Date(dateStr + 'T00:00:00');
  var wd = (lang === 'en') ? WEEKDAYS_EN[d.getDay()] : WEEKDAYS_ZH[d.getDay()];
  return dateStr + ' ' + wd;
}

function simpleHash(str) { var h=0; for(var i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;} return Math.abs(h); }

// ==================== RENDER ====================
function renderItinerary() {
  if (!currentItin) return;
  var it = currentItin;
  var html = '<div class="itinerary-header"><div><h2>'+(currentLang==='en' && it.routeEn ? it.routeEn : it.route);
  if (it.source === 'qwen') {
    html += ' <span style="display:inline-block;background:#e8fce8;color:#34c759;font-size:11px;padding:3px 10px;border-radius:10px;margin-left:8px;font-weight:600;vertical-align:middle">'+T('ai_badge_qwen')+'</span>';
  } else if (it.source === 'local') {
    html += ' <span style="display:inline-block;background:#f0f0f5;color:#86868b;font-size:11px;padding:3px 10px;border-radius:10px;margin-left:8px;font-weight:600;vertical-align:middle">'+T('ai_badge_local')+'</span>';
  }
  html += '</h2>';

  html += '<div class="itinerary-meta">'+it.days+T('days_unit')+' · '+it.cities.length+T('countries_unit')+' '+it.cities.length+T('cities_unit')+' · '+T('departure_from')+' '+it.departure+'</div></div>';
  html += '<div class="itinerary-meta" style="text-align:right">'+T('departure_date')+': '+it.startDate+'</div></div>';

  for (var i = 0; i < it.rows.length; i++) {
    var r = it.rows[i];
    html += '<div class="day-block"><div class="day-header"><h3>'+T('day_header')+r.day+T('day_header_suffix')+' · '+formatDateWithWeekday(r.date, currentLang)+'</h3>';
    html += '<span class="day-city">📍 '+(currentLang==='en' ? getEnglishCityName(r.city) : r.city)+'</span></div>';
    html += '<div class="day-content">';
    var spotsArr = r.spots.split('\n');
    for (var j = 0; j < spotsArr.length; j++) {
      html += '<div class="day-item"><span class="time">🎯</span><span class="desc">'+spotsArr[j]+'</span></div>';
    }
    if (r.hotel) html += '<div class="day-item" style="margin-top:4px"><span class="time">🏨</span><span class="desc" style="white-space:pre-line;font-size:10px;color:var(--text-secondary)">'+r.hotel+'</span></div>';
    html += '<div class="day-item"><span class="time">🚗</span><span class="desc" style="white-space:pre-line;font-size:10px;color:var(--text-secondary)">'+r.transport+'</span></div>';
    html += '</div></div>';
  }

  html += '<div class="budget-summary">';
  html += '<div class="budget-item"><div class="amount">¥'+it.budget.total.toLocaleString()+'</div><div class="label">预估总花费</div></div>';
  html += '<div class="budget-item"><div class="amount">¥'+it.budget.flight.toLocaleString()+'</div><div class="label">往返机票</div></div>';
  html += '<div class="budget-item"><div class="amount">¥'+it.budget.hotel.toLocaleString()+'</div><div class="label">住宿</div></div>';
  html += '<div class="budget-item"><div class="amount">¥'+it.budget.meals.toLocaleString()+'</div><div class="label">餐饮</div></div>';
  html += '<div class="budget-item"><div class="amount">¥'+it.budget.interCity.toLocaleString()+'</div><div class="label">城际交通</div></div>';
  html += '<div class="budget-item"><div class="amount">¥'+it.budget.attractions.toLocaleString()+'</div><div class="label">景点门票</div></div>';
  html += '</div>';
  document.getElementById('tab-itinerary').innerHTML = html;
}

function renderTable() {
  if (!currentItin) return;
  var it = currentItin;
  var html = '<div class="std-table-wrap"><table class="std-table"><thead><tr>';
  html += '<th>Day</th><th>Date</th><th>City</th><th>Touring Spots</th><th>Accommodation</th><th>Transportation</th>';
  html += '</tr></thead><tbody>';

  for (var i = 0; i < it.rows.length; i++) {
    var r = it.rows[i];
    html += '<tr>';
    html += '<td class="day-num">'+r.day+'</td>';
    html += '<td class="date-col">'+formatDateWithWeekday(r.date, currentLang)+'</td>';
    html += '<td class="city-col">'+(currentLang==='en' ? getEnglishCityName(r.city).split(',')[0] : r.city.split(',')[0])+'</td>';
    html += '<td class="spots-col" style="white-space:pre-line">'+r.spots+'</td>';
    html += '<td class="hotel-col" style="white-space:pre-line">'+r.hotel+'</td>';
    html += '<td class="transport-col" style="white-space:pre-line">'+r.transport+'</td>';
    html += '</tr>';
  }
  html += '</tbody></table></div>';

  html += '<div style="margin-top:12px;font-size:11px;color:var(--text-secondary);padding:10px;background:#fafafa;border-radius:var(--radius);border:1px solid var(--border)">';
  html += '💰 预估总预算: <b style="color:var(--accent);font-size:14px">¥'+it.budget.total.toLocaleString()+'</b>';
  html += ' &nbsp;|&nbsp; 机票 ¥'+it.budget.flight.toLocaleString();
  html += ' 住宿 ¥'+it.budget.hotel.toLocaleString();
  html += ' 餐饮 ¥'+it.budget.meals.toLocaleString();
  html += ' 城际 ¥'+it.budget.interCity.toLocaleString();
  html += ' 景点 ¥'+it.budget.attractions.toLocaleString();
  html += '</div>';
  document.getElementById('tab-table').innerHTML = html;
}

// ==================== TABS ====================
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  document.getElementById('tab-itinerary').classList.add('hidden');
  document.getElementById('tab-table').classList.add('hidden');
  document.getElementById('tab-'+tab).classList.remove('hidden');
}

// ==================== EXPORT ====================
function downloadExcel() {
  if (typeof XLSX === "undefined") { showToast("Excel loading..."); return; }
  if (!currentItin) return;
  var it = currentItin;
  var rows = [['Day','Date','City','Touring Spots','Accommodation','Transportation']];
  for (var i = 0; i < it.rows.length; i++) {
    var r = it.rows[i];
    rows.push([r.day, formatDateWithWeekday(r.date, 'zh'), r.city.split(',')[0], r.spots.replace(/\n/g,'\n'), r.hotel.replace(/\n/g,'\n'), r.transport.replace(/\n/g,'\n')]);
  }
  rows.push([]);
  rows.push(['--- Budget ---','','','','','']);
  rows.push(['Flight','¥'+it.budget.flight.toLocaleString(),'','','','']);
  rows.push(['Hotel','¥'+it.budget.hotel.toLocaleString(),'','','','']);
  rows.push(['Meals','¥'+it.budget.meals.toLocaleString(),'','','','']);
  rows.push(['Local Transport','¥'+it.budget.localTransport.toLocaleString(),'','','','']);
  rows.push(['Intercity Transport','¥'+it.budget.interCity.toLocaleString(),'','','','']);
  rows.push(['Attractions','¥'+it.budget.attractions.toLocaleString(),'','','','']);
  rows.push(['Others','¥'+it.budget.other.toLocaleString(),'','','','']);
  rows.push(['Total','¥'+it.budget.total.toLocaleString(),'','','','']);

  var ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{wch:5},{wch:12},{wch:14},{wch:40},{wch:35},{wch:30}];
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Schengen Itinerary');
  XLSX.writeFile(wb, '申根行程单_'+it.startDate+'.xlsx');
  showToast('Excel下载成功！标准签证格式 (.xlsx)');
}

function downloadCSV() {
  if (!currentItin) return;
  var it = currentItin;
  var csv = '\uFEFFDay,Date,City,Touring Spots,Accommodation,Transportation\n';
  for (var i = 0; i < it.rows.length; i++) {
    var r = it.rows[i];
    csv += [r.day, formatDateWithWeekday(r.date, 'zh'), '"'+r.city.split(',')[0]+'"', '"'+r.spots.replace(/\n/g,'; ')+'"', '"'+r.hotel.replace(/\n/g,'; ')+'"', '"'+r.transport.replace(/\n/g,'; ')+'"'].join(',')+'\n';
  }
  var blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a'); a.href=url; a.download='申根行程单_'+it.startDate+'.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('CSV下载成功！');
}

function copyTable() {
  if (!currentItin) return;
  var it = currentItin;
  var text = 'Day\tDate\tCity\tTouring Spots\tAccommodation\tTransportation\n';
  for (var i = 0; i < it.rows.length; i++) {
    var r = it.rows[i];
    text += [r.day,formatDateWithWeekday(r.date, 'zh'),r.city.split(',')[0],r.spots.replace(/\n/g,'; '),r.hotel.replace(/\n/g,'; '),r.transport.replace(/\n/g,'; ')].join('\t')+'\n';
  }
  navigator.clipboard.writeText(text).then(function(){ showToast('表格已复制到剪贴板'); }).catch(function(){ showToast('复制失败，请下载CSV'); });
}

// ==================== LIKE SYSTEM ====================
function toggleLike() {
  if (!currentItinId) return;
  isLiked = !isLiked;
  likeData[currentItinId] = isLiked ? (likeData[currentItinId]||0)+1 : Math.max(0,(likeData[currentItinId]||0)-1);
  saveLikes(); updateLikeUI(); renderPopular();
}

function updateLikeUI() {
  var btn = document.getElementById('like-btn'), text = document.getElementById('like-text'), count = document.getElementById('like-count');
  var cnt = likeData[currentItinId]||0;
  if (isLiked) { btn.classList.add('liked'); text.textContent = '已点赞'; }
  else { btn.classList.remove('liked'); text.textContent = '点赞'; }
  count.textContent = cnt > 0 ? cnt + ' 人点赞' : '';
}

function saveRecipe(it) {
  var key = it.cities.map(function(c){ return c.n; }).join('|');
  recipeReg[key] = { cities:it.cities.map(function(c){ return c.n; }), days:it.days, level:it.level };
  try { localStorage.setItem('schengen_r3',JSON.stringify(recipeReg)); } catch(e){}
}

function regenerate() {
  showToast('正在为你生成新行程...');
  var daysInput = document.getElementById('days-input');
  var dayOptions = [7,10,12,14,18,21,30];
  var curDays = parseInt(daysInput.value);
  var otherDays = dayOptions.filter(function(d){ return d!==curDays; });
  if (otherDays.length>0) daysInput.value = otherDays[Math.floor(Math.random()*otherDays.length)];

  // Prefer popular recipes
  var recipeKeys = Object.keys(recipeReg);
  if (recipeKeys.length > 0 && Math.random() < 0.5) {
    var pick = recipeKeys[Math.floor(Math.random()*Math.min(5,recipeKeys.length))];
    var recipe = recipeReg[pick];
    if (recipe && recipe.cities) {
      selectedCities.clear();
      recipe.cities.forEach(function(c){ selectedCities.add(c); });
      updateCityPanel(); updateSelectedDisplay();
    }
  }
  generateItinerary();
}

function renderPopular() {
  var list = document.getElementById('popular-list');
  var popular = Object.entries(likeData).filter(function(e){ return e[1]>0; }).sort(function(a,b){ return b[1]-a[1]; }).slice(0,8);
  if (popular.length===0) {
    list.innerHTML = '<div style="font-size:12px;color:var(--text-secondary);padding:8px">还没有热门行程，快来点赞第一个吧！高赞行程会被"换一换"优先推荐 🎉</div>';
    return;
  }
  var rc = ['r1','r2','r3','','','','',''], html = '';
  for (var i=0;i<popular.length;i++) {
    html += '<div class="popular-item" onclick="loadPopular()"><span class="pop-rank '+(rc[i]||'')+'">'+(i+1)+'</span>';
    html += '<span class="pop-route">行程 #'+popular[i][0].slice(-6)+' — '+popular[i][1]+' 赞</span>';
    html += '<span class="pop-likes">❤️ '+popular[i][1]+'</span></div>';
  }
  list.innerHTML = html;
}

function loadPopular() {
  var recipeKeys = Object.keys(recipeReg);
  if (recipeKeys.length > 0) {
    var recipe = recipeReg[recipeKeys[Math.floor(Math.random()*Math.min(5,recipeKeys.length))]];
    if (recipe && recipe.cities) {
      selectedCities.clear();
      recipe.cities.forEach(function(c){ selectedCities.add(c); });
      updateCityPanel(); updateSelectedDisplay();
    }
  }
  generateItinerary();
}

// ==================== DOUBAO REVIEW ====================
function openDeepSeekReview() {
  if (!currentItin) { showToast('请先生成行程单'); return; }
  var it = currentItin;
  var prompt = '请帮我审查以下申根签证行程单是否合理，指出逻辑漏洞、时间冲突、交通问题：\n\n';
  prompt += '行程: ' + it.route + '\n';
  prompt += '天数: ' + it.days + '天\n';
  prompt += '出发城市: ' + it.departure + '\n';
  prompt += '出发日期: ' + it.startDate + '\n\n';
  for (var i = 0; i < it.rows.length; i++) {
    var r = it.rows[i];
    prompt += 'Day ' + r.day + ' (' + r.date + ') ' + r.city.split(',')[0] + ': ' + r.spots.replace(/\n/g, ' / ') + '\n';
    if (r.hotel) prompt += '  住宿: ' + r.hotel.replace(/\n/g, ' | ') + '\n';
    prompt += '  交通: ' + r.transport.replace(/\n/g, ' | ') + '\n';
  }
  navigator.clipboard.writeText(prompt).then(function() {
    showToast('行程已复制，点击确定跳转DeepSeek');
    setTimeout(function() {
      var w = window.open('https://chat.deepseek.com/', '_blank');
      if (!w) { window.location.href = 'https://chat.deepseek.com/'; }
    }, 500);
  }).catch(function() {
    window.location.href = 'https://chat.deepseek.com/';
  });
}


// Lookup English city/country name from Chinese
function getEnglishCityName(chineseName) {
  // Try to find in DATA
  var cn = (chineseName || '').split(',')[0].trim();
  for (var i = 0; i < CODES.length; i++) {
    var code = CODES[i];
    for (var j = 0; j < DATA[code].cities.length; j++) {
      if (DATA[code].cities[j].n === cn) return DATA[code].cities[j].en + ', ' + DATA[code].en;
    }
  }
  return chineseName; // fallback
}

// ==================== i18n ====================
var T = function(key) {
  var map = {
    'days_unit': {zh:'天',en:' days'},
    'countries_unit': {zh:'国',en:' countries'},
    'cities_unit': {zh:'城',en:' cities'},
    'departure_from': {zh:'出发',en:'from'},
    'departure_date': {zh:'出发日期',en:'Departure'},
    'total_cost': {zh:'预估总花费',en:'Est. Total'},
    'flights': {zh:'往返机票',en:'Flights'},
    'hotel': {zh:'住宿',en:'Hotel'},
    'meals': {zh:'餐饮',en:'Meals'},
    'intercity': {zh:'城际交通',en:'Intercity'},
    'attractions': {zh:'景点门票',en:'Attractions'},
    'day_header': {zh:'第',en:'Day '},
    'day_header_suffix': {zh:'天',en:''},
    'ai_badge_qwen': {zh:'🧠 千问AI增强',en:'🧠 Qwen AI Enhanced'},
    'ai_badge_local': {zh:'📝 本地规则生成',en:'📝 Local Engine'},
    'download_excel': {zh:'📊 下载Excel (.xlsx)',en:'📊 Download Excel'},
    'download_csv': {zh:'📄 下载CSV',en:'📄 Download CSV'},
    'copy_table': {zh:'📋 复制表格',en:'📋 Copy Table'},
    'deepseek_review': {zh:'🤖 DeepSeek审阅',en:'🤖 DeepSeek Review'},
    'back_modify': {zh:'↩ 修改参数',en:'↩ Modify'},
    'detail_tab': {zh:'📋 详细行程',en:'📋 Detail'},
    'table_tab': {zh:'📊 标准表格',en:'📊 Table'},
    'generate_btn': {zh:'✨ 生成行程单',en:'✨ Generate'},
    'reset_btn': {zh:'重置',en:'Reset'},
    'like_btn': {zh:'点赞',en:'Like'},
    'liked_btn': {zh:'已点赞',en:'Liked'},
    'regenerate_btn': {zh:'🔀 换一换',en:'🔀 New'},
    'popular_title': {zh:'🔥 热门行程',en:'🔥 Popular'},
    'select_cities': {zh:'个城市已选',en:' cities'},
    'not_selected': {zh:'未选择',en:'None'},
  };
  var entry = map[key];
  if (!entry) return key;
  return entry[currentLang] || entry['zh'];
};

// ==================== LANGUAGE ====================
function toggleLanguage() {
  currentLang = currentLang==='zh'?'en':'zh';
  document.getElementById('lang-btn').textContent = currentLang==='zh'?'English':'中文';
  // Update sticky bar buttons
  var btns = document.querySelectorAll('.sticky-bar .btn-sm');
  var labels = ['download_excel','download_csv','copy_table','deepseek_review'];
  for (var i = 0; i < Math.min(btns.length, labels.length); i++) {
    btns[i].textContent = T(labels[i]);
  }
  // Update tab buttons
  var tabs = document.querySelectorAll('.tab-btn');
  if (tabs[0]) tabs[0].textContent = T('detail_tab');
  if (tabs[1]) tabs[1].textContent = T('table_tab');
  if (currentItin) { renderItinerary(); renderTable(); }
}

// ==================== NAVIGATION ====================
function backToConfig() {
  document.getElementById('config-section').classList.remove('hidden');
  document.getElementById('result-section').classList.add('hidden');
  window.scrollTo(0,0);
}

function resetAll() {
  selectedCities.clear(); updateCityPanel(); updateSelectedDisplay();
  document.getElementById('days-input').value='10';
  document.getElementById('budget-input').value='25000';
  document.getElementById('level-input').value='mid';
  var d=new Date(); d.setDate(d.getDate()+14);
  document.getElementById('start-date-input').value = d.toISOString().split('T')[0];
  showToast('已重置');
}

// ==================== TOAST ====================
function showToast(msg) {
  var el = document.getElementById('toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(function(){ el.classList.remove('show'); }, 2400);
}


// ==================== AI LLM GENERATION ====================

// Save API key when it changes



// ==================== AI CHAT HELPERS ====================








// ==================== INIT ====================
// DOM already parsed — but wait for leaflet if needed
// Init app immediately — city panel has no CDN dependencies

// ==================== REDEMPTION CODE ====================
var isPremium = false;

function checkPremium() {
  // Check server-side PRO status
  fetch('/api/user/status')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      isPremium = d.pro;
      if (isPremium) {
        var badge = document.getElementById('premium-badge');
        var box = document.getElementById('redeem-box');
        if (badge) {
          badge.style.display = 'inline-block';
          badge.textContent = '⭐ PRO (' + d.remaining + '次)';
        }
        if (box) box.style.display = 'none';
      }
    })
    .catch(function() {
      // Fallback to localStorage for offline/cached
      isPremium = localStorage.getItem('schengen_premium') === 'true';
      if (isPremium) {
        var badge = document.getElementById('premium-badge');
        if (badge) badge.style.display = 'inline-block';
      }
    });
}

function redeemCode() {
  var input = document.getElementById('redeem-input');
  var msg = document.getElementById('redeem-msg');
  var code = (input.value || '').toUpperCase().trim();
  if (!code) { msg.textContent = '请输入兑换码'; msg.style.color = '#ff3b30'; return; }

  msg.textContent = '验证中...'; msg.style.color = '#86868b';

  fetch('/api/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.valid) {
      isPremium = true;
      localStorage.setItem('schengen_premium', 'true');
      localStorage.removeItem('schengen_gen_count');
      msg.textContent = '✅ 已解锁PRO版！';
      msg.style.color = '#34c759';
      setTimeout(function() {
        var badge = document.getElementById('premium-badge');
        var box = document.getElementById('redeem-box');
        if (badge) badge.style.display = 'inline-block';
        if (box) box.style.display = 'none';
      }, 800);
    } else {
      msg.textContent = data.message || '无效';
      msg.style.color = '#ff3b30';
    }
  })
  .catch(function() {
    msg.textContent = '网络错误';
    msg.style.color = '#ff3b30';
  });
}

// Check on load
checkPremium();


// ==================== APP INIT ====================

// Check if Qwen API is available
(function checkAPIStatus() {
  fetch('/api/status')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var el = document.getElementById('api-status-badge');
      if (!el) return;
      if (d.qwen) {
        el.innerHTML = '🧠 千问AI已连接 ✅';
        el.style.background = '#e8fce8'; el.style.color = '#34c759';
        el.style.cursor = 'pointer';
        el.title = '生成行程时将自动调用千问增强';
        el.onclick = function() { window.open('/api/status', '_blank'); };
      } else {
        el.innerHTML = '⚠ 千问API未配置';
        el.style.background = '#fff5f5'; el.style.color = '#ff9500';
      }
    })
    .catch(function() {
      var el = document.getElementById('api-status-badge');
      if (el) { el.innerHTML = '📝 本地模式'; el.style.background = '#f0f0f5'; el.style.color = '#86868b'; }
    });
})();


document.addEventListener('DOMContentLoaded', function() {
  var cp = document.getElementById('city-panel');
  if (!cp) return;

  // Delegation: handle clicks on city rows and country labels
  cp.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el !== cp) {
      if (el.tagName === 'LABEL' && el.classList.contains('city-row')) {
        var cb = el.querySelector('.city-cb');
        if (cb) {
          cb.checked = !cb.checked;
          var cn = cb.value;
          if (cb.checked) { selectedCities.add(cn); el.classList.add('selected'); }
          else { selectedCities.delete(cn); el.classList.remove('selected'); }
          updateSelectedDisplay();
        }
        return;
      }
      if (el.classList.contains('country-label')) {
        var code = el.getAttribute('data-country');
        if (code && DATA[code] && DATA[code].cities.length > 0) toggleCity(DATA[code].cities[0]);
        return;
      }
      el = el.parentElement;
    }
  });

  updateCityPanel();
  updateSelectedDisplay();

  // Set default date (2 weeks from now)
  var d = new Date(); d.setDate(d.getDate() + 14);
  var dateEl = document.getElementById('start-date-input');
  if (dateEl) dateEl.value = d.toISOString().split('T')[0];

  // Populate departure cities
  var depSel = document.getElementById('departure-input');
  if (depSel) {
    for (var i = 0; i < DEPARTURE_CITIES.length; i++) {
      var opt = document.createElement('option');
      opt.value = DEPARTURE_CITIES[i];
      opt.textContent = DEPARTURE_CITIES[i];
      depSel.appendChild(opt);
    }
    depSel.value = '上海';
  }
});

// ==================== AI INTEGRATION (optional) ====================
async function generateWithAI(itinerary, apiKey) {
  if (!apiKey) return itinerary;
  try {
    var res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Enhance this itinerary JSON with hotel_area near attractions, detailed transportation, and varied daily activities. Return ONLY valid JSON: ' + JSON.stringify(itinerary) }],
        temperature: 0.7, max_tokens: 4000
      })
    });
    var data = await res.json();
    var content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (content) {
      var json = content.trim();
      if (json.startsWith('```')) json = json.replace(/^```[a-z]*\n?/,'').replace(/\n?```$/,'');
      try { return JSON.parse(json); } catch(e) {}
    }
  } catch(e) { console.error('AI fallback:', e); }
  return itinerary;
}

// ==================== BACKEND AI ENHANCEMENT ====================
function tryEnhanceWithAI(localItin, callback) {
  var API_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:8765/api/generate-itinerary'
    : '/api/generate-itinerary';

  var body = {
    cities: localItin.cities.map(function(c) { return c.n; }),
    days: localItin.days,
    level: localItin.level,
    departure: localItin.departure,
    startDate: localItin.startDate,
    localItinerary: {
      days: localItin.rows.map(function(r) {
        return { day: r.day, date: r.date, city: r.city, spots: r.spots, hotel: r.hotel, transport: r.transport };
      })
    }
  };

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.needRedeem) {
      showToast('免费次数已用完，请输入兑换码');
      callback(null);
      return;
    }
    if (data.fallback || data.error) {
      console.log('千问返回降级信号，使用本地规则');
      callback(null);
      return;
    }
    // Convert AI response to our format
    var itin = buildLocalItineraryFromAI(data);
    if (itin) {
      itin.level = localItin.level;
      itin.startDate = localItin.startDate;
      itin.departure = localItin.departure;
      itin.budget = localItin.budget;
      callback(itin);
    } else {
      callback(null);
    }
  })
  .catch(function(e) {
    console.log('千问API未连接，使用本地规则:', e.message);
    callback(null);
  });
}

function buildLocalItineraryFromAI(aiData) {
  if (!aiData || !aiData.days || !Array.isArray(aiData.days)) return null;
  var days = aiData.days.map(function(d) {
    return {
      day: d.day, date: d.date || '', city: d.city || '', cityEn: d.city || '',
      spots: Array.isArray(d.touringSpots) ? d.touringSpots.join('\n') : (d.touringSpots || ''),
      hotel: d.accommodation || '', transport: d.transportation || '',
      country: '', countryEn: '', hotelShort: ''
    };
  });
  var seen = {}, allCities = [];
  days.forEach(function(d) {
    var cn = (d.city || '').split(',')[0].trim();
    if (cn && !seen[cn]) { seen[cn] = true; allCities.push({n:cn, en:cn}); }
  });
  return {
    days: days.length, cities: allCities,
    route: aiData.route || allCities.map(function(c){return c.n;}).join(' → '),
    routeEn: aiData.route || '',
    rows: days, budget: { total: 0 }, level: 'mid', departure: '', startDate: ''
  };
}
