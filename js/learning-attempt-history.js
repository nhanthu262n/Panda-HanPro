/* Immutable per-attempt evidence for the 120-day AI Coach. No audio blobs are uploaded. */
(() => {
  "use strict";
  const PREFIX="pantutor_learning_attempts_v1_";
  const uid=()=>window.firebase?.auth?.().currentUser?.uid||null;
  const key=id=>PREFIX+id;
  const read=id=>{try{return JSON.parse(localStorage.getItem(key(id))||"[]")}catch(_){return[]}};
  const write=(id,rows)=>localStorage.setItem(key(id),JSON.stringify(rows));
  const clean=value=>JSON.parse(JSON.stringify(value,(k,v)=>typeof v==="number"&&!Number.isFinite(v)?null:v));
  const newId=()=>window.crypto?.randomUUID?.()||`${Date.now()}_${Math.random().toString(36).slice(2)}`;
  function localRows(id,day,task){return read(id).filter(x=>x.dayNumber===Number(day)&&x.taskId===task).sort((a,b)=>b.createdAt-a.createdAt)}
  function dayRows(day){return read(uid()||"guest").filter(x=>x.dayNumber===Number(day)).sort((a,b)=>b.createdAt-a.createdAt)}
  async function flush(){
    const id=uid(),db=window.PandaHanFirebase?.firestore;if(!id||!db)return {synced:0};
    const rows=read(id);let synced=0;
    for(const row of rows.filter(x=>!x.synced)){
      try{
        const {synced:ignored,...payload}=row;
        await db.collection("learningAttempts").doc(id).collection("attempts").doc(row.attemptId).set(payload);
        row.synced=true;synced++;write(id,rows);
      }catch(e){console.warn("Attempt sync pending:",e?.code||e?.message||e);break}
    }
    return {synced};
  }
  async function hydrate(){
    const id=uid(),db=window.PandaHanFirebase?.firestore;if(!id||!db)return;
    try{
      const snap=await db.collection("learningAttempts").doc(id).collection("attempts").orderBy("createdAt","desc").limit(500).get();
      const current=read(id),seen=new Map(current.map(x=>[x.attemptId,x]));
      snap.forEach(doc=>{const remote=doc.data();seen.set(doc.id,{...remote,attemptId:doc.id,synced:true})});
      write(id,[...seen.values()].sort((a,b)=>a.createdAt-b.createdAt));
    }catch(e){console.warn("Attempt history load pending:",e?.code||e?.message||e)}
  }
  async function save(data){
    const id=uid()||"guest",day=Number(data.dayNumber),score=Number(data.scorePercent);
    if(!Number.isInteger(day)||day<1||day>120||!data.taskId||!Number.isFinite(score)||score<0||score>100)throw Error("Invalid learning attempt");
    const attemptId=newId(),createdAt=Date.now();
    const items=(Array.isArray(data.items)?data.items:[]).map(x=>x||{status:"skipped",score:null}).map(x=>({
      ...x,input:x.input??x.typed??x.chosen??x.recognized??"",
      expected:x.expected??x.answer??x.meaning??x.char??x.target??""
    }));
    const row=clean({attemptId,ownerId:id,dayNumber:day,taskId:String(data.taskId),scorePercent:score,passed:!!data.passed,completeSet:!!data.completeSet,correct:Number(data.correct||0),total:Number(data.total||0),items,teacherReports:Array.isArray(data.teacherReports)?data.teacherReports:[],scheduleSaved:!!data.scheduleSaved,createdAt,synced:false});
    const rows=read(id);rows.push(row);write(id,rows);
    if(id!=="guest")await flush();
    return {...row,synced:read(id).find(x=>x.attemptId===attemptId)?.synced===true};
  }
  function html(day,task){
    const rows=localRows(uid()||"guest",day,task).slice(0,10);
    const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    if(!rows.length)return "";
    return `<details class="ptcs-reveal" style="text-align:left"><summary>Lịch sử làm bài (${rows.length} lần gần nhất)</summary>${rows.map(r=>`<details style="padding:9px 0;border-bottom:1px solid #ddd"><summary>${esc(new Date(r.createdAt).toLocaleString("vi-VN"))} · ${r.scorePercent}/100 · ${r.passed?"Đạt":"Chưa đạt"} · ${r.synced?"Đã đồng bộ":"Chờ đồng bộ"}</summary>${r.items.map((item,i)=>`<div style="padding:5px 0"><b>Câu ${i+1}</b>: ${esc(item.input??item.typed??item.chosen??item.recognized??"")} → ${esc(item.expected??item.answer??item.target??"")} · ${item.correct===true?"Đúng":item.correct===false?"Sai":`${esc(item.score??"")} điểm`}</div>`).join("")}</details>`).join("")}</details>`;
  }
  window.PanTutorAttemptHistory={save,flush,hydrate,html,localRows,dayRows};
  window.firebase?.auth?.().onAuthStateChanged(user=>{if(user)flush().then(hydrate).catch(()=>{})});
  window.addEventListener("online",()=>flush().catch(()=>{}));
})();
