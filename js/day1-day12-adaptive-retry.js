/* Integrated from the supplied Day 1 / Day 12 adaptive retry algorithm.
 * A/B: timing diagnosis and supported vocabulary; C: word profiles;
 * D/E: varied retries and persisted review; F: immediate Day 1 retry bank;
 * G: reading rubric. Open responses require teacher assessment.
 */
(() => {
  "use strict";
  const VERSION="v61-adaptive-retry-integrated";
  const DAY1_CHARS=["八","爸爸","二","九","六","妈妈","你","七"];
  const DAY12_CHARS=["大","的","点","电脑","电视","电影","东西","都","对","多","多少"];
  const supported=new Set([...DAY1_CHARS,...DAY12_CHARS]);
  const NEW_PROFILES = {
    // ---- Day 1 (Pinyin Bootcamp) ----
    "二": { level: 1, pinyin: "èr", radical: "二", components: ["二"], nearSynonyms: ["两"], confusables: ["儿"], grammar: ["二 + lượng từ (ít dùng, thường dùng 两 trước lượng từ)", "二 trong đếm số, ngày tháng"], listeningFocus: "Phân biệt èr (thanh 4, rơi mạnh) với ér (thanh 2, đi lên) trong 儿.", readingFocus: "Nhận diện 二 khi đếm số độc lập và khi ghép trong 十二, 二十.", modelSentences: ["我有二十本书。", "现在是二月。"] },
    "九": { level: 1, pinyin: "jiǔ", radical: "九", components: ["九"], nearSynonyms: [], confusables: ["久", "几"], grammar: ["九 + lượng từ + danh từ"], listeningFocus: "Phân biệt 九 jiǔ với từ đồng âm 久 jiǔ (dựa vào ngữ cảnh số đếm) và với 几 jǐ (khác vận mẫu).", readingFocus: "Phân biệt hình chữ 九 và 几 khi nhìn nhanh — chỉ khác một nét móc.", modelSentences: ["我有九本书。", "现在九点。"] },
    "六": { level: 1, pinyin: "liù", radical: "亠", components: ["亠", "八"], nearSynonyms: [], confusables: ["八"], grammar: ["六 + lượng từ + danh từ"], listeningFocus: "Thanh 4 của 六 rơi nhanh và dứt khoát, không kéo dài như thanh 2.", readingFocus: "Phân biệt 六 và 八 qua nét trên cùng: 亠 (một chấm+ngang) của 六 khác 丷 (hai chấm) của 八.", modelSentences: ["我有六本书。", "现在六点。"] },
    "妈妈": { level: 1, pinyin: "māma", radical: "女", components: ["女", "马"], nearSynonyms: ["母亲"], confusables: ["马", "爸爸"], grammar: ["我的 + người thân", "妈妈是..."], listeningFocus: "Thanh 1 của 妈 phải giữ cao đều; không đọc thành mǎ (thanh 3, nghĩa 'ngựa').", readingFocus: "Không bỏ âm tiết lặp trong 妈妈; phân biệt bộ 女 với chữ 马 (mã) bên phải.", modelSentences: ["我妈妈是老师。", "妈妈喜欢喝茶。"] },
    "你": { level: 1, pinyin: "nǐ", radical: "亻", components: ["亻", "尔"], nearSynonyms: ["您"], confusables: ["您"], grammar: ["你 + động từ/tính từ (câu hỏi, câu trần thuật)", "你是...吗？"], listeningFocus: "Thanh 3 đầy đủ khi 你 đứng riêng; trong 你好 hai thanh 3 liền nhau nên 你 thực tế biến điệu thành gần thanh 2.", readingFocus: "Phân biệt 你 và 您 (bộ 心 phía dưới của 您 — thể trang trọng).", modelSentences: ["你叫什么名字？", "你是学生吗？"] },
    "七": { level: 1, pinyin: "qī", radical: "一", components: ["一", "𠃌"], nearSynonyms: [], confusables: ["十"], grammar: ["七 + lượng từ + danh từ"], listeningFocus: "Âm đầu q bật hơi rõ; giữ thanh 1 cao đều xuyên suốt, không đọc thành qí.", readingFocus: "Phân biệt 七 với 十 khi viết/đọc nhanh — dễ nhầm nét ngang và nét sổ.", modelSentences: ["我有七本书。", "现在七点。"] },

    // ---- Day 12 (Từ vựng thật, có nghĩa/ngữ pháp) ----
    "大": { level: 1, pinyin: "dà", radical: "大", components: ["大"], nearSynonyms: ["巨大"], confusables: ["太", "天"], grammar: ["大 + danh từ", "... + 很大"], listeningFocus: "Thanh 4 của 大 rơi dứt khoát; phân biệt dà với tài (太, thêm một chấm).", readingFocus: "Phân biệt 大/太/天 qua vị trí nét chấm hoặc nét ngang thêm vào chữ 大.", modelSentences: ["这个房子很大。", "北京很大。"] },
    "的": { level: 1, pinyin: "de", radical: "白", components: ["白", "勺"], nearSynonyms: ["之"], confusables: ["得", "地"], grammar: ["danh từ/đại từ + 的 + danh từ (sở hữu)", "tính từ + 的 (định ngữ)"], listeningFocus: "的 luôn là thanh nhẹ (nhẹ, ngắn) — không nhấn giọng khi nghe trong cụm.", readingFocus: "Phân biệt 的/得/地 theo VỊ TRÍ ngữ pháp trong câu (sở hữu/định ngữ vs bổ ngữ vs trạng ngữ), không chỉ theo âm đọc giống nhau.", modelSentences: ["这是我的杯子。", "我爸爸的书很多。"] },
    "点": { level: 1, pinyin: "diǎn", radical: "灬", components: ["占", "灬"], nearSynonyms: ["小时"], confusables: ["店", "电"], grammar: ["số + 点 (giờ)", "一点 + danh từ (một chút)"], listeningFocus: "Phân biệt diǎn (thanh 3, chỉ giờ) với diàn (thanh 4, trong 店/电) — khác cả thanh điệu lẫn nghĩa.", readingFocus: "Phân biệt 点 với 店 và 电 qua bộ thủ phía dưới/bên trái.", modelSentences: ["现在八点。", "我要一点水。"] },
    "电脑": { level: 1, pinyin: "diànnǎo", radical: "电", components: ["电", "月", "匕"], nearSynonyms: ["计算机"], confusables: ["电视", "电影"], grammar: ["一台 + 电脑", "用电脑 + động từ"], listeningFocus: "Phân biệt đuôi -nǎo (脑) với -shì (视) và -yǐng (影) sau tiền tố 电.", readingFocus: "Ghi nhớ nguyên tắc 电 + [bộ phận sau] quyết định nghĩa: 脑=máy tính, 视=tivi, 影=phim.", modelSentences: ["我的电脑很旧。", "他在用电脑工作。"] },
    "电视": { level: 1, pinyin: "diànshì", radical: "见", components: ["电", "礻", "见"], nearSynonyms: [], confusables: ["电脑", "电影"], grammar: ["看电视", "一台电视"], listeningFocus: "Phân biệt shì (视, thanh 4) với nǎo/yǐng ở âm tiết thứ hai sau 电.", readingFocus: "Bộ 见 (nhìn) trong 视 gợi liên hệ nghĩa 'xem tivi'.", modelSentences: ["我喜欢看电视。", "电视在桌子上。"] },
    "电影": { level: 1, pinyin: "diànyǐng", radical: "彡", components: ["电", "景", "彡"], nearSynonyms: [], confusables: ["电视", "电脑"], grammar: ["看电影", "一部电影"], listeningFocus: "Phân biệt yǐng (影, thanh 3) với shì/nǎo ở âm tiết thứ hai sau 电.", readingFocus: "Bộ 彡 (ba nét xiên, gợi ánh sáng/hình ảnh chuyển động) trong 影 liên hệ nghĩa 'phim'.", modelSentences: ["我们去看电影吧。", "这部电影很好看。"] },
    "东西": { level: 1, pinyin: "dōngxi", radical: "西", components: ["木", "口", "西"], nearSynonyms: ["物品"], confusables: ["东西(dōngxī·phương hướng)"], grammar: ["买东西", "这个东西..."], listeningFocus: "Phân biệt dōngxi (thanh nhẹ ở 西, nghĩa 'đồ vật') với dōngxī (thanh 1 đầy đủ, nghĩa 'hướng đông-tây') — cùng chữ Hán, khác thanh điệu.", readingFocus: "Dựa vào ngữ cảnh (đứng sau động từ như 买/有 → đồ vật; đứng độc lập chỉ hướng → đông tây) để chọn nghĩa đúng.", modelSentences: ["我要买东西。", "杯子里有东西。"] },
    "都": { level: 1, pinyin: "dōu", radical: "阝", components: ["者", "阝"], nearSynonyms: ["全部"], confusables: ["都(dū·thủ đô)"], grammar: ["chủ ngữ (số nhiều) + 都 + động từ/tính từ"], listeningFocus: "Phân biệt dōu (thanh 1, nghĩa 'đều') với dū (cùng chữ, nghĩa 'thủ đô' trong 首都) qua ngữ cảnh câu.", readingFocus: "都 đứng trước động từ/tính từ = 'đều'; 都 trong 首都 = 'thủ đô' — phải đọc cả cụm mới xác định nghĩa.", modelSentences: ["我们都是学生。", "北京是中国的首都。"] },
    "对": { level: 1, pinyin: "duì", radical: "又", components: ["又", "寸"], nearSynonyms: ["正确"], confusables: ["错"], grammar: ["对 (đúng, dùng độc lập)", "对 + đối tượng (với, đối với)"], listeningFocus: "Phân biệt duì ('đúng') với từ trái nghĩa cuò ('sai') khi nghe phản hồi nhanh trong hội thoại.", readingFocus: "Phân biệt 对 dùng độc lập (nghĩa 'đúng') và 对 + danh từ (giới từ 'với/đối với').", modelSentences: ["你说得对。", "他对我很好。"] },
    "多": { level: 1, pinyin: "duō", radical: "夕", components: ["夕", "夕"], nearSynonyms: ["很多"], confusables: ["少"], grammar: ["多 + danh từ (nhiều)", "tính từ + 多了 (...hơn nhiều)"], listeningFocus: "Phân biệt duō ('nhiều') với từ trái nghĩa shǎo ('ít') khi nghe câu hỏi có 多少.", readingFocus: "多 gồm hai chữ 夕 xếp chồng; phân biệt với 夕 đơn lẻ (nghĩa 'buổi tối').", modelSentences: ["我有很多书。", "这里的人很多。"] },
    "多少": { level: 1, pinyin: "duōshao", radical: "少", components: ["多", "小"], nearSynonyms: ["几"], confusables: ["多小(viết nhầm 少 thành 小)"], grammar: ["多少 + danh từ (hỏi số lượng không giới hạn)", "多少钱？"], listeningFocus: "Âm tiết 少 (shao) trong 多少 thường đọc nhẹ; phân biệt với từ hỏi 几 (jǐ, dùng khi số lượng nhỏ, đoán được).", readingFocus: "Phân biệt mặt chữ 少 (shǎo — có thêm một nét phẩy) và 小 (xiǎo — không có nét phẩy đó); viết nhầm sẽ đổi hẳn nghĩa từ.", modelSentences: ["这个多少钱？", "你们班有多少学生？"] }
  };

  // Sentence translations are paired with the exact Chinese sentence, not its keyword.
  const readings={
    '八':[['现在八点。','Bây giờ là tám giờ.'],['我有八本书。','Tôi có tám quyển sách.']],
    '爸爸':[['这是我爸爸。','Đây là bố tôi.'],['爸爸在家。','Bố đang ở nhà.']],
    '二':[['我有二十本书。','Tôi có hai mươi quyển sách.'],['现在是二月。','Bây giờ là tháng hai.']],
    '九':[['我有九本书。','Tôi có chín quyển sách.'],['现在九点。','Bây giờ là chín giờ.']],
    '六':[['我有六本书。','Tôi có sáu quyển sách.'],['现在六点。','Bây giờ là sáu giờ.']],
    '妈妈':[['妈妈在家。','Mẹ đang ở nhà.'],['这是我妈妈。','Đây là mẹ tôi.']],
    '你':[['你是学生吗？','Bạn có phải là học sinh không?'],['你叫什么名字？','Bạn tên là gì?']],
    '七':[['我有七本书。','Tôi có bảy quyển sách.'],['现在七点。','Bây giờ là bảy giờ.']],
    '大':[['这个房间很大。','Căn phòng này rất rộng.'],['那只狗很大。','Con chó kia rất to.']],
    '的':[['这是我的杯子。','Đây là cốc của tôi.'],['我爸爸的书很多。','Bố tôi có rất nhiều sách.']],
    '点':[['现在八点。','Bây giờ là tám giờ.'],['我要一点水。','Tôi muốn một ít nước.']],
    '电脑':[['我的电脑很旧。','Máy tính của tôi rất cũ.'],['他在用电脑工作。','Anh ấy đang dùng máy tính làm việc.']],
    '电视':[['我喜欢看电视。','Tôi thích xem tivi.'],['电视在桌子上。','Tivi ở trên bàn.']],
    '电影':[['我们去看电影吧。','Chúng ta đi xem phim nhé.'],['这部电影很好看。','Bộ phim này rất hay.']],
    '东西':[['我要买东西。','Tôi muốn mua đồ.'],['杯子里有东西。','Có đồ ở trong cốc.']],
    '都':[['我们都是学生。','Chúng tôi đều là học sinh.'],['他们都喜欢喝茶。','Họ đều thích uống trà.']],
    '对':[['你说得对。','Bạn nói đúng.'],['这个答案是对的。','Đáp án này là đúng.']],
    '多':[['我有很多书。','Tôi có rất nhiều sách.'],['这里的人很多。','Ở đây có rất nhiều người.']],
    '多少':[['这个多少钱？','Cái này bao nhiêu tiền?'],['你们班有多少学生？','Lớp bạn có bao nhiêu học sinh?']]
  };
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=v=>String(v??'').toLowerCase().normalize('NFKC').replace(/[\s\p{P}\p{S}]/gu,'');
  function vocab(){try{return typeof VOCAB!=='undefined'?VOCAB:window.VOCAB||[]}catch(_){return []}}
  function wordOf(char){return vocab().find(w=>w.char===char)||null}
  function meaning(w){return String(w?.meaning||w?.meaning_vn||w?.meaning_en||'').trim()}
  function owner(){return window.firebase?.auth?.().currentUser?.uid||window.PanTutorLessonAccess?.namespace?.()||'guest'}
  function seedFor(char,layer){const key=`pantutor_retry_seed_${owner()}_${char}_${layer}`;try{const n=Number(localStorage.getItem(key)||0)+1;localStorage.setItem(key,String(n));return n}catch(_){return 1}}
  function shuffle(arr,seed){const a=[...new Set(arr.filter(Boolean))];let x=seed*2654435761|0;for(let i=a.length-1;i>0;i--){x=(Math.imul(x,1664525)+1013904223)|0;const j=(x>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  function mergeProfiles(){window.PandaHanVocabularyPilot=window.PandaHanVocabularyPilot||{};for(const char of supported){const existing=window.PandaHanVocabularyPilot[char]||{};window.PandaHanVocabularyPilot[char]={...NEW_PROFILES[char],...existing,modelSentences:readings[char].map(r=>r[0])}}}
  function contextMeaning(char,sentence,w){if(char==='点')return sentence.includes('一点')?'một chút':'giờ';return ({'的':'của','都':'đều','对':'đúng','多少':'bao nhiêu'})[char]||meaning(w)}
  const profile=char=>window.PandaHanVocabularyPilot?.[char]||{};
  function tones(pinyin){return String(pinyin||'').normalize('NFD').toLowerCase().split(/(?<=[aeiouüvnm])(?=[bpmfdtnlgkhjqxrzcswy])/).map(s=>s.includes('\u0304')?'1':s.includes('\u0301')?'2':s.includes('\u030c')?'3':s.includes('\u0300')?'4':'5')}
  // Split by Hanzi syllable count where pronunciation spelling joins a neutral syllable (bàba, māma).
  function toneSequence(char,pinyin){
    const explicit={'八':'1','爸爸':'4 5','二':'4','九':'3','六':'4','妈妈':'1 5','你':'3','七':'1','大':'4','的':'5','点':'3','电脑':'4 3','电视':'4 4','电影':'4 3','东西':'1 5','都':'1','对':'4','多':'1','多少':'1 5'};
    return explicit[char]||tones(pinyin).join(' ');
  }
  function question(inputType,prompt,answer,options,extras={}){return{inputType,prompt,answerLabel:answer,options:options||[],checkAnswer:v=>clean(v)===clean(answer),...extras}}
  function choices(char,seed){const p=profile(char);return shuffle([char,...(p.confusables||[]).map(x=>String(x).replace(/\(.*\)/,'').trim()).filter(x=>x!==char&&wordOf(x)),...vocab().filter(w=>w.char!==char&&w.hsk===wordOf(char)?.hsk).slice(0,8).map(w=>w.char)],seed).slice(0,4)}
  function withTarget(char,seed){return shuffle([char,...choices(char,seed).filter(x=>x!==char).slice(0,3)],seed)}
  function buildRetryQuestion(char,layer,context={}){
    const w=wordOf(char);if(!w)return null;layer=Number(layer)||6;const seed=seedFor(char,layer),p=profile(char),examples=readings[char]||[],ex=examples[(seed-1)%Math.max(1,examples.length)]?.[0]||p.modelSentences?.[0]||'';
    const dim=context.dimension||({2:'MEANING',3:'MEANING',4:'SOUND',5:'FORM',6:'FORM',7:'PRODUCTION',8:'SOUND',9:'SOUND',10:'USAGE'})[layer]||'MEANING';let q;
    if(layer===2){
      if(dim==='SOUND')q=question('text','Nghe rồi gõ Pinyin có dấu của từ vừa phát.',w.pinyin,[],{speak:char});
      else if(dim==='FORM')q=question('text',`Viết chữ Hán ứng với Pinyin ${w.pinyin}.`,char);
      else{const cm=contextMeaning(char,ex,w),aliases=[cm,...(char==='点'?[]:[meaning(w),w.meaning_en])].filter(Boolean).flatMap(x=>[x,...x.split(/[;,/]/)]).map(clean);q=question('text',`Trong câu “${ex||char}”, “${char}” có nghĩa gì?`,cm,[],{checkAnswer:v=>!!clean(v)&&aliases.includes(clean(v))})}
    }else if(layer===3){q=question('choice',`Chọn từ để hoàn thành: ${ex?ex.split(char).join('____'):'Từ nào có nghĩa '+meaning(w)+'?'}`,char,withTarget(char,seed));}
    else if(layer===4){const options=shuffle([w.pinyin,...vocab().filter(v=>v.char!==char&&v.pinyin!==w.pinyin).slice(0,15).map(v=>v.pinyin).slice(0,3)],seed);q=question('choice','Nghe và chọn đúng Pinyin.',w.pinyin,options,{speak:char});}
    else if(layer===5)q=question('choice',`Chọn chữ có Pinyin “${w.pinyin}” và nghĩa “${meaning(w)}”.`,char,withTarget(char,seed));
    else if(layer===6)q=question('text',`Học mẫu: ${char} · ${w.pinyin} · ${meaning(w)}. ${ex} Gõ lại chữ vừa học.`,char,[],{hintShown:true,learnMode:true});
    else if(layer===7)q=question('text',`Bạn đã gặp khó khăn nhiều lần với “${char}”. Viết câu mới để giáo viên xem lại. Ví dụ tham khảo: ${ex}`,ex,[],{openEnded:true,escalateToTeacher:true});
    else if(layer===8){const seq=toneSequence(char,w.pinyin),parts=seq.split(' '),alts=[seq,...['1','2','3','4','5'].filter(n=>n!==parts[parts.length-1]).map(n=>[...parts.slice(0,-1),n].join(' '))];q=question('choice','Nghe và chọn chuỗi thanh điệu theo thứ tự âm tiết (5 = thanh nhẹ).',seq,shuffle(alts,seed),{speak:char});}
    else if(layer===9)q=question('choice','Nghe và chọn nghĩa phù hợp.',meaning(w),shuffle([meaning(w),...vocab().filter(v=>v.char!==char).map(meaning).filter(x=>x!==meaning(w)).slice(0,3)],seed),{speak:char});
    else if(layer===10)q=ex.includes(char)?question('text',`Điền đúng từ vào câu: ${ex.split(char).join('____')}`,char):question('text',`Viết câu mới dùng “${char}”.`,ex,[],{openEnded:true});
    else return buildRetryQuestion(char,2,context);
    return{...q,char,layer,seed,dimension:dim,instruction:({2:'Kiểm tra lại không gợi ý',3:'Phân biệt cách dùng',4:'Phân biệt âm',5:'Nhận diện chữ',6:'Học lại mẫu',7:'Cần giáo viên xem',8:'Luyện thanh điệu',9:'Luyện nghe',10:'Dùng từ trong câu'})[layer],explanation:[p.listeningFocus,p.readingFocus,...(p.grammar||[])].filter(Boolean).join(' ')};
  }
  function latest(char){const events=window.PanTutorTenLayer?.diagnose(window.PanTutorAttemptHistory?.allRows?.()||[])||[];return events.filter(e=>e.target===char).at(-1)}
  function layerFor(item){if(item.layer)return item.layer;const e=latest(item.char);if(e?.diagnosisClass)return e.diagnosisClass;return /pinyin|tone|sound|listen|phonetic/i.test(item.type||item.source||'')?4:/writing|usage/i.test(item.type||'')?10:6}
  const READING_RUBRIC_WEIGHTS={recognition:25,comprehension:35,inference:25,fluency:15};
  function readingFluencyFit(ms,len){if(!(ms>0))return null;const ratio=ms/Math.max(1500,Number(len||6)*550);return ratio<.35?.35:ratio<=1.8?1-Math.abs(1-Math.min(ratio,1.4))*.15:Math.max(.4,1-(ratio-1.8)*.25)}
  function buildReadingSet(char){
    const w=wordOf(char);if(!w)return [];const seed=seedFor(char,'reading-set');
    if(DAY1_CHARS.includes(char)){
      const py=String(w.pinyin||''),base=py.normalize('NFD').replace(/[\u0300-\u036f]/g,''),seq=toneSequence(char,py);
      return[
        {...question('choice','Nghe và chọn Pinyin không dấu.',base,shuffle([base,...['ba','ma','liu','jiu'].filter(x=>x!==base).slice(0,2)],seed),{speak:char}),type:'syllable-recognition',leg:'recognition',dimension:'SOUND'},
        {...question('text',`Đọc Pinyin “${py}” và ghi chuỗi thanh điệu (1–4, thanh nhẹ = 5).`,seq),type:'tone-mark-recognition',leg:'recognition',dimension:'SOUND'},
        {...question('choice',`Pinyin “${py}” ứng với chữ nào?`,char,withTarget(char,seed)),type:'pinyin-hanzi-match',leg:'comprehension',dimension:'FORM'}
      ].map(q=>({...q,char,sentenceLen:py.length}));
    }
    const exs=readings[char];if(!exs)return [];const [s1,m1]=exs[(seed-1)%exs.length],[s2,m2]=exs[seed%exs.length];
    const meanings=Object.values(readings).flat().map(x=>x[1]).filter(x=>x!==m1&&x!==m2),truth=seed%2===0,claim=truth?m2:meanings[seed%meanings.length];
    return[
      {...question('choice',`Trong câu “${s1}”, từ nào đang được học với nghĩa “${contextMeaning(char,s1,w)}”?`,char,withTarget(char,seed)),type:'keyword-spot',leg:'recognition',dimension:'MEANING'},
      {...question('choice',`Chọn nghĩa của cả câu: “${s1}”`,m1,shuffle([m1,...shuffle(meanings,seed).slice(0,3)],seed)),type:'sentence-meaning',leg:'comprehension',dimension:'MEANING'},
      {...question('choice',`Câu “${s2}” có nghĩa “${claim}”. Đúng hay sai?`,truth?'Đúng':'Sai',['Đúng','Sai']),type:'true-false-detail',leg:'comprehension',dimension:'MEANING'},
      {...question('text',`Điền từ vào câu: ${s2.split(char).join('____')}`,char),type:'cloze',leg:'comprehension',dimension:'USAGE'},
      {...question('text',`Từ câu “${s1}”, hãy mô tả một tình huống có thể dùng câu này và giải thích.`,m1,[],{openEnded:true}),type:'inference',leg:'inference',dimension:'PRODUCTION'}
    ].map(q=>({...q,char,sentenceLen:s1.length}));
  }
  function computeReadingScore(results){
    const legScores={},verified=results.filter(r=>r.verified===true&&typeof r.correct==='boolean'&&!r.hintShown),pending=results.filter(r=>r.openEnded&&!r.verified).length;
    let weighted=0,usedWeight=0;
    for(const [leg,weight]of Object.entries(READING_RUBRIC_WEIGHTS)){if(leg==='fluency')continue;const rs=verified.filter(r=>r.leg===leg);if(rs.length){const avg=100*rs.filter(r=>r.correct).length/rs.length;legScores[leg]=Math.round(avg);weighted+=avg*weight;usedWeight+=weight}}
    const timed=verified.filter(r=>r.responseMs>0),fit=timed.map(r=>(r.correct?readingFluencyFit(r.responseMs,r.sentenceLen):0));
    const fluency=fit.length?Math.round(fit.reduce((a,b)=>a+b,0)/fit.length*100):null;
    if(fluency!==null){weighted+=fluency*15;usedWeight+=15}
    return{score:usedWeight?Math.round(weighted/usedWeight):null,legScores,fluency,pending,usedWeight,provisional:pending>0,verifiedCount:verified.length};
  }
  function style(){if(document.getElementById('ptRetryStyle'))return;const el=document.createElement('style');el.id='ptRetryStyle';el.textContent=`#ptRetryOverlay{position:fixed;inset:0;z-index:130000;background:#14203999;backdrop-filter:blur(4px);display:grid;place-items:center;padding:18px}#ptRetryPanel{width:min(930px,100%);max-height:92vh;overflow:auto;box-sizing:border-box;background:#f5f8fc;border-radius:24px;padding:24px;color:#17324b;box-shadow:0 20px 70px #14203944}.ptr-card{background:white;border:1px solid #dce6f3;border-radius:18px;padding:24px;margin:16px 0}.ptr-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ptr-options button,.ptr-btn{border:1px solid #d7e3f4;border-radius:12px;background:white;color:#17324b;padding:14px;cursor:pointer;font:inherit}.ptr-btn.primary{background:#2563eb;color:white}.ptr-input{width:100%;box-sizing:border-box;padding:14px;font:inherit;border:1px solid #cbd5e1;border-radius:12px}.ptr-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:15px}.ptr-muted{color:#62748b;font-size:14px}.ptr-listen{text-align:center;padding:20px}.ptr-prompt{font-size:22px;line-height:1.5}#ptRetryPanel button:disabled{opacity:.6;cursor:default}@media(max-width:550px){.ptr-options{grid-template-columns:1fr}#ptRetryPanel{padding:15px}}`;document.head.appendChild(el)}
  function speak(text){if(!window.speechSynthesis)return false;try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.85;window.speechSynthesis.speak(u);return true}catch(_){return false}}
  function allRows(){return window.PanTutorAttemptHistory?.allRows?.()||[]}
  function dayOf(m){return Math.max(1,Math.min(120,Number(m?.dayNumber||window.PandaHanMission?.getCurrent?.()?.dayNumber||1)))}
  async function saveAnswer(q,value,correct,responseMs,day,reading){
    const prior=window.PanTutorMemory?.getState?.(q.char,q.dimension);
    const taskId=q.learnMode?'memory_learning':q.openEnded?'teacherDraft':reading?'reading_writing':'remediation';
    const verified=!q.openEnded&&!q.learnMode;
    const item={target:q.char,dimension:q.dimension,input:value,expected:q.answerLabel,prompt:q.prompt,correct:verified?correct:null,score:verified?(correct?100:0):null,verified,responseMs,diagnosisClass:q.layer||null,kind:q.dimension==='SOUND'?'pinyin':q.dimension==='FORM'?'form':'reading',source:'adaptive-retry-v61',hintShown:!!q.hintShown,openEnded:!!q.openEnded,leg:q.leg||null,sentenceLen:q.sentenceLen||0,memoryReview:!reading&&verified&&['FORM','MEANING','SOUND'].includes(q.dimension),learnCompleted:prior?.learned===true,confidence:'unspecified'};
    const saved=await window.PanTutorAttemptHistory.save({dayNumber:day,taskId,scorePercent:verified&&correct?100:0,passed:verified&&correct,completeSet:false,correct:verified&&correct?1:0,total:verified?1:0,items:[item],scheduleSaved:false});
    return{...item,saved,leg:q.leg};
  }
  function session(questions,{mission,reading=false,onDone,returnTo}={}){
    style();document.getElementById('ptRetryOverlay')?.remove();const ov=document.createElement('div');ov.id='ptRetryOverlay';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');document.body.appendChild(ov);
    const sessionOwner=owner(),day=dayOf(mission),results=[];let index=0,closed=false,finishing=false;
    function close(){closed=true;window.speechSynthesis?.cancel();ov.remove();returnTo?.()}
    function valid(){return !closed&&ov.isConnected&&owner()===sessionOwner}
    async function finish(){
      if(finishing||!valid())return;finishing=true;
      const rubric=reading?computeReadingScore(results):{score:Math.round(100*results.filter(r=>r.verified&&r.correct).length/Math.max(1,results.filter(r=>r.verified).length)),pending:results.filter(r=>r.openEnded).length};
      const verified=results.filter(r=>r.verified),complete=results.length===questions.length&&verified.length===questions.length;
      ov.innerHTML='<div id="ptRetryPanel"><p>Đang lưu tổng kết…</p></div>';
      try{
        await window.PanTutorAttemptHistory.save({dayNumber:day,taskId:reading?'reading_rubric':'adaptive_retry_summary',scorePercent:rubric.score??0,passed:complete&&(rubric.score??0)>=(reading?60:70),completeSet:complete,total:verified.length,correct:verified.filter(r=>r.correct).length,items:[{target:'',input:'Tổng kết phiên',expected:'',rubric,sourceAttemptIds:results.map(r=>r.saved.attemptId),pending:rubric.pending}],scheduleSaved:false});
        let scheduleText='Kết quả đã lưu. Lịch mở ngày vẫn theo điều kiện Tone Quest.';
        if(!valid())return;
        const allMistakesResolved=!(window.PandaHanMistakes?.getQueue?.()||[]).length;
        if(complete&&(reading||(!returnTo&&allMistakesResolved))){try{await window.PandaHanSchedule?.recordTaskScore?.(day,reading?'reading_writing':'mistake_review',rubric.score,'verified:adaptive-retry-v61',{completeSet:true,passThreshold:reading?60:70,correct:verified.filter(r=>r.correct).length,total:verified.length,evidenceType:reading?'reading_rubric_v61':'adaptive_retry_v61'});}catch(_){scheduleText='Kết quả đã lưu; cập nhật tiến độ đang chờ kết nối.'}}
        if(!valid())return;
        ov.innerHTML=`<div id="ptRetryPanel"><h2>${reading?'Kết quả bài đọc':'Kết quả luyện lại'}</h2><p>${rubric.score==null?'Chưa có điểm đã xác minh':`${rubric.score}/100${rubric.pending?' · điểm tạm tính':''}`}</p><p>${verified.filter(r=>r.correct).length}/${verified.length} câu đã kiểm tra đúng. ${rubric.pending||0} câu chờ giáo viên xem.</p>${reading?`<div class="ptr-card">Nhận diện (25): ${rubric.legScores.recognition??'Chưa đánh giá'}<br>Hiểu nghĩa (35): ${rubric.legScores.comprehension??'Chưa đánh giá'}<br>Suy luận (25): ${rubric.legScores.inference??'Chờ đánh giá / chưa áp dụng'}<br>Tốc độ (15): ${rubric.fluency??'Chưa đo'}<p class="ptr-muted">Mỗi tiêu chí hiển thị trên thang 100. Chỉ chuẩn hóa các trọng số có dữ liệu (${rubric.usedWeight}/100). Tốc độ là chỉ số hỗ trợ, không chứng minh khả năng đọc thành thạo.</p></div>`:''}<p>${scheduleText}</p><div class="ptr-actions"><button class="ptr-btn primary" data-close>Hoàn thành</button></div></div>`;
        ov.querySelector('[data-close]').onclick=close;onDone?.(rubric);
      }catch(e){finishing=false;ov.innerHTML=`<div id="ptRetryPanel"><p>Chưa lưu tổng kết: ${esc(e.message)}</p><button class="ptr-btn" data-save>Thử lưu lại</button><button class="ptr-btn" data-close>Đóng</button></div>`;ov.querySelector('[data-save]').onclick=finish;ov.querySelector('[data-close]').onclick=close}
    }
    function render(){
      if(!valid()){close();return}if(index>=questions.length){finish();return}
      const q=questions[index];let graded=false;const started=Date.now();
      ov.innerHTML=`<div id="ptRetryPanel"><button class="ptr-btn" style="float:right" data-close>Thoát</button><h2>AI Coach · ${reading?'Luyện đọc':'Luyện lại'}</h2><p class="ptr-muted">Ngày ${day} · ${index+1}/${questions.length}${q.speak?'':' · '+esc(q.char)}</p><progress max="${questions.length}" value="${index}" style="width:100%"></progress><div class="ptr-card"><p class="ptr-muted">${esc(q.instruction||'Đọc kỹ yêu cầu và trả lời.')}</p><div class="ptr-prompt">${esc(q.prompt)}</div>${q.speak?'<div class="ptr-listen"><div style="font-size:50px">🔊</div><button class="ptr-btn primary" data-audio>Nghe âm mẫu</button><p data-audio-status></p></div>':''}${q.inputType==='choice'?`<div class="ptr-options">${q.options.map((o,i)=>`<button data-choice="${i}">${esc(o)}</button>`).join('')}</div>`:'<textarea class="ptr-input" rows="2" data-input placeholder="Nhập câu trả lời"></textarea><button class="ptr-btn primary" data-check>Gửi câu trả lời</button>'}<div data-feedback></div></div></div>`;
      ov.querySelector('[data-close]').onclick=close;
      if(q.speak)ov.querySelector('[data-audio]').onclick=()=>{if(!speak(q.speak))ov.querySelector('[data-audio-status]').textContent='Thiết bị chưa phát được âm. Bạn có thể thoát và thử lại khi âm thanh hoạt động.'};
      async function grade(value){
        if(graded||!valid()||!String(value).trim())return;graded=true;
        ov.querySelectorAll('[data-choice],[data-check],[data-input]').forEach(n=>n.disabled=true);
        const correct=q.openEnded?null:!!q.checkAnswer(value),feedback=ov.querySelector('[data-feedback]');feedback.textContent='Đang lưu câu trả lời…';
        try{
          const row=await saveAnswer(q,String(value),correct,Date.now()-started,day,reading);results.push(row);
          if(correct&&row.verified&&!q.hintShown&&q.mistakeKey)window.PandaHanMistakes?.resolveEntry?.(q.mistakeKey);
          if(!valid())return;
          feedback.innerHTML=`<div class="ptr-card"><b>${q.openEnded?'Đã lưu, chờ giáo viên đánh giá':q.learnMode?'Đã học mẫu — chưa tính là nhớ':correct?'Đúng':'Chưa đúng'}</b><p>Bạn trả lời: ${esc(value)}</p><p>${q.openEnded?'Gợi ý tham khảo':'Đáp án'}: ${esc(q.answerLabel)}</p><p>${esc(q.explanation||'')}</p><p class="ptr-muted">${row.saved.synced?'Đã đồng bộ':'Đã lưu trên máy, chờ đồng bộ'}${q.openEnded?' · Nội dung nằm trong chi tiết học sinh để giáo viên xem.':''}</p><button class="ptr-btn primary" data-next>Tiếp theo</button></div>`;
          feedback.querySelector('[data-next]').onclick=()=>{index++;render()};
        }catch(e){if(!valid())return;graded=false;feedback.textContent='Chưa lưu được: '+e.message;ov.querySelectorAll('[data-choice],[data-check],[data-input]').forEach(n=>n.disabled=false)}
      }
      ov.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>grade(q.options[Number(b.dataset.choice)]));
      const input=ov.querySelector('[data-input]');if(input)ov.querySelector('[data-check]').onclick=()=>grade(input.value);
    }
    render();
  }
  function renderRetryPanel(items,onAllDone,mission,returnTo){const questions=items.map(it=>{const q=buildRetryQuestion(it.char,layerFor(it),it);return q?{...q,mistakeKey:it.key}:null}).filter(Boolean);if(!questions.length){returnTo?.();return false}session(questions,{mission,onDone:onAllDone,returnTo});return true}
  function renderReadingSession(chars,onDone,mission){session(chars.flatMap(buildReadingSet),{mission,reading:true,onDone})}
  function buildDay1BackupBank(){return DAY1_CHARS.map(char=>({char,angles:[4,9,6].map(layer=>buildRetryQuestion(char,layer)).filter(Boolean)}))}
  function wrapNext(buttonId,mission,char,correct,layer=4){
    if(correct||![1,12].includes(dayOf(mission))||!supported.has(char))return;
    const button=document.getElementById(buttonId);if(!button||button.dataset.retryBound)return;button.dataset.retryBound='true';const next=button.onclick;
    button.onclick=()=>{button.disabled=true;let done=false;const proceed=()=>{if(done)return;done=true;next?.()};renderRetryPanel([{char,layer}],null,mission,proceed)};
  }
  function boot(){
    mergeProfiles();const skills=window.PandaHanCoachSkills;if(!skills||skills.__adaptiveRetryIntegrated)return;
    const oldMistakes=skills.openMistakeReview,oldRW=skills.openReadingWriting;
    skills.openMistakeReview=function(m){const queue=window.PandaHanMistakes?.getQueue?.()||[],items=queue.filter(i=>supported.has(i.char));if(!items.length)return oldMistakes?.(m);return renderRetryPanel(items.slice(0,12),null,m,queue.some(i=>!supported.has(i.char))?()=>oldMistakes?.(m):undefined)};
    skills.openReadingWriting=function(m){const mission=m||window.PandaHanMission?.getCurrent?.(),day=dayOf(mission);if(![1,12].includes(day))return oldRW?.(m);style();document.getElementById('ptRetryOverlay')?.remove();const ov=document.createElement('div');ov.id='ptRetryOverlay';ov.innerHTML='<div id="ptRetryPanel"><h2>AI Coach · Đọc / Viết</h2><p>Chọn nội dung muốn luyện. Bài đọc mới chấm riêng từng tiêu chí.</p><div class="ptr-actions"><button class="ptr-btn primary" data-read>Luyện đọc theo tiêu chí</button><button class="ptr-btn" data-write>Đọc / Viết theo lộ trình</button><button class="ptr-btn" data-close>Thoát</button></div></div>';document.body.appendChild(ov);ov.querySelector('[data-read]').onclick=()=>{ov.remove();renderReadingSession(day===1?DAY1_CHARS:DAY12_CHARS,null,mission)};ov.querySelector('[data-write]').onclick=()=>{ov.remove();oldRW?.(mission)};ov.querySelector('[data-close]').onclick=()=>ov.remove()};
    skills.__adaptiveRetryIntegrated=true;skills.buildRetryQuestion=buildRetryQuestion;skills.buildReadingSet=buildReadingSet;
  }
  window.PandaHanDay1BackupBank={build:buildDay1BackupBank};
  window.PandaHanReadingAlgorithm={VERSION,buildReadingSet,computeReadingScore,weights:READING_RUBRIC_WEIGHTS};
  window.PandaHanAdaptiveRetryV1={VERSION,buildRetryQuestion,DAY1_CHARS,DAY12_CHARS,wrapNext,renderRetryPanel,renderReadingSession,isPilot:char=>supported.has(char),boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
