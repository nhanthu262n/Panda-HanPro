/* PanTutor AI v57.3 — lean Vocabulary Intelligence.
   Uses the existing 2,254-entry PanTutor VOCAB database as the single runtime source.
   Intelligence metadata is derived lazily so the browser does not parse/keep a second 5 MB copy. */
(function(){
  'use strict';
  let ready=false, summary=null;
  const entryCache=new Map();
  const charIndex=new Map();
  const hskPools={1:[],2:[],3:[]};

  function baseWords(){ try { return (typeof VOCAB!=='undefined' && Array.isArray(VOCAB)) ? VOCAB : []; } catch(_) { return []; } }
  function byTerm(term){ try { return (typeof VOCAB_BY_CHAR!=='undefined' && VOCAB_BY_CHAR[String(term||'')]) || null; } catch(_) { return null; } }
  function sourceStatus(w){
    const src=String(w?.chietu_source||'').toLowerCase();
    if(src==='verified'||src.includes('verified')) return 'VERIFIED';
    if(src.includes('ai_generated')||src.includes('ai generated')) return 'AI_DRAFT_REVIEW_REQUIRED';
    if(src.includes('giáo viên')||src.includes('giao vien')||src.includes('teacher')) return 'TEACHER_CURATED';
    return 'NEEDS_REVIEW';
  }
  function sourceRefsFor(term){
    const single=Array.from(String(term||'')).length===1;
    return single ? ['PANTUTOR_CORE','GF0025_2021','UNICODE_UNIHAN','MAKE_ME_A_HANZI','CC_CEDICT'] : ['PANTUTOR_CORE','GF0025_2021','CC_CEDICT'];
  }
  function normalizeCollocations(w){ return (w?.cumtu||[]).map(c=>({hanzi:c?.[0]||'',pinyin:c?.[1]||'',meaning_vi:c?.[2]||'',meaning_en:c?.[3]||''})).filter(x=>x.hanzi); }
  function normalizeExamples(w){ return (w?.examples||[]).map(c=>({hanzi:c?.[0]||'',pinyin:c?.[1]||'',meaning_vi:c?.[2]||'',meaning_en:c?.[3]||''})).filter(x=>x.hanzi); }
  function relatedTerms(term,limit=18){
    const out=[], seen=new Set([term]);
    for(const ch of Array.from(String(term||''))){
      const list=charIndex.get(ch)||[];
      for(const t of list){ if(!seen.has(t)){seen.add(t);out.push(t);if(out.length>=limit)return out;} }
    }
    return out;
  }
  function buildEntry(w){
    if(!w) return null;
    const term=String(w.char||''); if(!term) return null;
    if(entryCache.has(term)) return entryCache.get(term);
    const single=Array.from(term).length===1;
    const status=sourceStatus(w);
    const e={
      id:`PTV572-${term}`,
      term,
      entryType:single?'character':'word_or_phrase',
      hsk:Number(w.hsk||0),
      lexical:{pinyin:w.pinyin||'',hanviet:w.hanviet||'',pos:w.pos||'',meaning_vi:w.meaning||'',meaning_en:w.meaning_en||'',definition_zh:w.def_zh||''},
      characterLayer:{
        characters:Array.from(term),
        legacyAnalysis:w.chietu_vi||w.chietu_en||'',
        legacyAnalysisEn:w.chietu_en||'',
        analysisType:single?'character_structure_candidate':'compound_memory_or_structure_note',
        requiresStructuralVerification:status!=='VERIFIED',
        factMnemonicSeparationRequired:true
      },
      wordLayer:{
        collocations:normalizeCollocations(w),
        examples:normalizeExamples(w),
        relatedBySharedCharacter:relatedTerms(term),
        confusionCandidates:[]
      },
      pedagogy:{
        skills:single?['recognition','meaning','pronunciation','listening','context_use','production','component_reasoning','transfer']:['recognition','meaning','pronunciation','listening','context_use','production','collocation'],
        preferredTaskTypes:single?['recognition','free_recall','context_selection','sentence_production','component_reasoning','novel_transfer']:['recognition','free_recall','context_selection','sentence_production','collocation_choice','semantic_contrast']
      },
      provenance:{
        lexicalSource:'PanTutor HSK1-3 primary runtime database',
        legacyAnalysisSource:w.chietu_source||'unspecified',
        status,
        reviewRequired:status==='AI_DRAFT_REVIEW_REQUIRED'||status==='NEEDS_REVIEW',
        migration:'PanTutor AI v57.3 lazy non-destructive runtime adapter'
      },
      sourceRefs:sourceRefsFor(term),
      verificationPlan:single?{
        lexical:['PANTUTOR_CORE'],curriculum:['GF0025_2021'],status:status==='VERIFIED'?'PARTIALLY_VERIFIED':'REVIEW_PIPELINE',characterStructure:['UNICODE_UNIHAN','MAKE_ME_A_HANZI'],pronunciationAndMeaning:['UNICODE_UNIHAN','CC_CEDICT']
      }:{lexical:['PANTUTOR_CORE'],curriculum:['GF0025_2021'],status:status==='VERIFIED'?'PARTIALLY_VERIFIED':'REVIEW_PIPELINE',lexicalCrossCheck:['CC_CEDICT'],characterComponents:'resolve_each_character_via_character_index_when_needed'}
    };
    entryCache.set(term,e); return e;
  }
  function init(){
    if(ready) return summary;
    const words=baseWords();
    const hskCounts={'1':0,'2':0,'3':0};
    const provenanceCounts={VERIFIED:0,TEACHER_CURATED:0,AI_DRAFT_REVIEW_REQUIRED:0,NEEDS_REVIEW:0};
    let chars=0;
    for(const w of words){
      const term=String(w?.char||''); if(!term) continue;
      const h=Number(w.hsk||0); if(hskCounts[String(h)]!=null)hskCounts[String(h)]++; if(hskPools[h])hskPools[h].push(w);
      if(Array.from(term).length===1)chars++;
      const st=sourceStatus(w); provenanceCounts[st]=(provenanceCounts[st]||0)+1;
      for(const ch of Array.from(term)){
        if(!/\p{Script=Han}/u.test(ch)) continue;
        if(!charIndex.has(ch))charIndex.set(ch,[]); charIndex.get(ch).push(term);
      }
    }
    summary={version:'57.3-lean-runtime',generatedFrom:'PanTutor primary VOCAB database',entryCount:words.length,hskCounts,characterEntries:chars,wordOrPhraseEntries:Math.max(0,words.length-chars),provenanceCounts,sources:[
      {id:'pantutor_core',name:'PanTutor HSK 1-3 primary runtime database'},
      {id:'gf0025',name:'GF 0025-2021 alignment target'},
      {id:'cccedict',name:'CC-CEDICT lexical verification target'},
      {id:'unicode_unihan',name:'Unicode Unihan character verification target'},
      {id:'makemeahanzi',name:'Make Me a Hanzi structural verification target'}
    ]};
    ready=true;
    window.dispatchEvent(new CustomEvent('pandahan-v57-vocab-intelligence-ready',{detail:{count:summary.entryCount}}));
    return summary;
  }
  async function load(){ return init(); }
  function get(term){ init(); return buildEntry(byTerm(term)); }
  function provenance(term){ return get(term)?.provenance||null; }
  function meaningValue(e){return String(e?.lexical?.meaning_vi||e?.lexical?.meaning_en||e?.lexical?.definition_zh||e?.term||'').trim();}
  function buildTeachingView(term){const e=get(term);if(!e)return null;const isChar=e.entryType==='character';return {term:e.term,mode:isChar?'CHARACTER_INTELLIGENCE':'WORD_INTELLIGENCE',thinkFirst:isChar,linguisticFacts:{type:e.entryType,characters:e.characterLayer.characters,pinyin:e.lexical.pinyin,meaning:meaningValue(e),pos:e.lexical.pos},memoryAid:{text:e.characterLayer.legacyAnalysis,label:'LEGACY MEMORY / STRUCTURE NOTE',mustNotBeTreatedAsEtymology:e.characterLayer.factMnemonicSeparationRequired},wordUse:e.wordLayer,provenance:e.provenance,sourceRefs:e.sourceRefs||[],verificationPlan:e.verificationPlan||{},skills:e.pedagogy.skills};}
  function recordReasoning(term,correct,meta={}){return window.PandaHanEvidence?.save?.({conceptId:term,module:'vocabulary_intelligence',skill:'vocabulary',subSkill:'component_reasoning',taskType:'character_reasoning',correct:!!correct,evidenceWeight:.72,...meta});}
  function recordTransfer(sourceTerm,targetTerm,correct,meta={}){return window.PandaHanEvidence?.save?.({conceptId:sourceTerm,module:'vocabulary_intelligence',skill:'vocabulary',subSkill:'transfer',taskType:'lexical_transfer',correct:!!correct,evidenceWeight:.9,meta:{targetTerm,...meta}});}
  function hash(s){let h=2166136261;for(const ch of String(s||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;}
  function shuffleSeeded(arr,seed){const a=arr.slice();let x=hash(seed)||1;for(let i=a.length-1;i>0;i--){x=(Math.imul(x,1664525)+1013904223)>>>0;const j=x%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function distractors(e,field,count=3){init();const pool=(hskPools[e.hsk]||baseWords()).filter(w=>w.char!==e.term&&w[field]&&w[field]!==e.lexical?.[field]);const samePos=pool.filter(w=>w.pos&&w.pos===e.lexical.pos);return shuffleSeeded((samePos.length>=count?samePos:pool),`${e.term}:${field}`).slice(0,count).map(buildEntry);}
  function taskFactory(term,preferredSkill=''){const e=get(term);if(!e)return null;const cfg=(preferredSkill&&typeof preferredSkill==='object')?preferredSkill:{};const requested=cfg.preferredSkill||((typeof preferredSkill==='string')?preferredSkill:'');const decision=cfg.decision||window.PandaHanPedagogy?.planForConcept?.(term,{audit:false})||null;const skill=requested||decision?.selectedIntervention?.targetSkill||'recognition';const action=decision?.selectedIntervention?.action||'';const contrast=decision?.selectedIntervention?.contrastWith||'';const allExamples=e.wordLayer.examples||[];const patternTokens=String(e.term||'').split(/\.{3}|…+/).map(x=>x.trim()).filter(Boolean);const ex=allExamples.find(x=>String(x.hanzi||'').includes(e.term))||allExamples.find(x=>patternTokens.length&&patternTokens.every(t=>String(x.hanzi||'').includes(t)))||allExamples[0];
    if((skill==='context_use'||skill==='production'||skill==='collocation'||action==='semantic_contrast'||action==='context_discrimination_then_production')&&ex){const ds=distractors(e,'meaning',6).map(x=>x.term);if(contrast&&get(contrast)&&!ds.includes(contrast))ds.unshift(contrast);const opts=shuffleSeeded([e.term,...ds.filter(x=>x!==e.term)].slice(0,4),`${e.term}:context`);let prompt=String(ex.hanzi||'');if(prompt.includes(e.term))prompt=prompt.split(e.term).join('______');else if(patternTokens.length){for(const t of patternTokens)prompt=prompt.replace(t,'______');}if(!prompt.includes('______'))prompt=`${prompt} · Which target expression best fits this context?`;return{id:`CTX-${e.term}`,conceptId:e.term,skill:'context_use',type:'context_cloze',prompt,helper:`${ex.pinyin||''} · ${ex.meaning_vi||ex.meaning_en||''}`,options:opts,answer:e.term,sourceExample:ex,decision};}
    if(skill==='pronunciation'){const ds=distractors(e,'pinyin',3);const opts=shuffleSeeded([e.lexical.pinyin,...ds.map(x=>x.lexical.pinyin)],`${e.term}:pinyin`);return{id:`PY-${e.term}`,conceptId:e.term,skill:'pronunciation',type:'pinyin_match',prompt:`Pinyin đúng của “${e.term}” là gì?`,options:opts,answer:e.lexical.pinyin,decision};}
    if(skill==='transfer'&&e.wordLayer.relatedBySharedCharacter?.length){const target=get(e.wordLayer.relatedBySharedCharacter[0]);if(target){const ds=distractors(target,'meaning',3);return{id:`TR-${e.term}`,conceptId:e.term,targetConcept:target.term,skill:'transfer',type:'lexical_transfer',prompt:`Dựa vào phần đã học, hãy suy luận nghĩa gần đúng của “${target.term} · ${target.lexical.pinyin}”.`,options:shuffleSeeded([meaningValue(target),...ds.map(meaningValue)],`${e.term}:transfer`),answer:meaningValue(target),decision};}}
    const ds=distractors(e,'meaning',3);return{id:`MEAN-${e.term}`,conceptId:e.term,skill:'meaning',type:'meaning_match',prompt:`“${e.term} · ${e.lexical.pinyin}” nghĩa là gì?`,options:shuffleSeeded([meaningValue(e),...ds.map(meaningValue)],`${e.term}:meaning`),answer:meaningValue(e),decision};
  }
  function gradeTask(task,selected){if(!task)return null;const correct=String(selected)===String(task.answer);const ev=window.PandaHanEvidence?.save?.({conceptId:task.conceptId,module:'vocabulary_intelligence',skill:'vocabulary',subSkill:task.skill,taskType:task.type,correct,evidenceWeight:task.type==='lexical_transfer'?.9:(task.type==='context_cloze'?.72:.48),answer:selected,expected:task.answer,confusedWith:task.decision?.selectedIntervention?.contrastWith||'',errorType:(!correct&&task.decision?.selectedIntervention?.contrastWith)?'SEMANTIC_CONFUSION':'',meta:{taskId:task.id,targetConcept:task.targetConcept||''}});return{correct,evidence:ev,expected:task.answer};}
  function reviewQueue(statuses=['AI_DRAFT_REVIEW_REQUIRED','NEEDS_REVIEW']){init();return baseWords().filter(w=>statuses.includes(sourceStatus(w))).map(buildEntry);}
  window.PandaHanVocabularyIntelligence={load,get,provenance,buildTeachingView,recordReasoning,recordTransfer,taskFactory,gradeTask,reviewQueue,get catalog(){return summary;},version:'57.3'};
})();
