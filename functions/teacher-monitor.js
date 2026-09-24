/* Explicit server-side authorization for cross-account teacher reads. */
exports.createTeacherMonitor = (admin) => async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Cache-Control', 'no-store');
  if(req.method==='OPTIONS')return res.status(204).send('');
  if(req.method!=='POST')return res.status(405).json({error:'method-not-allowed'});
  const token=(req.headers.authorization||'').match(/^Bearer (.+)$/i)?.[1];
  if(!token)return res.status(401).json({error:'unauthenticated'});
  let caller;
  try{caller=await admin.auth().verifyIdToken(token,true)}catch(_){return res.status(401).json({error:'unauthenticated'})}
  try{
    const roleDoc=await admin.firestore().collection('users').doc(caller.uid).get();
    if(!['teacher','master_teacher'].includes(roleDoc.data()?.role))return res.status(403).json({error:'teacher-role-required'});
    const uid=req.body?.uid;
    if(typeof uid!=='string'||!uid||uid.length>128||/[.#$\[\]/\u0000-\u001f\u007f]/.test(uid))return res.status(400).json({error:'invalid-uid'});
    const paths=['studentSchedules','reviewLogs','studentProgress','quizResults'];
    const snapshots=await Promise.all(paths.map(p=>admin.database().ref(p+'/'+uid).once('value')));
    const [schedule,logs,progress,quiz]=snapshots.map(s=>s.val());
    const select=(bucket,prefix)=>({data:Object.fromEntries(Object.entries(bucket?.data||{}).filter(([key])=>key.startsWith(prefix))),updatedAt:bucket?.updatedAt||null});
    return res.json({schedule,logs:Object.fromEntries(Object.entries(logs||{}).filter(([,r])=>r.review_type==='quest'||r.source==='pinyin-tone-quest')),progress:select(progress,'pandahan_ai_coach_timeline_'),quiz:select(quiz,'pandahan_quest_results_')});
  }catch(e){console.error('Teacher monitor read failed',e.code||e.message);return res.status(500).json({error:'monitor-read-failed'})}
};
