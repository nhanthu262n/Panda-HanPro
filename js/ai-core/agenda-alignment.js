/* PanTutor AI v58 — Professor-agenda alignment layer.
   Keeps HSK 1–3 as the core curriculum while adding a bounded research overlay:
   AI technologies, safety/governance, industry applications, project/problem solving,
   interdisciplinary curriculum, Big Data + AI, and sequential decision analytics.
   This module is deterministic/offline-first and does not rewrite verified lexical data. */
(function(){
  'use strict';
  const KEY='pantutor_v58_agenda_track';
  const TRACKS={
    education:{id:'education',name:'Education',zh:'教育',icon:'🎓',agenda:[3,4,5,8],capability:'explain, teach, reflect and redesign learning activities'},
    healthcare:{id:'healthcare',name:'Healthcare',zh:'医疗健康',icon:'🩺',agenda:[3,4,5],capability:'describe needs, safety constraints and care scenarios'},
    manufacturing:{id:'manufacturing',name:'Manufacturing',zh:'制造业',icon:'🏭',agenda:[3,4,5,9],capability:'describe processes, quality, equipment and operational decisions'},
    energy:{id:'energy',name:'Energy',zh:'能源',icon:'⚡',agenda:[3,4,5,9],capability:'describe energy systems, efficiency, environment and operational decisions'},
    finance:{id:'finance',name:'Finance',zh:'金融',icon:'💹',agenda:[3,4,5,9],capability:'reason about value, risk, transactions and data-supported decisions'},
    agriculture:{id:'agriculture',name:'Agriculture',zh:'农业',icon:'🌾',agenda:[3,4,5,9],capability:'describe production, weather, resources and smart-agriculture decisions'},
    transportation:{id:'transportation',name:'Transportation',zh:'交通运输',icon:'🚆',agenda:[3,4,5,9],capability:'describe movement, scheduling, safety and intelligent-transport decisions'},
    ai_technology:{id:'ai_technology',name:'AI Technologies',zh:'人工智能技术',icon:'🤖',agenda:[1,9],capability:'connect language with algorithms, models, agents, data and computing infrastructure'},
    safety_governance:{id:'safety_governance',name:'AI Safety & Governance',zh:'人工智能安全与治理',icon:'🛡️',agenda:[2,9],capability:'identify risks, boundaries, oversight, privacy and responsible use'},
    big_data:{id:'big_data',name:'Big Data + AI',zh:'大数据与人工智能',icon:'📊',agenda:[1,9],capability:'describe data, measurement, comparison, evidence and analysis'},
    sequential_decision:{id:'sequential_decision',name:'Sequential Decision & Alignment',zh:'序贯决策与人工智能对齐',icon:'🧭',agenda:[1,2,9],capability:'reason about state, action, outcome, feedback and aligned next steps'},
    collaboration:{id:'collaboration',name:'Projects & Collaboration',zh:'项目与合作',icon:'🤝',agenda:[4,5,6,7,8],capability:'define problems, propose solutions, present evidence and collaborate across disciplines'}
  };
  const AGENDA=[
    'Advances in AI Technologies: algorithms, models, Generative AI, Agentic AI, autonomous systems, computing and infrastructure',
    'AI Security, Safety & Governance',
    'AI Industry Applications: Education, Healthcare, Manufacturing, Energy, Finance, Agriculture and Transportation',
    'Students Projects Review and alignment with industry applications',
    'Develop new projects focused on AI industry applications',
    'IEDE Program Alignment and collaboration',
    'Faculty engagement and talks across major schools',
    'Interdisciplinary Program Curriculum Redesign',
    'Big Data and AI; Sequential Decision Analytics and AI Alignment; major-industry applications'
  ];
  const EXTENSION=[
    ['人工智能','réngōng zhìnéng','artificial intelligence','trí tuệ nhân tạo','ai_technology'],
    ['算法','suànfǎ','algorithm','thuật toán','ai_technology'],['模型','móxíng','model','mô hình','ai_technology'],
    ['机器学习','jīqì xuéxí','machine learning','học máy','ai_technology'],['神经网络','shénjīng wǎngluò','neural network','mạng nơ-ron','ai_technology'],
    ['生成式人工智能','shēngchéngshì réngōng zhìnéng','generative AI','AI tạo sinh','ai_technology'],['大语言模型','dà yǔyán móxíng','large language model','mô hình ngôn ngữ lớn','ai_technology'],
    ['智能体','zhìnéngtǐ','AI agent','tác tử AI','ai_technology'],['智能体人工智能','zhìnéngtǐ réngōng zhìnéng','agentic AI','AI tác tử','ai_technology'],
    ['自主系统','zìzhǔ xìtǒng','autonomous system','hệ thống tự chủ','ai_technology'],['推理','tuīlǐ','reasoning / inference','suy luận','ai_technology'],
    ['训练','xùnliàn','training','huấn luyện','ai_technology'],['数据集','shùjùjí','dataset','tập dữ liệu','big_data'],['算力','suànlì','computing power','năng lực tính toán','ai_technology'],
    ['计算基础设施','jìsuàn jīchǔ shèshī','computing infrastructure','hạ tầng tính toán','ai_technology'],['云计算','yún jìsuàn','cloud computing','điện toán đám mây','ai_technology'],
    ['边缘计算','biānyuán jìsuàn','edge computing','điện toán biên','ai_technology'],['大数据','dà shùjù','big data','dữ liệu lớn','big_data'],
    ['数据分析','shùjù fēnxī','data analytics','phân tích dữ liệu','big_data'],['数据质量','shùjù zhìliàng','data quality','chất lượng dữ liệu','big_data'],
    ['数据治理','shùjù zhìlǐ','data governance','quản trị dữ liệu','safety_governance'],['信息安全','xìnxī ānquán','information security','an toàn thông tin','safety_governance'],
    ['数据隐私','shùjù yǐnsī','data privacy','quyền riêng tư dữ liệu','safety_governance'],['风险评估','fēngxiǎn pínggū','risk assessment','đánh giá rủi ro','safety_governance'],
    ['透明度','tòumíngdù','transparency','tính minh bạch','safety_governance'],['可解释性','kě jiěshì xìng','explainability','khả năng giải thích','safety_governance'],
    ['人类监督','rénlèi jiāndū','human oversight','giám sát của con người','safety_governance'],['责任','zérèn','responsibility','trách nhiệm','safety_governance'],
    ['人工智能治理','réngōng zhìnéng zhìlǐ','AI governance','quản trị AI','safety_governance'],['人工智能对齐','réngōng zhìnéng duìqí','AI alignment','căn chỉnh AI','sequential_decision'],
    ['决策分析','juécè fēnxī','decision analytics','phân tích quyết định','sequential_decision'],['序贯决策','xùguàn juécè','sequential decision making','ra quyết định tuần tự','sequential_decision'],
    ['强化学习','qiánghuà xuéxí','reinforcement learning','học tăng cường','sequential_decision'],['状态','zhuàngtài','state','trạng thái','sequential_decision'],
    ['行动','xíngdòng','action','hành động','sequential_decision'],['奖励','jiǎnglì','reward','phần thưởng','sequential_decision'],['策略','cèlüè','policy / strategy','chiến lược','sequential_decision'],
    ['教育','jiàoyù','education','giáo dục','education'],['智慧教育','zhìhuì jiàoyù','smart education','giáo dục thông minh','education'],
    ['医疗健康','yīliáo jiànkāng','healthcare','y tế và sức khỏe','healthcare'],['精准医疗','jīngzhǔn yīliáo','precision medicine','y học chính xác','healthcare'],
    ['制造业','zhìzàoyè','manufacturing','ngành sản xuất','manufacturing'],['智能制造','zhìnéng zhìzào','smart manufacturing','sản xuất thông minh','manufacturing'],
    ['能源','néngyuán','energy','năng lượng','energy'],['可再生能源','kě zàishēng néngyuán','renewable energy','năng lượng tái tạo','energy'],
    ['金融','jīnróng','finance','tài chính','finance'],['金融科技','jīnróng kējì','fintech','công nghệ tài chính','finance'],
    ['农业','nóngyè','agriculture','nông nghiệp','agriculture'],['智慧农业','zhìhuì nóngyè','smart agriculture','nông nghiệp thông minh','agriculture'],
    ['交通运输','jiāotōng yùnshū','transportation','giao thông vận tải','transportation'],['智能交通','zhìnéng jiāotōng','intelligent transportation','giao thông thông minh','transportation'],
    ['项目评审','xiàngmù píngshěn','project review','đánh giá dự án','collaboration'],['问题定义','wèntí dìngyì','problem definition','xác định vấn đề','collaboration'],
    ['解决方案','jiějué fāng'+'àn','solution','giải pháp','collaboration'],['原型','yuánxíng','prototype','nguyên mẫu','collaboration'],
    ['评估','pínggū','evaluation','đánh giá','collaboration'],['产业应用','chǎnyè yìngyòng','industry application','ứng dụng công nghiệp','collaboration'],
    ['产学合作','chǎnxué hézuò','academia-industry collaboration','hợp tác học thuật–công nghiệp','collaboration'],['跨学科','kuà xuékē','interdisciplinary','liên ngành','collaboration'],
    ['课程重构','kèchéng chónggòu','curriculum redesign','tái thiết kế chương trình','collaboration'],['学习成果','xuéxí chéngguǒ','learning outcome','kết quả học tập','education'],
    ['创新中心','chuàngxīn zhōngxīn','innovation center','trung tâm đổi mới','collaboration']
  ].map((x,i)=>({id:`AGENDA-${i+1}`,term:x[0],pinyin:x[1],meaning_en:x[2],meaning_vi:x[3],track:x[4],status:'RESEARCH_EXTENSION_REVIEW_REQUIRED'}));

  const KEYWORDS={
    education:/学校|学习|学生|老师|教师|教育|课程|考试|作业|语言|书|读|写|听|说|school|student|teacher|learn|study|education|course|exam|homework|language|giáo dục|học|trường|giáo viên/i,
    healthcare:/医院|医生|护士|病|药|身体|健康|疼|痛|治疗|hospital|doctor|nurse|health|medicine|patient|y tế|sức khỏe|bệnh|thuốc/i,
    manufacturing:/工厂|生产|产品|机器|设备|质量|材料|制造|维修|factory|manufactur|machine|equipment|quality|production|sản xuất|nhà máy|thiết bị|chất lượng/i,
    energy:/电|能源|太阳|风|环境|节约|功率|发电|electric|energy|solar|wind|environment|power|năng lượng|điện|mặt trời|môi trường/i,
    finance:/钱|银行|价格|贵|便宜|支付|买|卖|收入|费用|经济|money|bank|price|pay|buy|sell|finance|cost|tài chính|tiền|giá|ngân hàng/i,
    agriculture:/农业|农民|田|地|种|植物|水果|蔬菜|天气|雨|agricultur|farm|crop|fruit|vegetable|weather|nông nghiệp|trồng|rau|quả/i,
    transportation:/车|火车|飞机|地铁|公交|路|交通|站|司机|旅行|到|去|transport|train|plane|bus|road|station|travel|giao thông|xe|tàu|đường/i,
    ai_technology:/网络|软件|电脑|数据|技术|智能|系统|模型|算法|机器|internet|software|computer|data|technology|AI|công nghệ|dữ liệu|hệ thống/i,
    safety_governance:/安全|危险|规则|法律|责任|密码|隐私|检查|控制|safe|risk|rule|law|responsib|password|privacy|an toàn|rủi ro|quyền riêng tư|trách nhiệm/i,
    big_data:/数字|数量|多少|统计|比较|变化|结果|数据|百分|number|amount|data|compare|result|measure|số|dữ liệu|kết quả|so sánh/i,
    sequential_decision:/决定|选择|计划|如果|然后|先|再|才|应该|需要|可以|可能|decision|choose|plan|if|then|should|need|quyết định|chọn|kế hoạch|nếu/i,
    collaboration:/工作|公司|同事|会议|帮助|合作|问题|办法|介绍|讨论|报告|work|company|meeting|help|collabor|problem|solution|project|dự án|hợp tác|vấn đề|giải pháp/i
  };

  function currentTrack(){try{return localStorage.getItem(KEY)||'education';}catch(_){return'education';}}
  function setTrack(id){if(!TRACKS[id])return false;try{localStorage.setItem(KEY,id);}catch(_){}window.dispatchEvent(new CustomEvent('pantutor-v58-track-changed',{detail:{track:id}}));return true;}
  function textOf(entry){return [entry?.term,entry?.lexical?.meaning_vi,entry?.lexical?.meaning_en,entry?.lexical?.definition_zh,entry?.lexical?.pos,(entry?.wordLayer?.collocations||[]).map(x=>x.hanzi+' '+x.meaning_vi+' '+x.meaning_en).join(' '),(entry?.wordLayer?.examples||[]).map(x=>x.hanzi+' '+x.meaning_vi+' '+x.meaning_en).join(' ')].filter(Boolean).join(' | ');}
  function alignEntry(entry){
    const text=textOf(entry), scores={};
    for(const [id,re] of Object.entries(KEYWORDS))scores[id]=(text.match(re)||[]).length;
    const h=Number(entry?.hsk||0); const pos=String(entry?.lexical?.pos||'').toLowerCase();
    if(/[数]|numeral|measure|quantity/.test(pos)||/^\d+$/.test(entry?.term||''))scores.big_data=(scores.big_data||0)+2;
    if(/verb|动/.test(pos))scores.sequential_decision=(scores.sequential_decision||0)+1;
    if(/pronoun|noun|名/.test(pos))scores.collaboration=(scores.collaboration||0)+.4;
    if(entry?.entryType==='character')scores.education=(scores.education||0)+.5;
    const preferred=currentTrack();scores[preferred]=(scores[preferred]||0)+.75;
    let ranked=Object.entries(scores).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
    if(!ranked.length)ranked=[['education',1],['collaboration',.8]];
    const primary=ranked[0][0], secondary=(ranked[1]||ranked[0])[0];
    return {primary,secondary,tracks:[primary,...(secondary!==primary?[secondary]:[])],agendaItems:Array.from(new Set([...(TRACKS[primary]?.agenda||[]),...(TRACKS[secondary]?.agenda||[])])),capability:TRACKS[primary]?.capability||TRACKS.education.capability,hskLevel:h,preferredTrack:preferred,alignmentType:'HEURISTIC_PEDAGOGICAL_APPLICATION_OVERLAY',notLexicalClassification:true};
  }
  function scenarioFor(entry,trackId){
    const a=alignEntry(entry),id=TRACKS[trackId]?trackId:(a.primary||currentTrack()),t=TRACKS[id]||TRACKS.education,term=entry?.term||'';
    const base={track:id,trackName:t.name,trackZh:t.zh,icon:t.icon,capability:t.capability,agendaItems:t.agenda};
    const templates={
      education:`Use “${term}” in one Chinese sentence that could appear in a learning, classroom or student-project situation. Then explain why the word fits the context.`,
      healthcare:`Use “${term}” in a safe healthcare-related sentence. If the word is not naturally medical, use it to describe communication, time, quantity, place or a decision in a healthcare setting.`,
      manufacturing:`Use “${term}” in a sentence about a factory, product, quality, equipment, workflow or team decision.`,
      energy:`Use “${term}” in a sentence about energy, electricity, environment, operation, maintenance or a project decision.`,
      finance:`Use “${term}” in a sentence about price, payment, budgeting, risk, banking or a data-supported financial decision.`,
      agriculture:`Use “${term}” in a sentence about crops, weather, resources, farm work or a smart-agriculture decision.`,
      transportation:`Use “${term}” in a sentence about travel, route, time, vehicle, safety or an intelligent-transport decision.`,
      ai_technology:`Use “${term}” to describe a user, task, data item, action or result in an AI-system scenario. Do not invent a technical meaning for the word; preserve its normal lexical meaning.`,
      safety_governance:`Use “${term}” in a sentence that makes an AI safety, privacy, responsibility or human-oversight boundary clear.`,
      big_data:`Use “${term}” in a sentence involving observation, quantity, comparison, data collection or evidence.`,
      sequential_decision:`Use “${term}” in a short state → action → outcome situation. Explain what information should affect the next decision.`,
      collaboration:`Use “${term}” in a project-review sentence: identify a problem, action, evidence or collaboration step.`
    };
    return {...base,prompt:templates[id]||templates.education,reflection:'What did you decide yourself, and what evidence from the word or context supported your choice?',humanRole:'The learner must produce the sentence/reasoning. AI may scaffold and analyze evidence but should not replace the learner response.'};
  }
  function projectPrompt(entry,trackId){const s=scenarioFor(entry,trackId);return{...s,steps:[`1. Problem/context: choose a realistic ${s.trackName} situation.`,`2. Language action: use “${entry?.term||''}” accurately in one Chinese sentence.`,`3. Evidence: explain the lexical/context clue you relied on.`,`4. Transfer: state how the same word could be used in a second context.`,`5. Human judgment: identify one limitation or uncertainty in your answer.`]};}
  function glossary(filter=''){const q=String(filter||'').trim().toLowerCase();return !q?EXTENSION.slice():EXTENSION.filter(x=>[x.term,x.pinyin,x.meaning_en,x.meaning_vi,TRACKS[x.track]?.name].join(' ').toLowerCase().includes(q));}
  function recordProjectEvidence(term,trackId,response,reflection){
    const text=String(response||'').trim(), refl=String(reflection||'').trim();
    const present=text.includes(String(term||'')); const sufficient=text.length>=4;
    return window.PandaHanEvidence?.save?.({conceptId:term,module:'agenda_project_transfer',skill:'vocabulary',subSkill:'transfer',taskType:'industry_project_transfer',normalizedOutcome:present&&sufficient?.72:(sufficient?.45:.2),evidenceWeight:present?.68:.28,meta:{track:trackId||currentTrack(),response:text.slice(0,800),reflection:refl.slice(0,800),learnerGenerated:true,autoCheck:'surface_only_no_semantic_certification'}});
  }
  window.PanTutorAgendaAlignment={AGENDA,TRACKS,EXTENSION,currentTrack,setTrack,alignEntry,scenarioFor,projectPrompt,glossary,recordProjectEvidence,version:'58.0'};
})();
