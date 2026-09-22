/* PanTutor AI v57.2 — transparent runtime data-quality correction overlay.
   The original v56 source is preserved. Runtime corrections are kept transparently in this code overlay. */
(function(){
  'use strict';
  const applied=[];
  function getWord(term){try{return (typeof VOCAB_BY_CHAR!=='undefined'&&VOCAB_BY_CHAR[term])||null}catch(_){return null}}
  function mark(w,note){if(!w)return;w.data_quality_v57={status:'RESEARCH_TEAM_CORRECTION_REVIEWABLE',note,version:'57.2'};}
  function rename(oldTerm,newTerm,note){
    try{
      if(typeof VOCAB_BY_CHAR==='undefined'||typeof VOCAB==='undefined')return;
      const w=VOCAB_BY_CHAR[oldTerm]; if(!w||VOCAB_BY_CHAR[newTerm])return;
      delete VOCAB_BY_CHAR[oldTerm]; w.char=newTerm; VOCAB_BY_CHAR[newTerm]=w; mark(w,note);
      if(typeof STATS!=='undefined'&&STATS[oldTerm]&&!STATS[newTerm]){STATS[newTerm]=STATS[oldTerm];delete STATS[oldTerm];try{saveStats()}catch(_){}}
      applied.push({type:'rename',from:oldTerm,to:newTerm,note});
    }catch(_){}
  }
  function example(term,zh,py,vi,en,note){const w=getWord(term);if(!w)return;w.examples=w.examples||[];w.examples[0]=[zh,py,vi,en];mark(w,note);applied.push({type:'example',term,note});}
  function lexical(term,field,value,note){const w=getWord(term);if(!w)return;w[field]=value;mark(w,note);applied.push({type:'lexical',term,field,note});}
  rename('补衣','衬衣','Pinyin/meaning/curriculum/example consistently identify 衬衣 (chènyī, shirt); corrected inconsistent term label 补衣.');
  rename('贏','赢','PanTutor HSK path targets simplified Chinese; normalized traditional 贏 to simplified 赢.');
  example('办','我来办这件事。','Wǒ lái bàn zhè jiàn shì.','Tôi sẽ xử lý việc này.','I will handle this matter.','Added target-consistent context example.');
  example('搬家','我们下个月搬家。','Wǒmen xià ge yuè bānjiā.','Tháng sau chúng tôi chuyển nhà.','We are moving house next month.','Added target-consistent context example.');
  example('保安','保安在门口工作。','Bǎo’ān zài ménkǒu gōngzuò.','Nhân viên bảo vệ làm việc ở cửa ra vào.','The security guard works at the entrance.','Added target-consistent context example.');
  example('衬衣','妈妈给我买了一件衬衣。','Māma gěi wǒ mǎile yí jiàn chènyī.','Mẹ đã mua cho tôi một chiếc áo sơ mi.','Mom bought me a shirt.','Repaired target/example mismatch after 衬衣 normalization.');
  example('工夫','做好这件事要花很多工夫。','Zuò hǎo zhè jiàn shì yào huā hěn duō gōngfu.','Làm tốt việc này cần tốn nhiều thời gian và công sức.','Doing this well takes a lot of time and effort.','Repaired target/example internal mismatch.');
  example('空儿','你今天有空儿吗？','Nǐ jīntiān yǒu kòngr ma?','Hôm nay bạn có rảnh không?','Do you have some free time today?','Repaired target/example mismatch.');
  example('牌子','这个牌子的衣服很受欢迎。','Zhège páizi de yīfu hěn shòu huānyíng.','Quần áo của nhãn hiệu này rất được ưa chuộng.','Clothes from this brand are very popular.','Repaired 品牌/牌子 mismatch.');
  example('事实上','事实上，他已经知道了。','Shìshí shang, tā yǐjīng zhīdào le.','Thực ra, anh ấy đã biết rồi.','In fact, he already knew.','Repaired 实际上/事实上 mismatch.');
  example('赢','我们队赢了比赛。','Wǒmen duì yíng le bǐsài.','Đội của chúng tôi đã thắng trận đấu.','Our team won the match.','Normalized example to simplified 赢.');
  example('杂志','我喜欢读时尚杂志。','Wǒ xǐhuān dú shíshàng zázhì.','Tôi thích đọc tạp chí thời trang.','I like reading fashion magazines.','Repaired unrelated Chinese example / pinyin mismatch.');
  lexical('正','meaning','đang; vừa đúng, chính xác','Filled missing Vietnamese meaning for zhèng adverb; cross-checked against existing example/English meaning and 汉典 usage.');
  example('责任','这是我的责任。','Zhè shì wǒ de zérèn.','Đây là trách nhiệm của tôi.','This is my responsibility.','Repaired 负责/责任 mismatch.');
  window.PandaHanDataQualityPatch={version:'57.2',applied,correctionFile:null};
})();
