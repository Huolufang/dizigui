const days = [
  {
    day: 1,
    type: 'lesson',
    stage: 1,
    chapter: '总叙 · 入则孝',
    title: '看见全书框架，及时回应',
    estimate: 24,
    accent: 'lilac',
    units: [
      { id: 'DZG-ZX-001', text: '弟子规，圣人训；首孝悌，次谨信。' },
      { id: 'DZG-ZX-002', text: '泛爱众，而亲仁；有余力，则学文。' },
      { id: 'DZG-RX-001', text: '父母呼，应勿缓；父母命，行勿懒。' },
      { id: 'DZG-RX-002', text: '父母教，须敬听；父母责，须顺承。' },
      { id: 'DZG-RX-003', text: '冬则温，夏则凊；晨则省，昏则定。' }
    ],
    focus: '全书结构、恭敬回应与体察需要。',
    boundary: '及时回应不等于放弃判断；违法、危险或侵害人格的要求不应机械执行。',
    question: '孝顺是否等于父母说什么都必须照做？',
    cai: {
      lecture: '第5—8讲',
      points: ['学习要落实在生活，而不只是会背。', '“冬温夏凊”重在观察并体察父母需要。'],
      case: '课程用黄香冬温夏凊说明体察，也建议早晚读一遍用于提醒力行和反省。'
    }
  },
  {
    day: 2,
    type: 'lesson',
    stage: 1,
    chapter: '入则孝',
    title: '让家人放心，也为自己负责',
    estimate: 22,
    accent: 'lime',
    units: [
      { id: 'DZG-RX-004', text: '出必告，反必面；居有常，业无变。' },
      { id: 'DZG-RX-005', text: '事虽小，勿擅为；苟擅为，子道亏。' },
      { id: 'DZG-RX-006', text: '物虽小，勿私藏；苟私藏，亲心伤。' },
      { id: 'DZG-RX-007', text: '亲所好，力为具；亲所恶，谨为去。' }
    ],
    focus: '告知、生活规律、所有权与家庭信任。',
    boundary: '成年人的告知是安全沟通，不是接受全天候监控。',
    question: '“出必告”怎样做才既有关怀又不过度控制？',
    cai: {
      lecture: '第8—12讲',
      points: ['告知去向是减少亲人挂念。', '小事和小物品同样会形成长期习惯。'],
      case: '课程讲到母亲发现孩子拿了苹果后，带孩子归还并说明原因。'
    }
  },
  {
    day: 3,
    type: 'lesson',
    stage: 1,
    chapter: '入则孝',
    title: '自律、体谅与温和劝谏',
    estimate: 25,
    accent: 'cream',
    units: [
      { id: 'DZG-RX-008', text: '身有伤，贻亲忧；德有伤，贻亲羞。' },
      { id: 'DZG-RX-009', text: '亲爱我，孝何难；亲憎我，孝方贤。' },
      { id: 'DZG-RX-010', text: '亲有过，谏使更；怡吾色，柔吾声。' },
      { id: 'DZG-RX-011', text: '谏不入，悦复谏；号泣随，挞无怨。' }
    ],
    focus: '爱惜自己、面对困难关系、规劝的态度和时机。',
    boundary: '“挞无怨”只作历史语境理解；面对暴力或虐待应先保护自己并求助。',
    question: '温和劝谏和一味迁就有什么区别？',
    cai: {
      lecture: '第10—14讲',
      points: ['“顺”不等于对所有要求全部照做。', '规劝要考虑存心、时机、态度、方法和耐心。'],
      case: '课程以闵子骞、唐太宗接受魏征进谏等故事说明规劝。'
    }
  },
  {
    day: 4,
    type: 'lesson',
    stage: 1,
    chapter: '入则孝 · 出则悌',
    title: '照料、纪念与家庭和睦',
    estimate: 25,
    accent: 'pink',
    units: [
      { id: 'DZG-RX-012', text: '亲有疾，药先尝；昼夜侍，不离床。' },
      { id: 'DZG-RX-013', text: '丧三年，常悲咽；居处变，酒肉绝。' },
      { id: 'DZG-RX-014', text: '丧尽礼，祭尽诚；事死者，如事生。' },
      { id: 'DZG-CD-001', text: '兄道友，弟道恭；兄弟睦，孝在中。' }
    ],
    focus: '疾病照护、哀悼纪念与手足和睦。',
    boundary: '现代用药遵医嘱；照护要分工休息；不以固定守丧形式评判孝心。',
    question: '判断孝心更应看重仪式，还是长期行动？',
    cai: {
      lecture: '第15—16讲',
      points: ['“药先尝”要抓住照护之意并结合实际情境。', '纪念重在感恩并延续亲人的教诲。'],
      case: '第15讲以家庭急救准备和孩子把糖先给父亲的身教案例展开。'
    }
  },
  {
    day: 5,
    type: 'lesson',
    stage: 1,
    chapter: '出则悌',
    title: '礼让不是自我贬低',
    estimate: 23,
    accent: 'lilac',
    units: [
      { id: 'DZG-CD-002', text: '财物轻，怨何生；言语忍，忿自泯。' },
      { id: 'DZG-CD-003', text: '或饮食，或坐走；长者先，幼者后。' },
      { id: 'DZG-CD-004', text: '长呼人，即代叫；人不在，己即到。' },
      { id: 'DZG-CD-005', text: '称尊长，勿呼名；对尊长，勿见能。' },
      { id: 'DZG-CD-006', text: '路遇长，疾趋揖；长无言，退恭立。' }
    ],
    focus: '少争、控制伤人言语、礼让与主动回应。',
    boundary: '礼让不等于讨好或自我否定；可以清楚表达自己的需要。',
    question: '礼让怎样避免变成讨好？',
    cai: {
      lecture: '第16—19讲',
      points: ['轻财物和忍言语能减少家庭冲突。', '礼节要从生活动作内化为体察。'],
      case: '课程以孔融让梨和孩子从争大块西瓜转为取小块说明礼让。'
    }
  },
  {
    day: 6,
    type: 'lesson',
    stage: 1,
    chapter: '出则悌',
    title: '把传统礼仪转换成现代尊重',
    estimate: 22,
    accent: 'lime',
    units: [
      { id: 'DZG-CD-007', text: '骑下马，乘下车；过犹待，百步余。' },
      { id: 'DZG-CD-008', text: '长者立，幼勿坐；长者坐，命乃坐。' },
      { id: 'DZG-CD-009', text: '尊长前，声要低；低不闻，却非宜。' },
      { id: 'DZG-CD-010', text: '进必趋，退必迟；问起对，视勿移。' },
      { id: 'DZG-CD-011', text: '事诸父，如事父；事诸兄，如事兄。' }
    ],
    focus: '古代礼仪、合宜表达、倾听和尊重的扩展。',
    boundary: '不机械照搬下马、站坐或眼神要求；考虑场景、文化与个人舒适度。',
    question: '形式变化以后，礼的核心还剩下什么？',
    cai: {
      lecture: '第19—20讲',
      points: ['礼的核心是恭敬、体察与合宜。', '对其他长辈的关怀是孝敬的扩展。'],
      case: '课程用送客说明“过犹待”，也提醒电梯等场景不可机械行礼。'
    }
  },
  {
    day: 7,
    type: 'checkpoint',
    stage: 1,
    chapter: '第一阶段检测',
    title: '孝悌阶段复习',
    estimate: 35,
    accent: 'ink',
    units: [],
    focus: '总叙、入则孝、出则悌累计背诵与理解。',
    boundary: '检测用于发现复习重点，不用一次成绩否定全部学习成果。',
    question: '用五步表达法谈谈：孝是否等于服从？',
    cai: {
      lecture: '第5—20讲复习',
      points: ['回顾“顺”与独立判断。', '回顾劝谏、礼让与现代转化。'],
      case: '从已学课程案例中任选一个，用自己的话说明。'
    }
  },
  {
    day: 8,
    type: 'lesson',
    stage: 2,
    chapter: '谨',
    title: '管理时间、身体与日常秩序',
    estimate: 24,
    accent: 'cream',
    units: [
      { id: 'DZG-JIN-001', text: '朝起早，夜眠迟；老易至，惜此时。' },
      { id: 'DZG-JIN-002', text: '晨必盥，兼漱口；便溺回，辄净手。' },
      { id: 'DZG-JIN-003', text: '冠必正，纽必结；袜与履，俱紧切。' },
      { id: 'DZG-JIN-004', text: '置冠服，有定位；勿乱顿，致污秽。' },
      { id: 'DZG-JIN-005', text: '衣贵洁，不贵华；上循分，下称家。' },
      { id: 'DZG-JIN-006', text: '对饮食，勿拣择；食适可，勿过则。' }
    ],
    focus: '时间、卫生、仪表、归位和节制。',
    boundary: '“夜眠迟”不鼓励少睡；衣食建议不能替代健康和营养专业判断。',
    question: '珍惜时间和保证睡眠是否冲突？',
    cai: {
      lecture: '第20—22讲',
      points: ['“谨”包含自制、生活和做事能力。', '物有定位能减少混乱并提高效率。'],
      case: '课程以衣扣、清洁和固定位置等细节说明习惯影响信任。'
    }
  },
  {
    day: 9,
    type: 'lesson',
    stage: 2,
    chapter: '谨',
    title: '从容、慎独与不忙乱',
    estimate: 25,
    accent: 'lilac',
    units: [
      { id: 'DZG-JIN-007', text: '年方少，勿饮酒；饮酒醉，最为丑。' },
      { id: 'DZG-JIN-008', text: '步从容，立端正；揖深圆，拜恭敬。' },
      { id: 'DZG-JIN-009', text: '勿践阈，勿跛倚；勿箕踞，勿摇髀。' },
      { id: 'DZG-JIN-010', text: '缓揭帘，勿有声；宽转弯，勿触棱。' },
      { id: 'DZG-JIN-011', text: '执虚器，如执盈；入虚室，如有人。' },
      { id: 'DZG-JIN-012', text: '事勿忙，忙多错；勿畏难，勿轻略。' }
    ],
    focus: '举止分寸、慎独、检查和记录。',
    boundary: '不以姿态或身体特征羞辱人；“勿畏难”不等于无视能力和风险。',
    question: '“入虚室，如有人”与现代自律有什么关系？',
    cai: {
      lecture: '第22—24讲',
      points: ['不干扰他人的小动作也是体察。', '不忙乱要靠归位、检查和记录。'],
      case: '课程讲到老师无人时吐痰被学生看见，也讲到用联络簿避免漏带作业。'
    }
  },
  {
    day: 10,
    type: 'lesson',
    stage: 2,
    chapter: '谨',
    title: '尊重空间、身份和物权',
    estimate: 22,
    accent: 'pink',
    units: [
      { id: 'DZG-JIN-013', text: '斗闹场，绝勿近；邪僻事，绝勿问。' },
      { id: 'DZG-JIN-014', text: '将入门，问孰存；将上堂，声必扬。' },
      { id: 'DZG-JIN-015', text: '人问谁，对以名；吾与我，不分明。' },
      { id: 'DZG-JIN-016', text: '用人物，须明求；倘不问，即为偷。' },
      { id: 'DZG-JIN-017', text: '借人物，及时还；后有急，借不难。' }
    ],
    focus: '环境选择、进入空间、说明身份、借用和归还。',
    boundary: '正常求知不等于猎奇；面对欺凌、违法或危险要保留证据并求助。',
    question: '好奇心和不传播猎奇信息之间怎样划界？',
    cai: {
      lecture: '第23—27讲',
      points: ['进入他人空间前要告知。', '使用与借用物品必须取得同意。'],
      case: '课程讲到电话先自报姓名、妹妹未经同意拿姐姐玩具和应聘者翻资料。'
    }
  },
  {
    day: 11,
    type: 'lesson',
    stage: 2,
    chapter: '信',
    title: '在网络时代为言语负责',
    estimate: 24,
    accent: 'lime',
    units: [
      { id: 'DZG-XIN-001', text: '凡出言，信为先；诈与妄，奚可焉。' },
      { id: 'DZG-XIN-002', text: '话说多，不如少；惟其是，勿佞巧。' },
      { id: 'DZG-XIN-003', text: '奸巧语，秽污词；市井气，切戒之。' },
      { id: 'DZG-XIN-004', text: '见未真，勿轻言；知未的，勿轻传。' },
      { id: 'DZG-XIN-005', text: '事非宜，勿轻诺；苟轻诺，进退错。' }
    ],
    focus: '真实表达、核实信息和慎重承诺。',
    boundary: '少说不等于让弱势者沉默；面对侵害应陈述事实并求助。',
    question: '“知未的，勿轻传”对社交媒体有什么意义？',
    cai: {
      lecture: '第28—30讲',
      points: ['信用包括真实和履行责任。', '承诺前要判断正当性与能力。'],
      case: '课程讲到季札挂剑、郭汲守与孩子的约定，以及无法还债时坦诚协商。'
    }
  },
  {
    day: 12,
    type: 'lesson',
    stage: 2,
    chapter: '信',
    title: '清楚表达，向善学习',
    estimate: 23,
    accent: 'cream',
    units: [
      { id: 'DZG-XIN-006', text: '凡道字，重且舒；勿急疾，勿模糊。' },
      { id: 'DZG-XIN-007', text: '彼说长，此说短；不关己，莫闲管。' },
      { id: 'DZG-XIN-008', text: '见人善，即思齐；纵去远，以渐跻。' },
      { id: 'DZG-XIN-009', text: '见人恶，即内省；有则改，无加警。' },
      { id: 'DZG-XIN-010', text: '唯德学，唯才艺；不如人，当自砺。' }
    ],
    focus: '表达分寸、榜样学习、自省和成长比较。',
    boundary: '“莫闲管”不适用于伤害、歧视、违法或公共安全问题。',
    question: '什么时候“不闲管”是分寸，什么时候是冷漠？',
    cai: {
      lecture: '第30—33讲',
      points: ['表达需要练习才能清楚从容。', '见善学习，见恶先检查自己。'],
      case: '课程用日常行善和先协助收拾错误现场，再讨论原因来说明。'
    }
  },
  {
    day: 13,
    type: 'lesson',
    stage: 2,
    chapter: '信',
    title: '正确面对评价和错误',
    estimate: 24,
    accent: 'lilac',
    units: [
      { id: 'DZG-XIN-011', text: '若衣服，若饮食；不如人，勿生戚。' },
      { id: 'DZG-XIN-012', text: '闻过怒，闻誉乐；损友来，益友却。' },
      { id: 'DZG-XIN-013', text: '闻誉恐，闻过欣；直谅士，渐相亲。' },
      { id: 'DZG-XIN-014', text: '无心非，名为错；有心非，名为恶。' },
      { id: 'DZG-XIN-015', text: '过能改，归于无；倘掩饰，增一辜。' }
    ],
    focus: '减少物质攀比、接纳反馈、认错与补救。',
    boundary: '接纳批评不等于接受羞辱或不实指控；改错后仍要承担合理后果。',
    question: '“过能改，归于无”是否意味着不必承担后果？',
    cai: {
      lecture: '第32—34讲',
      points: ['排斥规劝会使益友远离。', '改过包含知过、承认和补救。'],
      case: '课程讲到孩子弄坏衣架后由老师陪同承认并修好。'
    }
  },
  {
    day: 14,
    type: 'checkpoint',
    stage: 2,
    chapter: '第二阶段检测',
    title: '谨信阶段复习',
    estimate: 36,
    accent: 'ink',
    units: [],
    focus: '累计总叙至信，重点检测谨与信。',
    boundary: '检测结果用于生成复习清单，不使用“失败”标签。',
    question: '用五步表达法谈谈：诚信在网络时代有什么意义？',
    cai: {
      lecture: '第20—34讲复习',
      points: ['回顾谨慎、空间、物权与信息查证。', '回顾诚信、批评与改过。'],
      case: '从季札挂剑、郭汲守约或衣架认错中任选一个说明。'
    }
  },
  {
    day: 15,
    type: 'lesson',
    stage: 3,
    chapter: '泛爱众',
    title: '平等关怀，不以外表判断人',
    estimate: 23,
    accent: 'pink',
    units: [
      { id: 'DZG-FAZ-001', text: '凡是人，皆须爱；天同覆，地同载。' },
      { id: 'DZG-FAZ-002', text: '行高者，名自高；人所重，非貌高。' },
      { id: 'DZG-FAZ-003', text: '才大者，望自大；人所服，非言大。' },
      { id: 'DZG-FAZ-004', text: '己有能，勿自私；人所能，勿轻訾。' },
      { id: 'DZG-FAZ-005', text: '勿谄富，勿骄贫；勿厌故，勿喜新。' }
    ],
    focus: '共同尊严、德才、分享能力与不因贫富区别对待。',
    boundary: '关爱所有人不等于与所有人亲密，也不要求容忍伤害。',
    question: '关爱所有人和远离伤害自己的人是否矛盾？',
    cai: {
      lecture: '第35—36讲',
      points: ['真正的名望来自德行和有益于人的能力。', '不因贫富和外貌决定尊重。'],
      case: '课程以孙叔敖和贫富羞辱造成的伤害说明对人的平等关怀。'
    }
  },
  {
    day: 16,
    type: 'lesson',
    stage: 3,
    chapter: '泛爱众',
    title: '尊重忙碌、隐私和名誉',
    estimate: 24,
    accent: 'lime',
    units: [
      { id: 'DZG-FAZ-006', text: '人不闲，勿事搅；人不安，勿话扰。' },
      { id: 'DZG-FAZ-007', text: '人有短，切莫揭；人有私，切莫说。' },
      { id: 'DZG-FAZ-008', text: '道人善，即是善；人知之，愈思勉。' },
      { id: 'DZG-FAZ-009', text: '扬人恶，即是恶；疾之甚，祸且作。' },
      { id: 'DZG-FAZ-010', text: '善相劝，德皆建；过不规，道两亏。' }
    ],
    focus: '时间边界、隐私、赞善和建设性规劝。',
    boundary: '保护隐私不妨碍对虐待、欺凌、违法和安全问题求助或举报。',
    question: '保护隐私和揭露伤害之间如何判断？',
    cai: {
      lecture: '第35—37讲',
      points: ['联系他人前要体察对方状态。', '扬善与规过都要考虑影响和方法。'],
      case: '课程建议电话先问“现在方便吗”，并讨论传播他人过恶的后果。'
    }
  },
  {
    day: 17,
    type: 'lesson',
    stage: 3,
    chapter: '泛爱众',
    title: '公平往来、同理与理服人',
    estimate: 23,
    accent: 'cream',
    units: [
      { id: 'DZG-FAZ-011', text: '凡取与，贵分晓；与宜多，取宜少。' },
      { id: 'DZG-FAZ-012', text: '将加人，先问己；己不欲，即速已。' },
      { id: 'DZG-FAZ-013', text: '恩欲报，怨欲忘；报怨短，报恩长。' },
      { id: 'DZG-FAZ-014', text: '待婢仆，身贵端；虽贵端，慈而宽。' },
      { id: 'DZG-FAZ-015', text: '势服人，心不然；理服人，方无言。' }
    ],
    focus: '取与分明、换位、感恩、权力关系和以理沟通。',
    boundary: '“怨欲忘”不要求遗忘创伤或放弃合法追责；历史称谓应作现代转化。',
    question: '“怨欲忘”与维护自己的权利如何同时做到？',
    cai: {
      lecture: '第37—38讲',
      points: ['换位思考不是强迫忍受伤害。', '权势只能造成表面服从。'],
      case: '课程讲到刘宽被热茶泼到时，先问仆人的手有没有烫伤。'
    }
  },
  {
    day: 18,
    type: 'lesson',
    stage: 3,
    chapter: '亲仁',
    title: '选择值得亲近的人和环境',
    estimate: 22,
    accent: 'lilac',
    units: [
      { id: 'DZG-QR-001', text: '同是人，类不齐；流俗众，仁者希。' },
      { id: 'DZG-QR-002', text: '果仁者，人多畏；言不讳，色不媚。' },
      { id: 'DZG-QR-003', text: '能亲仁，无限好；德日进，过日少。' },
      { id: 'DZG-QR-004', text: '不亲仁，无限害；小人进，百事坏。' }
    ],
    focus: '辨识榜样、正直、环境和伙伴的影响。',
    boundary: '判断榜样要看长期行为、证据和可质疑性，避免个人崇拜和永久贴标签。',
    question: '今天判断一个人是否值得学习，应看哪些证据？',
    cai: {
      lecture: '第38—40讲',
      points: ['可从仁厚、谦卑和以身作则判断。', '亲近是持续学习可验证的行为。'],
      case: '课程以杨老师买将坏的香蕉和李炳南老师惜物、持续讲学说明。'
    }
  },
  {
    day: 19,
    type: 'lesson',
    stage: 3,
    chapter: '余力学文',
    title: '让学习与行动互相校正',
    estimate: 24,
    accent: 'lime',
    units: [
      { id: 'DZG-XW-001', text: '不力行，但学文；长浮华，成何人。' },
      { id: 'DZG-XW-002', text: '但力行，不学文；任己见，昧理真。' },
      { id: 'DZG-XW-003', text: '读书法，有三到；心眼口，信皆要。' },
      { id: 'DZG-XW-004', text: '方读此，勿慕彼；此未终，彼勿起。' },
      { id: 'DZG-XW-005', text: '宽为限，紧用功；工夫到，滞塞通。' },
      { id: 'DZG-XW-006', text: '心有疑，随札记；就人问，求确义。' }
    ],
    focus: '学与行、专注、计划、记录和求证。',
    boundary: '阶段性专注不否定跨学科学习；求证要找具备相关知识和证据的人。',
    question: '只实践不学习，为什么也可能走偏？',
    cai: {
      lecture: '第40讲',
      points: ['学与行要互相校正。', '学习要专注、有计划并记录疑问。'],
      case: '课程用会背便自满说明“长浮华”，并以学习故事说明专注。'
    }
  },
  {
    day: 20,
    type: 'lesson',
    stage: 3,
    chapter: '余力学文',
    title: '管理环境，也保留独立判断',
    estimate: 23,
    accent: 'pink',
    units: [
      { id: 'DZG-XW-007', text: '房室清，墙壁净；几案洁，笔砚正。' },
      { id: 'DZG-XW-008', text: '墨磨偏，心不端；字不敬，心先病。' },
      { id: 'DZG-XW-009', text: '列典籍，有定处；读看毕，还原处。' },
      { id: 'DZG-XW-010', text: '虽有急，卷束齐；有缺坏，就补之。' },
      { id: 'DZG-XW-011', text: '非圣书，屏勿视；蔽聪明，坏心志。' },
      { id: 'DZG-XW-012', text: '勿自暴，勿自弃；圣与贤，可驯致。' }
    ],
    focus: '学习环境、爱惜资料、信息选择和成长信心。',
    boundary: '“非圣书”转化为信息素养，不解释为禁止接触不同观点。',
    question: '选择有益信息与接受多元观点怎样兼顾？',
    cai: {
      lecture: '第40讲',
      points: ['整洁和归位能稳定学习。', '资料选择需要判断，成长需要信心。'],
      case: '课程讲到整齐的书房、清水滴墨比喻信息影响，并反对伤害身体的苦读方式。'
    }
  },
  {
    day: 21,
    type: 'graduation',
    stage: 3,
    chapter: '综合结业',
    title: '把经典讲成自己的话',
    estimate: 45,
    accent: 'ink',
    units: [],
    focus: '全文背诵、结构说明、三段讲解和结业表达。',
    boundary: '全文背诵未达90%也不取消理解和表达任务，继续生成巩固计划。',
    question: '《弟子规》哪些内容仍值得学习，哪些需要现代转化？',
    cai: {
      lecture: '完整40讲按原文调用',
      points: ['蔡老师观点必须附讲次。', '用户观点单独呈现，不要求完全一致。'],
      case: '从用户选择的三段原文调用对应讲次，不按40讲顺序复述。'
    }
  }
]

function getDay(dayNo) {
  return days.find((item) => item.day === Number(dayNo)) || days[0]
}

function getStage(stageNo) {
  return days.filter((item) => item.stage === Number(stageNo))
}

function getUnitCount() {
  return days.reduce((total, day) => total + day.units.length, 0)
}

module.exports = {
  days,
  getDay,
  getStage,
  getUnitCount
}
