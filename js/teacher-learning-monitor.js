/* Read-only learner monitoring. Each source retains its own assessment semantics. */
(() => {
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stamp=v=>{const n=typeof v==='number'?v:Date.parse(v);return Number.isFinite(n)?new Date(n).toLocaleString('vi-VN'):'Chưa có thời gian'};
  const labels={reading_rubric:'Tổng kết bài đọc theo tiêu chí',adaptive_retry_summary:'Tổng kết luyện lại',phonetics_core:'Ngữ âm',listening:'Nghe',speaking:'Nói',reading_writing:'Đọc / Viết','vocab-intro':'Học từ vựng',quest:'Pinyin Tone Quest',remediation:'Luyện sửa lỗi',teacherDraft:'Bài chờ giáo viên chấm',memory_learning:'Học lại từ',recommendation_choice:'Lựa chọn bài luyện',srs:'Ôn ghi nhớ'};
  const task=t=>labels[t]||t||'Bài luyện';
  async function attempts(uid){
    const db=window.PandaHanFirebase?.firestore;if(!db)throw Error('Chưa kết nối Firestore');
    let cursor=null,rows=[];
    do{let q=db.collection('learningAttempts').doc(uid).collection('attempts').orderBy('createdAt','desc').limit(500);if(cursor)q=q.startAfter(cursor);const snap=await q.get();rows.push(...snap.docs.map(d=>({...d.data(),attemptId:d.id,synced:true})));cursor=snap.docs.length===500?snap.docs.at(-1):null}while(cursor);
    return rows;
  }
  async function teacherData(uid){
    const user=window.firebase?.auth?.().currentUser;
    if(!user)throw Error('Vui lòng đăng nhập lại.');
    const project=window.firebase.app().options.projectId;
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),65000);
    try{
      const response=await fetch(`https://asia-southeast1-${project}.cloudfunctions.net/teacherLearningMonitor`,{method:'POST',headers:{Authorization:'Bearer '+await user.getIdToken(),'Content-Type':'application/json'},body:JSON.stringify({uid}),signal:controller.signal});
      if(!response.ok){const error=Error(response.status===403?'Tài khoản chưa có vai trò giáo viên trong Firebase.':response.status===401?'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.':response.status===404?'Chưa triển khai Firebase Function teacherLearningMonitor.':'Máy chủ chưa tải được dữ liệu giám sát.');throw error}
      return await response.json();
    }catch(e){if(e instanceof TypeError)throw Error('Chưa kết nối được chức năng giám sát. Kiểm tra mạng và triển khai Firebase Function teacherLearningMonitor.');throw e}finally{clearTimeout(timer)}
  }
  function table(head,rows){return rows.length?`<div class="tm-scroll"><table class="time-table"><thead><tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`:'<p>Chưa có kết quả đã đồng bộ.</p>'}
  function panel(title,body,open=false){return `<details class="dash-details" ${open?'open':''}><summary>${esc(title)}</summary><div class="inner">${body}</div></details>`}
  function resultRows(rows){return table(['Ngày / nhiệm vụ','Thời gian','Kết quả','Câu trả lời'],rows.map(r=>`<tr><td>Ngày ${esc(r.dayNumber||r.day_number)}<br>${esc(task(r.taskId||r.source))}</td><td>${stamp(r.createdAt||r.created_at||r.date)}</td><td>${r.taskId==='teacherDraft'?'Chờ chấm':r.scorePercent==null?'Chưa có điểm':`${esc(r.scorePercent)}/100`}<br>${r.passed===true?'Đạt':r.passed===false?'Cần luyện thêm':''}${r.total?`<br>${esc(r.correct)}/${esc(r.total)} câu đúng`:''}</td><td>${Array.isArray(r.items)&&r.items.length?`<details><summary>Xem ${r.items.length} câu</summary>${r.items.map(i=>`<p><b>${esc(i.target||i.prompt||'Câu hỏi')}</b><br>Trả lời: ${esc(i.input||'—')}<br>Đáp án: ${esc(i.expected||'—')}${i.rubric?'<br>Tiêu chí bài đọc: '+esc('Nhận diện: '+(i.rubric.legScores?.recognition??'—')+'; Hiểu nghĩa: '+(i.rubric.legScores?.comprehension??'—')+'; Suy luận: '+(i.rubric.legScores?.inference??'Chờ chấm')+'; Tốc độ: '+(i.rubric.fluency??'—')+'; Câu chờ giáo viên: '+(i.rubric.pending||0)):''}<br>${i.correct===true?'Đúng':i.correct===false?'Sai':'Chưa xác minh'}${Number(i.responseMs)>0?' · '+(i.responseMs/1000).toFixed(1)+' giây':''}</p>`).join('')}</details>`:'Chưa có dữ liệu từng câu'}</td></tr>`))}
  async function syncMonitor(){
    const user=window.firebase?.auth?.().currentUser,db=window.PandaHanFirebase?.firestore;
    if(!user||!db)return;
    const suffix=user.uid.replace(/[^a-zA-Z0-9_-]/g,'_');
    const read=prefix=>{try{return JSON.parse(localStorage.getItem(prefix+suffix)||'null')}catch(_){return null}};
    const schedule=read('pandahan_schedule_v2_'),timeline=read('pandahan_ai_coach_timeline_'),quests=read('pandahan_quest_results_');
    const mirror={updatedAt:Date.now()};
    if(schedule)mirror.schedule=schedule;
    if(Array.isArray(timeline))mirror.timeline=timeline.filter(r=>r.verified===true);
    if(Array.isArray(quests))mirror.quests=quests;
    if(Object.keys(mirror).length===1)return;
    try{await db.collection('studentProgress').doc(user.uid).set({teacherMonitor:mirror},{merge:true})}catch(e){console.warn('Teacher monitoring sync pending',e.code||e.message)}
  }
  let syncTimer;
  function queueSync(){clearTimeout(syncTimer);syncTimer=setTimeout(syncMonitor,1200)}
  ['pandahan-schedule-updated','pandahan-learning-evaluation','pandahan-quest-score-saved','pandahan-progress-hydrated','pantutor-attempt-saved'].forEach(e=>window.addEventListener(e,queueSync));
  window.addEventListener('online',queueSync);
  window.firebase?.auth?.().onAuthStateChanged(user=>{if(user)queueSync()});
  let generation=0;
  async function mount(uid){
    const parent=document.getElementById('teacherDetailStats');if(!parent)return;
    document.getElementById('teacherLearningMonitor')?.remove();const host=document.createElement('section');host.id='teacherLearningMonitor';parent.appendChild(host);const token=++generation;host.innerHTML='<p role="status">Đang tải kết quả học tập…</p>';
    const sources=['Lượt làm bài / Kết quả ghi nhớ','Lộ trình 120 ngày','Lịch sử Tone Quest','AI Coach đã đồng bộ','Kết quả Quest đã đồng bộ'];
    const [attemptResult,serverResult,mirrorResult]=await Promise.allSettled([
      attempts(uid),teacherData(uid),window.PandaHanFirebase.firestore.collection('studentProgress').doc(uid).get()
    ]);
    const mirror=mirrorResult.status==='fulfilled'?mirrorResult.value.data()?.teacherMonitor:null;
    const settled=[attemptResult,...['schedule','logs','progress','quiz'].map(key=>serverResult.status==='fulfilled'?{status:'fulfilled',value:serverResult.value[key]}:{status:'rejected',reason:serverResult.reason})];
    if(token!==generation||!host.isConnected)return;
    if(mirror?.schedule&&(settled[1].status==='rejected'||!settled[1].value))settled[1]={status:'fulfilled',value:mirror.schedule};
    if(mirror?.quests&&settled[2].status==='rejected')settled[2]={status:'fulfilled',value:mirror.quests.map(r=>({...r,review_type:'quest'}))};
    if(mirror?.timeline&&settled[3].status==='rejected')settled[3]={status:'fulfilled',value:{data:{pandahan_ai_coach_timeline_mirror:{value:mirror.timeline}}}};
    if(mirror?.quests&&settled[4].status==='rejected')settled[4]={status:'fulfilled',value:{data:{pandahan_quest_results_mirror:{value:mirror.quests}}}};
    const values=settled.map(r=>r.status==='fulfilled'?r.value:null),rows=values[0]||[],schedule=values[1],days=Array.isArray(schedule?.days)?schedule.days:Object.values(schedule?.days||{}),logs=Object.values(values[2]||{});
    const cached=[...Object.entries(values[3]?.data||{}),...Object.entries(values[4]?.data||{})];
    const timeline=cached.filter(([k])=>k.startsWith('pandahan_ai_coach_timeline_')).flatMap(([,r])=>Array.isArray(r.value)?r.value:[]).filter(r=>r.verified===true);
    const questCached=cached.filter(([k])=>k.startsWith('pandahan_quest_results_')).flatMap(([,r])=>Array.isArray(r.value)?r.value:[]);
    const questMap=new Map();[...questCached,...logs.filter(r=>r.review_type==='quest'||r.source==='pinyin-tone-quest')].forEach(r=>questMap.set(r.resultToken||JSON.stringify([r.dayNumber,r.scorePercent,r.createdAt||r.created_at]),r));
    const quests=[...questMap.values()].sort((a,b)=>Date.parse(b.createdAt||'')-Date.parse(a.createdAt||''));
    const complete=days.filter(d=>d.status==='completed').length;
    const failures=[...new Set(settled.filter(r=>r.status==='rejected').map(r=>r.reason?.message||r.reason?.code||'Không tải được dữ liệu.'))].map(message=>`<p role="alert">${esc(message)}</p>`).join('')+(serverResult.status==='rejected'&&mirror?'<p>Đang hiển thị bản đồng bộ gần nhất; dữ liệu trực tiếp chưa tải được.</p>':'');
    host.innerHTML=`<div class="tm-heading"><h2>Theo dõi học tập</h2><button class="btn" type="button" data-refresh-monitor>Làm mới</button></div><p>Đọc dữ liệu của học sinh đã chọn · tải lúc ${stamp(Date.now())}</p>${failures}<div class="tm-metrics"><div><b>${schedule?complete+'/120':'—'}</b><span>Ngày đã hoàn thành</span></div><div><b>${values[0]?rows.filter(r=>!['recommendation_choice','memory_learning'].includes(r.taskId)).length:'—'}</b><span>Lượt làm bài đã lưu</span></div><div><b>${values[2]||values[4]?quests.length:'—'}</b><span>Kết quả Tone Quest đã đồng bộ</span></div></div>`;
    if(mirror?.updatedAt)host.insertAdjacentHTML('beforeend',`<p>Bản đồng bộ học sinh gần nhất: ${stamp(mirror.updatedAt)}</p>`);
    host.innerHTML+=panel('Lộ trình 120 ngày · tiến độ hoàn thành',schedule?`<p>${complete}/120 ngày hoàn thành (${Math.round(complete/120*100)}%). Đây là tiến độ theo điều kiện mở ngày; không đồng nghĩa đã hoàn thành tất cả kỹ năng.</p><progress max="120" value="${complete}"></progress>`+table(['Ngày','Trạng thái','Nhiệm vụ đã ghi nhận','Điểm gần nhất'],days.map(d=>`<tr><td>${esc(d.day_number)}</td><td>${esc(({completed:'Hoàn thành',locked:'Chưa mở',available:'Có thể học',in_progress:'Đang học',pending:'Chưa hoàn thành'})[d.status]||d.status||'Chưa xác định')}</td><td>${esc(Object.keys(d.completed_tasks||{}).map(task).join(' · ')||'Chưa ghi nhận')}</td><td>${esc(d.last_score??'—')}</td></tr>`)):'<p>Chưa có lộ trình đã đồng bộ hoặc nguồn đang không truy cập được.</p>',true);
    host.innerHTML+=panel('AI Coach · kết quả từng lượt',resultRows(rows.filter(r=>!['remediation','memory_learning','recommendation_choice'].includes(r.taskId)))+panel('Hoạt động đã xác minh từ phiên bản trước',resultRows(timeline)));
    host.innerHTML+=panel('Pinyin Tone Quest · lịch sử kết quả',resultRows(quests));
    host.innerHTML+=panel('Kết quả ghi nhớ · căn cứ và tiến bộ',values[0]&&window.PanTutorMemory?window.PanTutorMemory.resultsHtml(rows,false):'<p>Chưa tải được kết quả ghi nhớ.</p>',true);
    host.innerHTML+=panel('Ôn tập bổ sung · lịch sử làm lại',resultRows(rows.filter(r=>r.taskId==='remediation')));
    host.querySelector('[data-refresh-monitor]').onclick=()=>mount(uid);
  }
  window.PanTutorTeacherMonitor={mount};
})();
