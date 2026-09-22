/* PanTutor AI v57.3 — explainable, human-centred AI UI */
(function(){
 'use strict';
 const css=`
 .v57-ai-card{border:1px solid #dbeafe;background:linear-gradient(135deg,#f8fbff,#fff);border-radius:16px;padding:14px;margin:12px 0;box-shadow:0 8px 28px rgba(30,64,175,.06)}
 .v57-ai-title{font-weight:800;color:#1e3a8a;margin-bottom:7px}.v57-ai-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px}
 .v57-ai-pill{background:white;border:1px solid #e5e7eb;border-radius:10px;padding:8px;font-size:12px;line-height:1.45}.v57-ai-small{font-size:11px;color:#64748b;line-height:1.5}
 .v57-ai-warn{background:#fff7ed;border-color:#fed7aa}.v57-ai-good{background:#f0fdf4;border-color:#bbf7d0}.v57-ai-btn{border:0;border-radius:9px;padding:7px 10px;font-weight:700;cursor:pointer;background:#eef2ff;color:#3730a3;margin:4px 4px 0 0}
 .v57-ai-bar{height:7px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:4px}.v57-ai-bar>i{display:block;height:100%;background:#6366f1;border-radius:99px}.v57-ai-row{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:11px}.v57-ai-sep{border:0;border-top:1px solid #e5e7eb;margin:10px 0}
 `;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const pct=x=>Math.round((Number(x)||0)*100);
 function dimRows(s){
   const order=['recognition','meaning','pronunciation','listening','context_use','production','component_reasoning','transfer','writing'];
   return order.filter(k=>s?.summary?.[k]?.evidenceCount>0).slice(0,6).map(k=>{const v=s.summary[k];return `<div class="v57-ai-pill"><div class="v57-ai-row"><b>${esc(k.replaceAll('_',' '))}</b><span>${pct(v.estimate)}% · ${esc(v.state)}</span></div><div class="v57-ai-bar"><i style="width:${pct(v.estimate)}%"></i></div><div class="v57-ai-small">${v.evidenceCount} evidence · confidence ${pct(v.confidence)}%</div></div>`}).join('');
 }
 function planCard(){
   const s=window.PandaHanLearnerModel?.snapshot?.();const p=window.PandaHanPedagogy?.nextGlobal?.();const best=window.PandaHanStrategyModel?.best?.(2);const el=document.createElement('section');el.className='v57-ai-card';el.id='v57AiPlan';
   el.innerHTML=`<div class="v57-ai-title">🐼 PanTutor AI Learning Plan · v57.3</div><div class="v57-ai-small">The 120-day curriculum remains the backbone. AI adds a micro-intervention only when repeated learning evidence supports it; learning-strategy preferences are inferred from outcomes, not from a personality test.</div><div class="v57-ai-grid" style="margin-top:10px"><div class="v57-ai-pill"><b>Current AI focus</b><br>${esc(p?.focus||'core curriculum')}</div><div class="v57-ai-pill"><b>Selected support</b><br>${esc(p?.intervention?.action||'normal curriculum')}</div><div class="v57-ai-pill"><b>Why</b><br>${esc(p?.why||'Collecting evidence')}</div><div class="v57-ai-pill"><b>Evidence coverage</b><br>${s?.conceptCount||0} concepts observed</div><div class="v57-ai-pill"><b>Best-supported strategy</b><br>${best?`${esc(best.strategy.replaceAll('_',' '))} · ${pct(best.estimate)}% utility`:'Need more outcome evidence'}</div></div>${dimRows(s)?`<hr class="v57-ai-sep"><div class="v57-ai-title" style="font-size:13px">AI-estimated learning state</div><div class="v57-ai-grid">${dimRows(s)}</div>`:''}<div class="v57-ai-small" style="margin-top:8px">These are internal learning estimates, not official HSK scores. SM-2 controls review timing separately. Strategy utility is only shown after repeated outcome evidence.</div>`;
   return el;
 }
 function mirrorCard(){
   const s=window.PandaHanLearnerModel?.snapshot?.();const p=window.PandaHanPedagogy?.nextGlobal?.();const m=window.PandaHanSessionReflection?.mirror?.();const observed=Object.entries(s?.summary||{}).filter(([,v])=>v.evidenceCount>0).sort((a,b)=>a[1].estimate-b[1].estimate);const weakest=observed.slice(0,2),strongest=observed.slice(-2).reverse();
   const improved=m?.improved?.length?m.improved.map(x=>`${esc(x.skill)} ${x.delta>=0?'+':''}${Math.round(x.delta*100)} pp`).join('<br>'):'No reliable within-day gain yet';
   const el=document.createElement('section');el.className='v57-ai-card';el.id='v57LearningMirror';
   el.innerHTML=`<div class="v57-ai-title">🪞 AI Learning Mirror</div><div class="v57-ai-small">Compares today's current learner-model state with the first snapshot captured today. Changes are evidence-driven estimates, not official proficiency gains.</div><div class="v57-ai-grid" style="margin-top:8px"><div class="v57-ai-pill v57-ai-good"><b>Improved today</b><br>${improved}<div class="v57-ai-small">${m?.newEvidence||0} new evidence item(s)</div></div><div class="v57-ai-pill v57-ai-good"><b>Currently stronger</b><br>${strongest.length?strongest.map(([k,v])=>`${esc(k)} ${pct(v.estimate)}%`).join('<br>'):'Need more evidence'}</div><div class="v57-ai-pill v57-ai-warn"><b>Needs more support</b><br>${weakest.length?weakest.map(([k,v])=>`${esc(k)} ${pct(v.estimate)}%`).join('<br>'):'Need more evidence'}</div><div class="v57-ai-pill"><b>Next adaptation</b><br>${esc(p?.intervention?.action||'normal curriculum')}</div><div class="v57-ai-pill"><b>Human agency</b><br>Think → answer → revise → reflect. AI does not replace the learner's reasoning.</div></div>`;
   return el;
 }
 
 async function injectDatasetPanel(){
   const dash=document.getElementById('dashboardView'); if(!dash||document.getElementById('v57DatasetPanel'))return;
   const c=await window.PandaHanVocabularyIntelligence?.load?.(); if(!c)return;
   const pc=c.provenanceCounts||{}; const el=document.createElement('section'); el.className='v57-ai-card'; el.id='v57DatasetPanel';
   el.innerHTML=`<div class="v57-ai-title">🗃️ Research Data & Provenance</div><div class="v57-ai-grid"><div class="v57-ai-pill"><b>HSK 1–3 entries</b><br>${c.entryCount||0}<div class="v57-ai-small">HSK1 ${c.hskCounts?.['1']||0} · HSK2 ${c.hskCounts?.['2']||0} · HSK3 ${c.hskCounts?.['3']||0}</div></div><div class="v57-ai-pill"><b>Character / word split</b><br>${c.characterEntries||0} characters · ${c.wordOrPhraseEntries||0} words/phrases</div><div class="v57-ai-pill v57-ai-good"><b>Marked verified</b><br>${pc.VERIFIED||0}</div><div class="v57-ai-pill"><b>Teacher curated</b><br>${pc.TEACHER_CURATED||0}</div><div class="v57-ai-pill v57-ai-warn"><b>AI draft / review</b><br>${pc.AI_DRAFT_REVIEW_REQUIRED||0}</div><div class="v57-ai-pill v57-ai-warn"><b>Source review needed</b><br>${pc.NEEDS_REVIEW||0}</div></div><div class="v57-ai-small" style="margin-top:8px">Every one of the 2,254 entries now carries explicit verification targets: PanTutor Core + GF 0025-2021, with CC-CEDICT lexical cross-checking and, for single characters, Unicode Unihan + Make Me a Hanzi structural verification. These are source targets, not false claims that unreviewed fields are already verified.</div>`;
   dash.appendChild(el);
 }
function injectDashboard(){const dash=document.getElementById('dashboardView');if(!dash)return;const h=dash.querySelector('h2');if(!document.getElementById('v57AiPlan'))h?.parentNode?.insertBefore(planCard(),h.nextSibling);if(!document.getElementById('v57LearningMirror'))dash.appendChild(mirrorCard());}
 function ensureDetailLauncher(){
   const char=document.getElementById('dChar')?.textContent?.trim();
   const box=document.getElementById('dChietuBox');
   if(!char||!box)return;
   const old=document.getElementById('v57DetailLauncher');
   if(old?.dataset?.term===char)return;
   old?.remove();document.getElementById('v57WordIntelligence')?.remove();document.getElementById('v57AdaptiveMicroPractice')?.remove();
   const shell=document.createElement('section');shell.className='v57-ai-card';shell.id='v57DetailLauncher';shell.dataset.term=char;
   shell.innerHTML=`<div class="v57-ai-title">🧠 AI Learning Intelligence</div><div class="v57-ai-small">The core dictionary content is loaded first for smooth reading. AI diagnosis and adaptive micro-practice are calculated only when you open this panel.</div><button class="v57-ai-btn" id="v57LoadDetailAI">Open AI analysis & adaptive practice</button><span id="v57DetailAiStatus" class="v57-ai-small"></span>`;
   box.parentNode.insertBefore(shell,box.nextSibling);
   shell.querySelector('#v57LoadDetailAI').onclick=()=>injectDetailFull(char,shell);
 }
 async function injectDetailFull(char,shell){
   const btn=shell?.querySelector('#v57LoadDetailAI'),status=shell?.querySelector('#v57DetailAiStatus');
   if(btn){btn.disabled=true;btn.textContent='Loading AI analysis…';}
   if(status)status.textContent='';
   try{
     await new Promise(r=>requestAnimationFrame(()=>r()));
     await window.PandaHanVocabularyIntelligence?.load?.();
     if(document.getElementById('dChar')?.textContent?.trim()!==char)return;
     const e=window.PandaHanVocabularyIntelligence?.buildTeachingView?.(char);if(!e)throw new Error('No intelligence entry');
     const plan=window.PandaHanPedagogy?.planForConcept?.(char)||null;
     const c=document.createElement('section');c.className='v57-ai-card';c.id='v57WordIntelligence';c.dataset.term=char;
     const rel=(e.wordUse?.relatedBySharedCharacter||[]).slice(0,8).join(' · ')||'—';
     const col=(e.wordUse?.collocations||[]).slice(0,5).map(x=>x.hanzi).join(' · ')||'—';
     const srcRefs=(e.sourceRefs||[]).join(' · ')||'PANTUTOR_CORE';
     const thinkBlock=e.mode==='CHARACTER_INTELLIGENCE'?`<div class="v57-ai-pill" style="margin-top:8px"><b>THINK FIRST · Human reasoning before AI explanation</b><br><textarea id="v57ReasoningText" rows="3" style="width:100%;margin-top:7px;border:1px solid #cbd5e1;border-radius:8px;padding:8px;box-sizing:border-box" placeholder="What do you notice about the form/components? What might help you remember or infer this character?"></textarea><button class="v57-ai-btn" id="v57SaveReasoning">Save my reasoning</button><button class="v57-ai-btn" id="v57RevealNote">Reveal curated / legacy note</button><div id="v57ReasoningMsg" class="v57-ai-small"></div></div>`:`<div class="v57-ai-pill" style="margin-top:8px"><b>USE BEFORE MEMORIZING AGAIN</b><br>Focus on meaning, collocation, context and production. Character decomposition is supporting information, not the whole word lesson.</div>`;
     c.innerHTML=`<div class="v57-ai-title">${e.mode==='CHARACTER_INTELLIGENCE'?'🧩 Character Intelligence':'🧠 Word Intelligence'}</div><div class="v57-ai-grid"><div class="v57-ai-pill"><b>Learning mode</b><br>${esc(e.mode)}</div><div class="v57-ai-pill"><b>Content status</b><br>${esc(e.provenance.status)}</div><div class="v57-ai-pill"><b>AI target</b><br>${esc(plan?.selectedIntervention?.targetSkill||'collecting evidence')}</div><div class="v57-ai-pill"><b>Intervention</b><br>${esc(plan?.selectedIntervention?.action||'normal curriculum')}</div></div>${thinkBlock}<div class="v57-ai-pill"><b>Collocations / lexical links</b><br>${esc(col)}</div><div class="v57-ai-pill"><b>Lexical transfer · related items by shared character</b><br>${esc(rel)}</div><div class="v57-ai-pill ${e.provenance.reviewRequired?'v57-ai-warn':'v57-ai-good'}"><b>Provenance</b><br>${esc(e.provenance.legacyAnalysisSource||'unspecified')}<div class="v57-ai-small">Verification targets: ${esc(srcRefs)}<br>Legacy stories and decomposition notes are treated as memory aids unless independently verified as linguistic/historical facts.</div></div><div class="v57-ai-small"><b>Why this activity?</b> ${esc(plan?.whyActivity||'')}<br><b>Why now?</b> ${esc(plan?.whyNow||'')}</div>`;
     shell.replaceWith(c);
     if(e.mode==='CHARACTER_INTELLIGENCE'){
       const box=document.getElementById('dChietuBox'),revealKey=`v57_note_revealed_${char}`,revealed=sessionStorage.getItem(revealKey)==='1';if(box)box.style.display=revealed?'':'none';
       c.querySelector('#v57RevealNote').onclick=()=>{sessionStorage.setItem(revealKey,'1');if(box)box.style.display='';c.querySelector('#v57ReasoningMsg').textContent='Curated / legacy note revealed. Compare it with your own reasoning.'};
       c.querySelector('#v57SaveReasoning').onclick=()=>{const text=c.querySelector('#v57ReasoningText').value.trim();if(!text){c.querySelector('#v57ReasoningMsg').textContent='Write your own reasoning first.';return;}try{localStorage.setItem(`v57_reasoning_${char}_${Date.now()}`,text);window.PandaHanEvidence?.save?.({conceptId:char,module:'vocabulary_intelligence',skill:'reflection',subSkill:'self_reasoning',taskType:'learner_generated_reasoning',normalizedOutcome:.5,evidenceWeight:.12,meta:{text:text.slice(0,500),strategy:'self_generated_reasoning',strategyExposureOnly:true}});}catch(_){}c.querySelector('#v57ReasoningMsg').textContent='Saved.'};
     }
     // Build micro-practice only after the analysis panel is explicitly opened.
     const task=window.PandaHanVocabularyIntelligence?.taskFactory?.(char,{preferredSkill:plan?.selectedIntervention?.targetSkill||'',decision:plan});
     if(task&&Array.isArray(task.options)&&task.options.length){
       const q=document.createElement('section');q.className='v57-ai-card';q.id='v57AdaptiveMicroPractice';q.innerHTML=`<div class="v57-ai-title">🎯 Adaptive Micro-Practice</div><div class="v57-ai-small">Generated from existing verified/curated entry data; the skill is selected from current evidence.</div><div class="v57-ai-pill" style="margin-top:8px"><b>${esc(task.prompt)}</b>${task.helper?`<div class="v57-ai-small">${esc(task.helper)}</div>`:''}<div id="v57TaskOptions"></div><div id="v57TaskFeedback" class="v57-ai-small" style="margin-top:6px"></div></div>`;
       const opt=q.querySelector('#v57TaskOptions');task.options.forEach(o=>{const b=document.createElement('button');b.className='v57-ai-btn';b.textContent=o;b.onclick=()=>{const r=window.PandaHanVocabularyIntelligence?.gradeTask?.(task,o);q.querySelector('#v57TaskFeedback').innerHTML=r?.correct?`✅ Correct. Evidence saved for <b>${esc(task.skill)}</b>.`:`❌ Not yet. Expected: <b>${esc(r?.expected||task.answer)}</b>.`;opt.querySelectorAll('button').forEach(x=>x.disabled=true)};opt.appendChild(b)});c.parentNode.insertBefore(q,c.nextSibling);
     }
   }catch(err){console.warn('Detail AI load:',err);if(btn){btn.disabled=false;btn.textContent='Retry AI analysis';}if(status)status.textContent=' AI analysis could not load yet.';}
 }

 async function injectTeacherGovernance(){
   const v=document.getElementById('teacherView');if(!v||document.getElementById('v57TeacherGovernance'))return;
   await window.PandaHanVocabularyIntelligence?.load?.(); if(document.getElementById('v57TeacherGovernance'))return;
   const g=window.PandaHanDiagnostic?.diagnoseGlobal?.()||{issues:[]};const p=window.PandaHanPedagogy?.nextGlobal?.();const queue=window.PandaHanVocabularyIntelligence?.reviewQueue?.()||[];const sample=queue.slice(0,8);
   const el=document.createElement('section');el.className='v57-ai-card';el.id='v57TeacherGovernance';const decisionId=p?.decisionId||`GLOBAL-${Date.now()}`;
   el.innerHTML=`<div class="v57-ai-title">👩‍🏫 Teacher–AI Governance · v57.3</div><div class="v57-ai-small">AI recommendations remain reviewable. Teacher decisions are stored in an audit log instead of silently overwriting the AI output. Content provenance is reviewed separately from learner-performance decisions.</div><div class="v57-ai-grid" style="margin-top:8px"><div class="v57-ai-pill"><b>AI focus</b><br>${esc(p?.focus||'core curriculum')}</div><div class="v57-ai-pill"><b>Suggested support</b><br>${esc(p?.intervention?.action||'normal curriculum')}</div><div class="v57-ai-pill"><b>Detected issues</b><br>${g.issues?.length||0}</div><div class="v57-ai-pill"><b>Strategy signal</b><br>${p?.strategySuggestion?`${esc(p.strategySuggestion.strategy.replaceAll('_',' '))} · ${pct(p.strategySuggestion.utility)}% utility`:'Not enough strategy evidence'}</div><div class="v57-ai-pill v57-ai-warn"><b>Content review queue</b><br>${queue.length} entries<div class="v57-ai-small">AI draft + source-needs-review only</div></div></div><button class="v57-ai-btn" data-gov="ACCEPTED">✓ Accept AI support</button><button class="v57-ai-btn" data-gov="MODIFIED">✎ Modify</button><button class="v57-ai-btn" data-gov="REJECTED">× Reject</button><div class="v57-ai-small" id="v57GovMsg"></div>${sample.length?`<hr class="v57-ai-sep"><div class="v57-ai-title" style="font-size:13px">Content provenance review sample</div><div id="v57ReviewSample">${sample.map(x=>`<button class="v57-ai-btn" data-review-term="${esc(x.term)}">${esc(x.term)} · ${esc(x.provenance?.status||'')}</button>`).join('')}</div><div class="v57-ai-small">Opening an entry does not mark it verified. Verification requires source checking and a human review decision.</div>`:''}`;
   el.querySelectorAll('[data-gov]').forEach(b=>b.onclick=()=>{const status=b.dataset.gov;window.PandaHanTeacherGovernance?.review?.(decisionId,status,`Teacher reviewed global focus: ${p?.focus||''}`);el.querySelector('#v57GovMsg').textContent=`Saved: ${status} · ${new Date().toLocaleString()}`});
   el.querySelectorAll('[data-review-term]').forEach(b=>b.onclick=()=>{const term=b.dataset.reviewTerm;try{if(typeof window.openDetail==='function')window.openDetail(term);else if(typeof openDetail==='function')openDetail(term);}catch(_){} });
   v.insertBefore(el,v.firstChild);
 }
 function refresh(){
   // Only touch the screen that is currently visible. This avoids repeatedly
   // loading vocabulary intelligence on every DOM mutation.
   const dash=document.getElementById('dashboardView');
   const detail=document.getElementById('detailView');
   const teacher=document.getElementById('teacherView');
   if(dash && (dash.classList.contains('visible') || dash.style.display==='block')){injectDashboard();injectDatasetPanel();}
   if(detail && (detail.classList.contains('visible') || detail.style.display==='block')) ensureDetailLauncher();
   if(teacher && (teacher.classList.contains('visible') || teacher.style.display==='block')) injectTeacherGovernance();
 }
 let refreshTimer=0;
 function scheduleRefresh(delay=30){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{refreshTimer=0;refresh();},delay);}
 document.addEventListener('DOMContentLoaded',()=>{scheduleRefresh(0);setTimeout(()=>scheduleRefresh(0),700)});
 window.addEventListener('pandahan-screen-changed',()=>scheduleRefresh(0));
 window.addEventListener('pandahan-v57-model-updated',()=>{document.getElementById('v57AiPlan')?.replaceWith(planCard());document.getElementById('v57LearningMirror')?.replaceWith(mirrorCard());});
})();
