
/* ═══════════════════════════════════════════════════════════
   NGỮ ÂM — 10 BUỔI HỌC PHONICS
   ═══════════════════════════════════════════════════════════ */

const PV_TONE_MARKS = {
  a:['\u0101','\u00e1','\u01ce','\u00e0','a'],
  e:['\u0113','\u00e9','\u011b','\u00e8','e'],
  i:['\u012b','\u00ed','\u01d0','\u00ec','i'],
  o:['\u014d','\u00f3','\u01d2','\u00f2','o'],
  u:['\u016b','\u00fa','\u01d4','\u00f9','u'],
  \u00fc:['\u01d6','\u01d8','\u01da','\u01dc','\u00fc'],
};
function pvT(vi, en) { return window.LANG_MODE === "en" ? en : vi; }
const PV_SESSION_EN = {
  1: ["Four tones", "The most important foundation"], 2: ["Single finals (a o e)", "Basic simple vowels"],
  3: ["Initials b p m f", "Labial initial consonants"], 4: ["Initials d t n l", "Alveolar initial consonants"],
  5: ["Initials g k h", "Velar initial consonants"], 6: ["Initials j q x", "Palatal initial consonants"],
  7: ["Initials zh ch sh r", "Retroflex initials"], 8: ["Initials z c s", "Dental sibilant initials"],
  9: ["Compound finals", "Compound vowel combinations"], 10: ["Full review", "Consolidate tones and initials"],
};
function pvSessionTitle(session) { return window.LANG_MODE === "en" && PV_SESSION_EN[session.id] ? PV_SESSION_EN[session.id][0] : session.title; }
function pvSessionSub(session) { return window.LANG_MODE === "en" && PV_SESSION_EN[session.id] ? PV_SESSION_EN[session.id][1] : session.sub; }
function pvCardMeaning(card) { return window.LANG_MODE === "en" ? (window.VOCAB_BY_CHAR?.[card.hanzi]?.meaning_en || card.meaning_en || card.viet) : card.viet; }

function pvApplyTone(syl, tone) {
  if (!tone) return syl;
  const order = ['a','e','o','\u00fc','u','i'];
  for (const v of order) {
    if (syl.includes(v)) {
      return syl.replace(v, PV_TONE_MARKS[v] ? PV_TONE_MARKS[v][tone - 1] : v);
    }
  }
  return syl;
}

/* ── TTS: speak HANZI in zh-CN for natural tone reading ── */
let pvZhVoice = null;
function pvLoadVoices() {
  const voices = speechSynthesis.getVoices();
  pvZhVoice = voices.find(v => v.lang === 'zh-CN') || voices.find(v => v.lang.startsWith('zh')) || null;
}
if ('speechSynthesis' in window) {
  pvLoadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = pvLoadVoices;
  }
}

function pvSpeak(hanzi, teacherMode) {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  pvZhVoice = pvZhVoice || voices.find(v => v.lang === 'zh-CN') || voices.find(v => v.lang.startsWith('zh')) || null;
  window.speechSynthesis.cancel();
  const make = (rate) => {
    const u = new SpeechSynthesisUtterance(hanzi);
    u.lang = 'zh-CN';
    u.rate = rate;
    u.pitch = 1.0;
    if (pvZhVoice) u.voice = pvZhVoice;
    return u;
  };
  if (teacherMode) {
    // Teacher mode: đọc chậm 2 lần với khoảng nghỉ
    const u1 = make(0.38);
    u1.onend = () => { setTimeout(() => { window.speechSynthesis.speak(make(0.52)); }, 700); };
    window.speechSynthesis.speak(u1);
  } else {
    window.speechSynthesis.speak(make(0.55));
  }
}

/* ── Tone Guide Data ── */
const PV_TONE_GUIDE = [
  { tone:1, name:'Thanh 1 — Thanh bằng', color:'#ec4899', bg:'#fdf2f8', border:'#fbcfe8',
    viet:'Cao và đều — như kéo dài tiếng \"a...\" khi bác sĩ khám họng',
    tip:'Mi\u1ec7ng m\u1edf, h\u00e0m th\u1ea3 l\u1ecfng, gi\u1ecdng cao \u0111\u1ec1u KH\u00d4NG l\u00ean xu\u1ed1ng',
    path:'M10,20 L90,20' },
  { tone:2, name:'Thanh 2 — Thanh sắc', color:'#f97316', bg:'#fff7ed', border:'#fed7aa',
    viet:'L\u00ean cao d\u1ea7n — nh\u01b0 h\u1ecfi l\u1ea1i ng\u1ea1c nhi\u00ean \"H\u1ea3?\", gi\u1ecdng v\u00fat l\u00ean',
    tip:'B\u1eaft \u0111\u1ea7u gi\u1ecdng trung b\u00ecnh r\u1ed3i K\u00c9O L\u00caN cao',
    path:'M10,60 L90,10' },
  { tone:3, name:'Thanh 3 — Thanh h\u1ecfi', color:'#8b5cf6', bg:'#f5f3ff', border:'#ddd6fe',
    viet:'Xu\u1ed1ng r\u1ed3i l\u00ean — nh\u01b0 ti\u1ebfng \"\u1edd...\" ph\u00e2n v\u00e2n, gi\u1ecdng h\u01a1i xu\u1ed1ng th\u1ea5p r\u1ed3i v\u00fat l\u00ean',
    tip:'Xu\u1ed1ng th\u1ea5p v\u00e0 GI\u1eee th\u1ea5p r\u1ed3i m\u1edbi l\u00ean',
    path:'M10,30 L40,72 L90,28' },
  { tone:4, name:'Thanh 4 — Thanh n\u1eb7ng', color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe',
    viet:'Xu\u1ed1ng m\u1ea1nh v\u00e0 ng\u1eafn — nh\u01b0 ra l\u1ec7nh \"Kh\u00f4ng!\", gi\u1ecdng \u0111\u1ed5 xu\u1ed1ng d\u1ee9t kho\u00e1t',
    tip:'B\u1eaft \u0111\u1ea7u cao nh\u1ea5t, R\u1eccT XU\u1ed0NG th\u1eadt nhanh — ng\u1eafn v\u00e0 m\u1ea1nh',
    path:'M10,8 L90,72' },
];

/* ── 10 Sessions Data ── */
const PV_SESSIONS = [
  {id:1,title:'4 Thanh Điệu',sub:'Nền tảng quan trọng nhất',emoji:'🎵',color:'#ec4899',light:'#fdf2f8',cards:[
    {pinyin:'ma',tone:1,hanzi:'妈',viet:'mẹ'},{pinyin:'ma',tone:2,hanzi:'麻',viet:'gai'},
    {pinyin:'ma',tone:3,hanzi:'马',viet:'ngựa'},{pinyin:'ma',tone:4,hanzi:'骂',viet:'mắng'},
    {pinyin:'ba',tone:1,hanzi:'八',viet:'tám'},{pinyin:'ba',tone:2,hanzi:'拔',viet:'nhổ'},
    {pinyin:'ba',tone:3,hanzi:'把',viet:'cái'},{pinyin:'ba',tone:4,hanzi:'爸',viet:'bố'},
  ]},
  {id:2,title:'Đơn Vận (a o e)',sub:'Nguyên âm đơn cơ bản',emoji:'🅐',color:'#f97316',light:'#fff7ed',cards:[
    {pinyin:'a',tone:1,hanzi:'啊',viet:'à'},{pinyin:'o',tone:2,hanzi:'哦',viet:'ồ'},
    {pinyin:'e',tone:3,hanzi:'饿',viet:'đói'},{pinyin:'yi',tone:1,hanzi:'一',viet:'một'},
    {pinyin:'wu',tone:3,hanzi:'五',viet:'năm'},{pinyin:'yu',tone:2,hanzi:'鱼',viet:'cá'},
    {pinyin:'ai',tone:4,hanzi:'爱',viet:'yêu'},{pinyin:'ei',tone:4,hanzi:'诶',viet:'ê'},
  ]},
  {id:3,title:'Thanh mẫu b p m f',sub:'Phụ âm đầu nhóm môi',emoji:'💋',color:'#8b5cf6',light:'#f5f3ff',cards:[
    {pinyin:'ba',tone:4,hanzi:'爸',viet:'bố'},{pinyin:'ma',tone:1,hanzi:'妈',viet:'mẹ'},
    {pinyin:'pa',tone:2,hanzi:'爬',viet:'leo'},{pinyin:'fa',tone:1,hanzi:'发',viet:'tóc'},
    {pinyin:'bo',tone:1,hanzi:'波',viet:'sóng'},{pinyin:'po',tone:2,hanzi:'婆',viet:'bà'},
    {pinyin:'mo',tone:2,hanzi:'模',viet:'mô hình'},{pinyin:'fo',tone:2,hanzi:'佛',viet:'Phật'},
  ]},
  {id:4,title:'Thanh mẫu d t n l',sub:'Phụ âm đầu nhóm lưỡi trước',emoji:'👅',color:'#22c55e',light:'#f0fdf4',cards:[
    {pinyin:'da',tone:4,hanzi:'大',viet:'to'},{pinyin:'ta',tone:1,hanzi:'他',viet:'anh ấy'},
    {pinyin:'na',tone:4,hanzi:'那',viet:'đó'},{pinyin:'la',tone:1,hanzi:'拉',viet:'kéo'},
    {pinyin:'di',tone:4,hanzi:'地',viet:'đất'},{pinyin:'ti',tone:2,hanzi:'蹄',viet:'móng'},
    {pinyin:'ni',tone:3,hanzi:'你',viet:'bạn'},{pinyin:'li',tone:4,hanzi:'力',viet:'sức'},
  ]},
  {id:5,title:'Thanh mẫu g k h',sub:'Phụ âm đầu nhóm gốc lưỡi',emoji:'🔊',color:'#3b82f6',light:'#eff6ff',cards:[
    {pinyin:'ge',tone:1,hanzi:'哥',viet:'anh'},{pinyin:'ke',tone:3,hanzi:'可',viet:'có thể'},
    {pinyin:'he',tone:4,hanzi:'喝',viet:'uống'},{pinyin:'gu',tone:3,hanzi:'谷',viet:'thung lũng'},
    {pinyin:'ku',tone:4,hanzi:'库',viet:'kho'},{pinyin:'hu',tone:2,hanzi:'胡',viet:'râu'},
    {pinyin:'guo',tone:2,hanzi:'国',viet:'nước'},{pinyin:'hao',tone:3,hanzi:'好',viet:'tốt'},
  ]},
  {id:6,title:'Thanh mẫu j q x',sub:'Phụ âm đầu nhóm mặt lưỡi',emoji:'🗣️',color:'#ec4899',light:'#fdf2f8',cards:[
    {pinyin:'ji',tone:1,hanzi:'鸡',viet:'gà'},{pinyin:'qi',tone:3,hanzi:'起',viet:'đứng dậy'},
    {pinyin:'xi',tone:1,hanzi:'希',viet:'hy vọng'},{pinyin:'jia',tone:1,hanzi:'家',viet:'nhà'},
    {pinyin:'xia',tone:4,hanzi:'下',viet:'dưới'},{pinyin:'jin',tone:1,hanzi:'金',viet:'vàng'},
    {pinyin:'xin',tone:1,hanzi:'心',viet:'tim'},{pinyin:'qian',tone:2,hanzi:'钱',viet:'tiền'},
  ]},
  {id:7,title:'Thanh mẫu zh ch sh r',sub:'Phụ âm đầu cuộn lưỡi',emoji:'🌀',color:'#f97316',light:'#fff7ed',cards:[
    {pinyin:'zhi',tone:1,hanzi:'知',viet:'biết'},{pinyin:'chi',tone:1,hanzi:'吃',viet:'ăn'},
    {pinyin:'shi',tone:4,hanzi:'是',viet:'là'},{pinyin:'ri',tone:4,hanzi:'日',viet:'mặt trời'},
    {pinyin:'zhu',tone:4,hanzi:'住',viet:'sống'},{pinyin:'chu',tone:1,hanzi:'出',viet:'ra'},
    {pinyin:'shu',tone:1,hanzi:'书',viet:'sách'},{pinyin:'ren',tone:2,hanzi:'人',viet:'người'},
  ]},
  {id:8,title:'Thanh mẫu z c s',sub:'Phụ âm đầu đầu lưỡi - răng',emoji:'🦷',color:'#8b5cf6',light:'#f5f3ff',cards:[
    {pinyin:'zi',tone:4,hanzi:'字',viet:'chữ'},{pinyin:'ci',tone:2,hanzi:'词',viet:'từ'},
    {pinyin:'si',tone:4,hanzi:'四',viet:'bốn'},{pinyin:'zuo',tone:4,hanzi:'做',viet:'làm'},
    {pinyin:'cuo',tone:4,hanzi:'错',viet:'sai'},{pinyin:'suo',tone:3,hanzi:'锁',viet:'khóa'},
    {pinyin:'zan',tone:4,hanzi:'赞',viet:'khen'},{pinyin:'san',tone:1,hanzi:'三',viet:'ba'},
  ]},
  {id:9,title:'Phức Vận Mẫu',sub:'Nguyên âm ghép (ai ei ao ou...)',emoji:'🔗',color:'#22c55e',light:'#f0fdf4',cards:[
    {pinyin:'ai',tone:4,hanzi:'爱',viet:'yêu'},{pinyin:'ao',tone:4,hanzi:'澳',viet:'Úc'},
    {pinyin:'ou',tone:3,hanzi:'偶',viet:'thỉnh thoảng'},{pinyin:'ia',tone:1,hanzi:'呀',viet:'à'},
    {pinyin:'ie',tone:4,hanzi:'叶',viet:'lá'},{pinyin:'ua',tone:3,hanzi:'瓦',viet:'ngói'},
    {pinyin:'uo',tone:3,hanzi:'我',viet:'tôi'},{pinyin:'ui',tone:4,hanzi:'位',viet:'vị trí'},
  ]},
  {id:10,title:'Vận Mẫu Mũi',sub:'Âm mũi (an en ang eng...)',emoji:'👃',color:'#3b82f6',light:'#eff6ff',cards:[
    {pinyin:'an',tone:1,hanzi:'安',viet:'yên'},{pinyin:'en',tone:1,hanzi:'恩',viet:'ân'},
    {pinyin:'ang',tone:2,hanzi:'昂',viet:'ngẩng'},{pinyin:'eng',tone:2,hanzi:'能',viet:'có thể'},
    {pinyin:'in',tone:1,hanzi:'音',viet:'âm'},{pinyin:'ing',tone:1,hanzi:'英',viet:'Anh'},
    {pinyin:'un',tone:1,hanzi:'温',viet:'ấm'},{pinyin:'ong',tone:1,hanzi:'空',viet:'không'},
  ]},
];


// ═══ AUDIO EMBEDDED ═══
const PV_DAY1_AUDIO = 'assets/pv-day1-audio.wav';

const PV_STORAGE = 'pandahan_phonics_v1';

function pvLoadProgress() {
  try { return JSON.parse(localStorage.getItem(PV_STORAGE) || '{}'); }
  catch { return {}; }
}
function pvSaveProgress(p) { localStorage.setItem(PV_STORAGE, JSON.stringify(p)); }

function pvGetDefaultProgress() {
  const p = pvLoadProgress();
  if (!p[1]) p[1] = { stars:0, bestScore:0, unlocked:true };
  // Ensure all sessions exist
  PV_SESSIONS.forEach(s => { if (!p[s.id]) p[s.id] = { stars:0, bestScore:0, unlocked: s.id === 1 }; });
  return p;
}

/* ── State ── */
let pvState = { progress: pvGetDefaultProgress(), activeSession: null, phase: 'intro', flashIdx: 0, flashFlipped: false, flashDone: [], gameRound: 0, gameScore: 0, gameStreak: 0, gameChosen: null, quizQIdx: 0, quizScore: 0, quizChosen: null, quizAnswers: [], quizQuestions: [], speaking: false };

/* ── Render Pinyin View ── */
function renderPinyinView() {
  // Chỉ tải và mount module khi người dùng mở tab Ngữ âm.
  if (typeof window.loadPinyinPhonetics === 'function') {
    window.loadPinyinPhonetics().catch((error) => {
      console.error('Không thể tải Ngữ âm Pinyin:', error);
    });
    return;
  }
}

/* ── Session List ── */
function renderSessionList(container) {
  const prog = pvState.progress;
  const totalStars = Object.values(prog).reduce((s, p) => s + (p.stars || 0), 0);
  const doneCount = Object.values(prog).filter(p => p.stars > 0).length;
  const unlockedCount = Object.values(prog).filter(p => p.unlocked).length;

  let html = `<div class="pv-container">
    <div class="pv-header">
      <div>
        <div class="pv-title">🎵 ${pvT("Ngữ âm", "Phonetics")} — <span>${pvT("10 Buổi Học", "10 Learning Sessions")}</span></div>
        <div class="pv-sub">Flashcard → ${pvT("Game", "Game")} → ${pvT("Bài tập", "Practice")} · ${pvT("Đạt ≥30% để qua buổi", "Reach ≥30% to pass the session")}</div>
      </div>
    </div>
    <div class="pv-stats">
      <div class="pv-stat-card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="pv-stat-icon">⭐</span>
          <span style="font-size:.68rem;font-weight:800;color:#f97316;background:#fff7ed;padding:2px 8px;border-radius:8px">30 max</span>
        </div>
        <div class="pv-stat-num">${totalStars}</div>
        <div class="pv-stat-label">${pvT("Tổng sao", "Total stars")}</div>
        <div class="pv-stat-bar"><div class="pv-stat-fill" style="width:${(totalStars/30)*100}%"></div></div>
      </div>
      <div class="pv-stat-card" style="border-color:#bbf7d0">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="pv-stat-icon">✅</span>
          <span style="font-size:.68rem;font-weight:800;color:#22c55e;background:#f0fdf4;padding:2px 8px;border-radius:8px">10 max</span>
        </div>
        <div class="pv-stat-num" style="color:#22c55e">${doneCount}</div>
        <div class="pv-stat-label">${pvT("Buổi hoàn thành", "Completed sessions")}</div>
        <div class="pv-stat-bar"><div class="pv-stat-fill" style="width:${(doneCount/10)*100}%;background:#22c55e"></div></div>
      </div>
      <div class="pv-stat-card" style="border-color:#ddd6fe">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="pv-stat-icon">🔓</span>
          <span style="font-size:.68rem;font-weight:800;color:#8b5cf6;background:#f5f3ff;padding:2px 8px;border-radius:8px">10 max</span>
        </div>
        <div class="pv-stat-num" style="color:#8b5cf6">${unlockedCount}</div>
        <div class="pv-stat-label">${pvT("Buổi đã mở", "Unlocked sessions")}</div>
        <div class="pv-stat-bar"><div class="pv-stat-fill" style="width:${(unlockedCount/10)*100}%;background:#8b5cf6"></div></div>
      </div>
    </div>
    <div class="pv-sessions">`;

  PV_SESSIONS.forEach(s => {
    const p = prog[s.id] || { stars:0, bestScore:0, unlocked: s.id === 1 };
    const unlocked = p.unlocked;
    const done = p.stars > 0;
    html += `<div class="pv-session-card${unlocked ? '' : ' locked'}" onclick="${unlocked ? 'pvOpenSession('+s.id+')' : ''}">
      <div class="pv-session-bar"></div>
      <div class="pv-session-body">
        <div class="pv-session-emoji">${unlocked ? s.emoji : '🔒'}</div>
        <div class="pv-session-info">
          <div><span class="pv-session-badge" style="background:${unlocked ? s.color : '#9ca3af'}">${pvT("Buổi", "Session")} ${s.id}</span>${done ? '<span style="font-size:12px">'+'⭐'.repeat(p.stars)+'☆'.repeat(3-p.stars)+'</span>' : ''}</div>
          <div class="pv-session-title">${pvSessionTitle(s)}</div>
          <div class="pv-session-sub">${pvSessionSub(s)}</div>
          ${done ? `<div style="margin-top:6px;height:4px;background:#f3f4f6;border-radius:3px;overflow:hidden"><div style="height:100%;border-radius:3px;width:${(p.bestScore/10)*100}%;background:linear-gradient(to right,${s.color},#a855f7)"></div></div>` : ''}
        </div>
        ${unlocked ? `<div class="pv-session-arrow"><svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="${done ? '#fff' : s.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : ''}
      </div>
    </div>`;
  });

  html += '</div></div>';
  container.innerHTML = html;
}

/* ── Session Detail ── */
function renderSessionDetail(container) {
  const sid = pvState.activeSession;
  const session = PV_SESSIONS.find(s => s.id === sid);
  if (!session) return;
  const progress = pvState.progress[sid] || { stars:0, bestScore:0, unlocked:true };
  const phase = pvState.phase;

  let html = `<div class="pv-container pv-detail">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1.5px solid #fbcfe8;margin-bottom:8px">
      <button class="pv-back-btn" onclick="pvBackToList()" style="color:${session.color}">← ${pvT("Quay lại", "Back")}</button>
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;color:#1e1b4b">${session.emoji} ${pvSessionTitle(session)}</div>
      <div style="font-size:16px">${'⭐'.repeat(progress.stars)}${'☆'.repeat(3-progress.stars)}</div>
    </div>`;

  if (phase !== 'result') {
    const phases = ['flash','game','quiz'];
    const labels = ['🃏 Flashcard',`🎮 ${pvT("Game", "Game")}`,`📝 ${pvT("Bài tập", "Practice")}`];
    html += '<div class="pv-phases">';
    phases.forEach((p, i) => {
      const isActive = phase === p || (phase === 'intro' && p === 'flash');
      const isPassed = (phase === 'game' && p === 'flash') || (phase === 'quiz' && (p === 'flash' || p === 'game'));
      const cls = isActive ? 'active' : isPassed ? 'done' : '';
      html += `<div class="pv-phase-btn ${cls}">${isPassed && !isActive ? '✓ ' : ''}${labels[i]}</div>`;
    });
    html += '</div>';
  }

  html += '<div style="flex:1;overflow-y:auto">';

  if (phase === 'intro') {
    html += renderIntro(session);
  } else if (phase === 'flash') {
    html += renderFlash(session);
  } else if (phase === 'game') {
    html += renderGame(session);
  } else if (phase === 'quiz') {
    html += renderQuiz(session);
  } else if (phase === 'result') {
    html += renderResult(session);
  }

  html += '</div></div>';
  container.innerHTML = html;
}

/* ── Intro ── */
function renderIntro(session) {
  let html = `<div class="pv-intro">
    <div class="pv-intro-emoji">${session.emoji}</div>
    <h2 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.4rem;color:#1e1b4b;margin-bottom:4px">${pvSessionTitle(session)}</h2>
    <p style="color:#9ca3af;font-weight:600;margin-bottom:20px">${pvSessionSub(session)}</p>
    <div class="pv-intro-grid">`;
  session.cards.forEach(c => {
    html += `<div class="pv-intro-card">
      <div class="ic-py">${pvApplyTone(c.pinyin, c.tone)}</div>
      <div class="ic-hz">${c.hanzi}</div>
      <div class="ic-vi">${pvCardMeaning(c)}</div>
    </div>`;
  });
  html += `</div>
    <div style="color:#9ca3af;font-weight:600;font-size:.82rem;margin-bottom:18px">
      📌 ${pvT("3 giai đoạn", "3 stages")}: Flashcard → ${pvT("Game", "Game")} → ${pvT("Bài tập", "Practice")}<br/>
      🎯 ${pvT("Cần ≥30% (3/10) để qua buổi", "Reach ≥30% (3/10) to pass the session")}
    </div>
    <button class="pv-start-btn" style="background:linear-gradient(135deg,${session.color},#a855f7);box-shadow:0 6px 20px ${session.color}44" onclick="pvSetPhase('flash')">
      ${pvT("Bắt đầu học", "Start learning")} 🚀
    </button>
  </div>`;
  return html;
}

/* ── Tone Guide HTML ── */
function renderToneGuide(tone) {
  const g = PV_TONE_GUIDE.find(x => x.tone === tone);
  if (!g) return '';
  return `<div class="pv-tone-guide" style="background:${g.bg};border-color:${g.border}">
    <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:2px">
      <div style="font-size:10px;font-weight:800;color:#9ca3af;letter-spacing:2px">CAO</div>
      <svg class="pv-tone-svg" width="90" height="70" viewBox="0 0 100 80">
        <line x1="5" y1="15" x2="95" y2="15" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="5" y1="30" x2="95" y2="30" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="5" y1="45" x2="95" y2="45" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="5" y1="60" x2="95" y2="60" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="5" y1="75" x2="95" y2="75" stroke="#f1f5f9" stroke-width="1"/>
        <polyline points="${g.path.replace('M','').replace(/L/g,' ').trim()}" fill="none" stroke="${g.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="pv-tone-line" style="filter:drop-shadow(0 2px 4px ${g.color}55)"/>
        <text x="50" y="78" text-anchor="middle" font-size="11" font-weight="800" fill="${g.color}" font-family="'Nunito',sans-serif">${tone}声</text>
      </svg>
      <div style="font-size:10px;font-weight:800;color:#9ca3af;letter-spacing:2px">THẤP</div>
    </div>
    <div class="tg-info">
      <div class="tg-name" style="color:${g.color}">${g.name}</div>
      <div class="tg-viet">${g.viet}</div>
      <div class="tg-tip" style="background:${g.color}15;color:${g.color}">💡 ${g.tip}</div>
    </div>
  </div>`;
}

/* ── Flash Phase ── */
function renderFlash(session) {
  const idx = pvState.flashIdx;
  const card = session.cards[idx];
  const flipped = pvState.flashFlipped;
  const done = pvState.flashDone;
  const hasToneGuide = PV_TONE_GUIDE.some(g => g.tone === card.tone);
  const speaking = pvState.speaking;

  // Auto-speak on mount
  if (!pvState._flashSpeakingTriggered || pvState._flashSpeakingTriggered !== idx) {
    pvState._flashSpeakingTriggered = idx;
    pvState.flashFlipped = false;
    setTimeout(() => {
      pvState.speaking = true;
      pvSpeak(card.hanzi, true);
      setTimeout(() => { pvState.speaking = false; }, 2200);
    }, 200);
  }

  let html = `<div class="pv-flash-wrap">
    <div class="pv-flash-progress">`;
  session.cards.forEach((_, i) => {
    const w = i === idx ? 24 : 8;
    const bg = done.includes(i) ? '#22c55e' : i === idx ? 'linear-gradient(to right,#ec4899,#a855f7)' : '#fce7f3';
    html += `<div class="pv-flash-dot" style="width:${w}px;height:6px;border-radius:4px;background:${bg}"></div>`;
  });
  html += `</div>
    <p style="color:#9ca3af;font-weight:700;font-size:.85rem;text-align:center;margin-bottom:14px">${pvT("Thẻ", "Card")} ${idx+1}/${session.cards.length}</p>
    <div class="pv-flash-card${flipped ? ' flipped' : ''}" onclick="pvFlipCard()">
      <div class="pv-flash-front">
        <div class="pv-flash-pinyin" style="font-size:3rem">${pvApplyTone(card.pinyin, card.tone)}</div>
        <div style="display:flex;gap:4px;margin-top:8px">`;
  [1,2,3,4].forEach(t => {
    const isThis = t === card.tone;
    html += `<span style="width:24px;height:24px;border-radius:50%;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid;transition:all .2s;background:${isThis ? 'linear-gradient(135deg,#ec4899,#a855f7)' : '#fdf2f8'};border-color:${isThis ? 'transparent' : '#fbcfe8'};color:${isThis ? '#fff' : '#f9a8d4'};transform:${isThis ? 'scale(1.15)' : 'scale(1)'}">${t}</span>`;
  });
  html += `</div>
        <button class="pv-flash-btn" style="margin-top:14px;background:${speaking ? 'linear-gradient(135deg,#ec4899,#a855f7)' : '#fdf2f8'};color:${speaking ? '#fff' : '#ec4899'};box-shadow:${speaking ? '0 4px 14px rgba(236,72,153,.4)' : 'none'}" onclick="event.stopPropagation();pvTeacherSpeak('${card.hanzi}')">
          ${speaking ? `🔊 ${pvT("Đang đọc...", "Reading...")}` : `🔊 ${pvT("Nghe giáo viên", "Listen to teacher")}`}
        </button>
        <div style="position:absolute;bottom:12px;color:#d1d5db;font-size:11px;animation:pvPulse 2s ease infinite">${pvT("nhấn thẻ để xem chữ", "tap card to see Hanzi")} ↗</div>
      </div>
      <div class="pv-flash-back">
        <div class="pv-flash-hanzi" style="font-size:4.5rem">${card.hanzi}</div>
        <div class="pv-flash-pinyin" style="font-size:1.4rem;margin-top:6px">${pvApplyTone(card.pinyin, card.tone)}</div>
        <div class="pv-flash-viet" style="font-size:.95rem;margin-top:2px">${pvCardMeaning(card)}</div>
        <button class="pv-flash-btn" style="margin-top:10px;background:rgba(255,255,255,.7);color:#ec4899;border:2px solid #fbcfe8" onclick="event.stopPropagation();pvTeacherSpeak('${card.hanzi}')">
          🔊 ${pvT("Nghe lại", "Listen again")}
        </button>
      </div>
    </div>`;

  if (hasToneGuide) {
    html += renderToneGuide(card.tone);
  }

  const isLast = idx >= session.cards.length - 1;
  html += `<div class="pv-action-row">
    <button class="pv-action-btn" style="background:#fdf2f8;border-color:#fbcfe8;color:#ec4899" onclick="pvTeacherSpeak('${card.hanzi}')">🔊 ${pvT("Nghe lại", "Listen again")}</button>
    <button class="pv-action-btn" style="background:linear-gradient(135deg,#ec4899,#a855f7);color:#fff;border-color:transparent;box-shadow:0 4px 14px rgba(236,72,153,.35)" onclick="pvFlashNext()">
      ${isLast ? `${pvT("Vào Game", "Enter game")} 🎮` : `${pvT("Tiếp theo", "Next")} →`}
    </button>
  </div>
  </div>`;
  return html;
}

/* ── Game Phase ── */
function renderGame(session) {
  const ROUNDS = Math.min(8, session.cards.length);
  const round = pvState.gameRound;
  const score = pvState.gameScore;
  const streak = pvState.gameStreak;
  const chosen = pvState.gameChosen;

  // Generate question
  const correct = session.cards[round % session.cards.length];
  const others = session.cards.filter((_, i) => i !== round % session.cards.length);
  const distractors = others.sort(() => Math.random() - 0.5).slice(0, 3);
  const opts = [...distractors, correct].sort(() => Math.random() - 0.5);
  const correctIdx = opts.findIndex(o => o.pinyin === correct.pinyin && o.tone === correct.tone);

  // Auto-speak
  if (!pvState._gameSpeakingTriggered || pvState._gameSpeakingTriggered !== round) {
    pvState._gameSpeakingTriggered = round;
    pvState.gameChosen = null;
    setTimeout(() => pvSpeak(correct.hanzi), 400);
  }

  let html = `<div class="pv-game-wrap">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
      <div class="pv-game-score">⭐ ${score}</div>
      ${streak >= 2 ? `<div style="padding:4px 10px;border-radius:12px;font-size:.72rem;font-weight:800;color:#fff;background:linear-gradient(135deg,#f97316,#fbbf24)">🔥 ${streak} liên tiếp!</div>` : ''}
      <div style="color:#9ca3af;font-weight:700;font-size:.82rem">${round+1}/${ROUNDS}</div>
    </div>
    <div style="width:100%;height:8px;background:#fce7f3;border-radius:6px;overflow:hidden;margin-bottom:24px;border:1px solid #fbcfe8">
      <div style="height:100%;border-radius:6px;width:${(round/ROUNDS)*100}%;background:linear-gradient(to right,#ec4899,#a855f7);transition:width .5s"></div>
    </div>
    <div class="pv-game-question">
      <p style="color:#9ca3af;font-weight:700;font-size:.82rem;margin-bottom:10px">Chọn pinyin đúng cho âm vừa nghe</p>
      <button onclick="pvSpeak('${correct.hanzi}')" style="font-size:2.8rem;background:none;border:none;cursor:pointer">🔊</button>
      <div style="font-size:1.8rem;font-weight:700;color:#1e1b4b;font-family:'Noto Serif SC',serif;margin-top:6px">${correct.hanzi}</div>
      <div style="color:#6b7280;font-size:.82rem;font-weight:600;margin-top:2px">${correct.viet}</div>
    </div>
    <div class="pv-game-opts">`;

  opts.forEach((opt, i) => {
    let bg = 'rgba(255,255,255,.9)', border = '#fce7f3', col = '#374151';
    if (chosen !== null) {
      if (i === correctIdx) { bg = 'linear-gradient(135deg,#22c55e,#16a34a)'; border = 'transparent'; col = '#fff'; }
      else if (chosen === i) { bg = 'linear-gradient(135deg,#ef4444,#dc2626)'; border = 'transparent'; col = '#fff'; }
    }
    html += `<div class="pv-game-opt" style="background:${bg};border-color:${border};color:${col}" onclick="pvGamePick(${i},${correctIdx})">
      <span style="font-family:'Noto Sans SC',sans-serif">${pvApplyTone(opt.pinyin, opt.tone)}</span>
    </div>`;
  });

  html += `</div>`;

  if (chosen !== null) {
    const ok = chosen === correctIdx;
    html += `<div style="margin-top:12px;text-align:center;font-weight:800;font-size:.95rem;animation:pvPop .4s ease;color:${ok ? '#22c55e' : '#ef4444'}">
      ${ok ? '🎉 Chính xác!' : '❌ Đáp án: ' + pvApplyTone(correct.pinyin, correct.tone)}
    </div>`;
  }

  html += '</div>';
  return html;
}

/* ── Quiz Phase ── */
function renderQuiz(session) {
  const TOTAL = 10;
  let questions = pvState.quizQuestions;
  if (!questions || questions.length === 0) {
    // Generate questions
    const pool = [...session.cards, ...session.cards].sort(() => Math.random() - 0.5).slice(0, TOTAL);
    questions = pool.map(correct => {
      const others = session.cards.filter(c => !(c.pinyin === correct.pinyin && c.tone === correct.tone));
      const distractors = others.sort(() => Math.random() - 0.5).slice(0, 3);
      const type = Math.random() < 0.5 ? 'pinyin2hanzi' : 'hanzi2pinyin';
      return { correct, opts: [...distractors, correct].sort(() => Math.random() - 0.5), type };
    });
    pvState.quizQuestions = questions;
  }

  const qIdx = pvState.quizQIdx;
  const score = pvState.quizScore;
  const chosen = pvState.quizChosen;
  const answers = pvState.quizAnswers;
  const q = questions[qIdx];
  if (!q) return '<div>Đang tải...</div>';

  // Auto-speak
  if (!pvState._quizSpeakingTriggered || pvState._quizSpeakingTriggered !== qIdx) {
    pvState._quizSpeakingTriggered = qIdx;
    pvState.quizChosen = null;
    if (q.type === 'pinyin2hanzi') pvSpeak(q.correct.hanzi);
  }

  const correctIdx = q.opts.findIndex(o => o.pinyin === q.correct.pinyin && o.tone === q.correct.tone);

  let html = `<div class="pv-quiz-wrap">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.1rem;color:${session.color}">Câu ${qIdx+1}/${TOTAL}</div>
      <div style="padding:4px 12px;border-radius:12px;font-weight:800;font-size:.82rem;color:#fff;background:linear-gradient(135deg,${session.color},#a855f7)">✅ ${score}/${qIdx}</div>
    </div>
    <div style="width:100%;height:8px;background:#fce7f3;border-radius:6px;overflow:hidden;margin-bottom:18px;border:1px solid #fbcfe8">
      <div style="height:100%;border-radius:6px;width:${(qIdx/TOTAL)*100}%;background:linear-gradient(to right,${session.color},#a855f7);transition:width .3s"></div>
    </div>`;

  if (q.type === 'pinyin2hanzi') {
    html += `<div class="pv-quiz-card">
      <p style="color:#9ca3af;font-weight:700;font-size:.72rem;margin-bottom:10px;text-transform:uppercase;letter-spacing:2px">Chọn chữ Hán đúng</p>
      <button onclick="pvSpeak('${q.correct.hanzi}')" style="font-size:2.2rem;background:none;border:none;cursor:pointer">🔊</button>
      <div style="font-size:1.3rem;font-weight:800;color:${session.color};font-family:'Noto Sans SC',sans-serif">${pvApplyTone(q.correct.pinyin, q.correct.tone)}</div>
    </div>`;
  } else {
    html += `<div class="pv-quiz-card">
      <p style="color:#9ca3af;font-weight:700;font-size:.72rem;margin-bottom:10px;text-transform:uppercase;letter-spacing:2px">Chọn pinyin đúng</p>
      <div style="font-size:3rem;font-weight:700;font-family:'Noto Serif SC',serif;color:#1e1b4b">${q.correct.hanzi}</div>
      <div style="color:#6b7280;font-weight:600;font-size:.85rem;margin-top:4px">${q.correct.viet}</div>
    </div>`;
  }

  html += '<div class="pv-quiz-opts">';
  q.opts.forEach((opt, i) => {
    let bg = 'rgba(255,255,255,.9)', border = '#fce7f3', col = '#374151', fs = q.type === 'pinyin2hanzi' ? '1.4rem' : '.95rem';
    if (chosen !== null) {
      if (i === correctIdx) { bg = 'linear-gradient(135deg,#22c55e,#16a34a)'; border = 'transparent'; col = '#fff'; }
      else if (chosen === i) { bg = 'linear-gradient(135deg,#ef4444,#dc2626)'; border = 'transparent'; col = '#fff'; }
    }
    const font = q.type === 'pinyin2hanzi' ? "'Noto Serif SC',serif" : "'Noto Sans SC',sans-serif";
    const text = q.type === 'pinyin2hanzi' ? opt.hanzi : pvApplyTone(opt.pinyin, opt.tone);
    html += `<div class="pv-quiz-opt" style="background:${bg};border-color:${border};color:${col};font-size:${fs};font-family:${font}" onclick="pvQuizPick(${i},${correctIdx})">${text}</div>`;
  });
  html += '</div>';

  html += `<div class="pv-quiz-dots">`;
  for (let i = 0; i < TOTAL; i++) {
    const bg = i < answers.length ? (answers[i] ? '#22c55e' : '#ef4444') : '#fce7f3';
    html += `<div class="pv-quiz-dot" style="background:${bg}"></div>`;
  }
  html += `</div></div>`;
  return html;
}

/* ── Result Screen ── */
function renderResult(session) {
  const score = pvState.quizScore;
  const total = 10;
  const pct = Math.round(score / total * 100);
  const isPass = score / total >= 0.3;
  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 6 ? 1 : 0;

  // Auto-speak result
  if (!pvState._resultSpoken) {
    pvState._resultSpoken = true;
    pvSpeak(isPass ? '太棒了！' : '继续加油！');
  }

  const dashLen = pct * 2.64;
  let html = `<div class="pv-result">
    <div style="font-size:3.5rem;margin-bottom:12px">${isPass ? '🎉' : '😊'}</div>
    <h2 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;color:#1e1b4b;margin-bottom:4px">${isPass ? (window.LANG_MODE === 'en' ? 'Passed the learning session! 🏆' : 'Đã qua buổi học! 🏆') : (window.LANG_MODE === 'en' ? 'Keep practising and try again 💪' : 'Cố lên! Thử lại nhé 💪')}</h2>
    <p style="color:#9ca3af;font-weight:600;margin-bottom:24px">${isPass ? (window.LANG_MODE === 'en' ? 'Reached 30% — the next session can now be evaluated for unlock.' : 'Đạt 30% — buổi tiếp theo được xét mở khóa.') : (window.LANG_MODE === 'en' ? 'You need at least 30% (3/10) to pass this session.' : 'Cần ≥30% (3/10) để qua buổi.')}</p>
    <svg viewBox="0 0 100 100" style="width:120px;height:120px;transform:rotate(-90deg)">
      <circle cx="50" cy="50" r="42" fill="none" stroke="#fce7f3" stroke-width="10"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke-width="10" stroke-linecap="round"
        stroke="${isPass ? '#22c55e' : session.color}" stroke-dasharray="${dashLen} 264"
        style="transition:stroke-dasharray 1s ease"/>
    </svg>
    <div style="margin-top:-80px;display:flex;flex-direction:column;align-items:center">
      <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:2rem;color:#1e1b4b">${pct}%</div>
      <div style="font-size:.82rem;color:#9ca3af;font-weight:600">${score}/${total}</div>
    </div>
    <div style="display:flex;gap:6px;font-size:1.8rem;margin-top:10px;margin-bottom:24px">
      ${[1,2,3].map(i => `<span style="opacity:${i<=stars?1:.25};transform:${i<=stars?'scale(1.1)':'none'}">⭐</span>`).join('')}
    </div>
    <div class="pv-action-row">
      <button class="pv-action-btn" style="background:#fdf2f8;border-color:#fbcfe8;color:#ec4899" onclick="pvRetryQuiz()">🔄 Làm lại</button>
      ${isPass ? `<button class="pv-action-btn" style="background:linear-gradient(135deg,${session.color},#a855f7);color:#fff;border-color:transparent;box-shadow:0 4px 14px ${session.color}44" onclick="pvNextSession()">Buổi tiếp →</button>` : ''}
    </div>
  </div>`;
  return html;
}

/* ── Actions ── */
function pvOpenSession(id) {
  pvState.activeSession = id;
  pvState.phase = 'intro';
  pvState.flashIdx = 0;
  pvState.flashFlipped = false;
  pvState.flashDone = [];
  pvState.gameRound = 0;
  pvState.gameScore = 0;
  pvState.gameStreak = 0;
  pvState.gameChosen = null;
  pvState.quizQIdx = 0;
  pvState.quizScore = 0;
  pvState.quizChosen = null;
  pvState.quizAnswers = [];
  pvState.quizQuestions = [];
  pvState.speaking = false;
  pvState._flashSpeakingTriggered = -1;
  pvState._gameSpeakingTriggered = -1;
  pvState._quizSpeakingTriggered = -1;
  pvState._resultSpoken = false;
  renderPinyinView();
}

function pvBackToList() {
  pvState.activeSession = null;
  pvState.phase = 'intro';
  renderPinyinView();
}

function pvSetPhase(phase) {
  pvState.phase = phase;
  pvState._flashSpeakingTriggered = -1;
  pvState._gameSpeakingTriggered = -1;
  pvState._quizSpeakingTriggered = -1;
  pvState._resultSpoken = false;
  renderPinyinView();
}

function pvFlipCard() {
  pvState.flashFlipped = !pvState.flashFlipped;
  if (!pvState.flashFlipped) {
    const session = PV_SESSIONS.find(s => s.id === pvState.activeSession);
    if (session) pvTeacherSpeak(session.cards[pvState.flashIdx].hanzi);
  }
  renderPinyinView();
}

function pvTeacherSpeak(hanzi) {
  pvState.speaking = true;
  pvSpeak(hanzi, true);
  setTimeout(() => { pvState.speaking = false; }, 2200);
  // Re-render to update button state
  setTimeout(() => renderPinyinView(), 2300);
}

function pvFlashNext() {
  const session = PV_SESSIONS.find(s => s.id === pvState.activeSession);
  if (!session) return;
  const done = [...pvState.flashDone, pvState.flashIdx];
  pvState.flashDone = done;
  if (pvState.flashIdx < session.cards.length - 1) {
    pvState.flashIdx = pvState.flashIdx + 1;
    pvState.flashFlipped = false;
  } else {
    pvState.phase = 'game';
  }
  pvState._flashSpeakingTriggered = -1;
  renderPinyinView();
}

function pvGamePick(i, correctIdx) {
  if (pvState.gameChosen !== null) return;
  pvState.gameChosen = i;
  const session = PV_SESSIONS.find(s => s.id === pvState.activeSession);
  const ROUNDS = Math.min(8, session.cards.length);
  if (i === correctIdx) {
    pvState.gameScore = pvState.gameScore + 1;
    pvState.gameStreak = pvState.gameStreak + 1;
  } else {
    pvState.gameStreak = 0;
  }
  setTimeout(() => {
    if (pvState.gameRound < ROUNDS - 1) {
      pvState.gameRound = pvState.gameRound + 1;
      pvState.gameChosen = null;
    } else {
      pvState.phase = 'quiz';
    }
    pvState._gameSpeakingTriggered = -1;
    renderPinyinView();
  }, 1000);
}

function pvQuizPick(i, correctIdx) {
  if (pvState.quizChosen !== null) return;
  pvState.quizChosen = i;
  const ok = i === correctIdx;
  if (ok) pvState.quizScore = pvState.quizScore + 1;
  pvState.quizAnswers = [...pvState.quizAnswers, ok];
  setTimeout(() => {
    if (pvState.quizQIdx < pvState.quizQuestions.length - 1) {
      pvState.quizQIdx = pvState.quizQIdx + 1;
      pvState.quizChosen = null;
    } else {
      pvState.phase = 'result';
      // Save progress
      const sid = pvState.activeSession;
      const p = pvState.progress[sid] || { stars:0, bestScore:0, unlocked:true };
      const finalScore = ok ? pvState.quizScore : pvState.quizScore;
      const newStars = finalScore >= 9 ? 3 : finalScore >= 8 ? 2 : finalScore >= 6 ? 1 : 0;
      pvState.progress[sid] = {
        stars: Math.max(p.stars || 0, newStars),
        bestScore: Math.max(p.bestScore || 0, finalScore),
        unlocked: true
      };
      // Unlock next session
      const next = sid + 1;
      if (next <= 10 && finalScore / 10 >= 0.8) {
        pvState.progress[next] = pvState.progress[next] || { stars:0, bestScore:0, unlocked:true };
        pvState.progress[next].unlocked = true;
      }
      pvSaveProgress(pvState.progress);
    }
    pvState._quizSpeakingTriggered = -1;
    renderPinyinView();
  }, 900);
}

function pvRetryQuiz() {
  pvState.phase = 'quiz';
  pvState.quizQIdx = 0;
  pvState.quizScore = 0;
  pvState.quizChosen = null;
  pvState.quizAnswers = [];
  pvState.quizQuestions = [];
  pvState._quizSpeakingTriggered = -1;
  pvState._resultSpoken = false;
  renderPinyinView();
}

function pvNextSession() {
  const sid = pvState.activeSession;
  const next = sid + 1;
  pvState.activeSession = null;
  if (next <= 10 && pvState.progress[next] && pvState.progress[next].unlocked) {
    pvOpenSession(next);
  } else {
    renderPinyinView();
  }
}

/* Pulse animation for hint text */


  /* ===================== INTEGRATED CHAT & AUTOMATIC EMAIL NOTIFICATIONS ===================== */
  let activeChatUserId = null;
  let activeChatId = null;
  let chatUnsubscribe = null;
  let globalChatUnsubscribe = null;
  let pendingChatFile = null; // File selected via 📎 but not sent yet

  function isTeacherRole() {
    return USER_ROLE === "teacher" || USER_ROLE === "master_teacher";
  }

  function startGlobalChatListener(){return;}

  async function fetchAllUsers() {
    // Shared helper: try Firestore first, then fall back to any local demo data.
    let all = [];
    try {
      if (typeof db !== "undefined") {
        const snap = await db.collection("users").get();
        all = snap.docs.map(doc => {
          const data = doc.data();
          return { ...data, uid: data.uid || data.username || doc.id };
        });
      }
    } catch (e) {
      console.error("fetchAllUsers error:", e);
    }
    if (all.length === 0 && typeof DEMO_USERS !== "undefined") all = DEMO_USERS.slice();
    if (all.length === 0 && typeof USERS !== "undefined" && Array.isArray(USERS)) all = USERS.slice();
    return all;
  }

  async function initChatSystem() {
    const contactListEl = document.getElementById("chatContactList");
    if (!contactListEl) return;
    contactListEl.innerHTML = `<div style="font-size:12px;color:var(--text-light);padding:8px;">${window.LANG_MODE === "en" ? "Loading contacts..." : "Đang tải danh sách..."}</div>`;

    const broadcastBtn = document.getElementById("chatBroadcastBtn");
    if (broadcastBtn) {
      broadcastBtn.style.display = isTeacherRole() ? "block" : "none";
      broadcastBtn.onclick = openBroadcastComposer;
    }

    const backBtn = document.getElementById("chatBackBtn");
    if (backBtn) backBtn.onclick = () => document.getElementById("chatWrap").classList.remove("chat-open");

    let contacts = [];
    try {
      const myUid = CURRENT_USER ? (CURRENT_USER.uid || CURRENT_USER.username) : "";
      const all = await fetchAllUsers();
      contacts = all.filter(u => (u.uid || u.username) !== myUid);

      // Học viên chỉ được thấy Giáo viên trong danh sách liên hệ — không nhắn
      // tin trực tiếp được với học viên khác.
        if (!isTeacherRole()) {
        contacts = contacts.filter(u => u.role === "teacher" || u.role === "master_teacher");
      }
    } catch (e) {
      console.error("initChatSystem error:", e);
    }

    contactListEl.innerHTML = "";

    if (contacts.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "font-size:12px;color:var(--text-light);padding:8px;";
      empty.textContent = window.LANG_MODE === "en" ? (isTeacherRole() ? "No contacts yet." : "No teacher is available for messaging yet.") : (isTeacherRole() ? "Chưa có liên hệ nào." : "Chưa có giáo viên nào để nhắn tin.");
      contactListEl.appendChild(empty);
      return;
    }

    contacts.forEach(u => {
      const uid = u.uid || u.username;
      const div = document.createElement("div");
      div.className = "chat-contact";
      div.dataset.uid = uid;
      const isAi = !!u.isAi;
      const roleLabel = isAi ? (window.LANG_MODE === "en" ? "🤖 120-day Learning Path Assistant" : "🤖 Trợ lý lộ trình 120 ngày") : ((u.role === "teacher" || u.role === "master_teacher") ? (window.LANG_MODE === "en" ? "👩‍🏫 Teacher" : "👩‍🏫 Giáo viên") : (window.LANG_MODE === "en" ? "🎓 Student" : "🎓 Học viên"));
      const roleColor = isAi ? "var(--pink)" : ((u.role === "teacher" || u.role === "master_teacher") ? "var(--hsk3)" : "var(--hsk2)");

      div.innerHTML = '<div class="cc-avatar">' + (isAi ? "🤖" : (u.name || "U").charAt(0).toUpperCase()) + '</div>' +
        '<div class="cc-meta">' +
          '<div class="cc-name">' + escapeHtml(u.name || u.username) + '</div>' +
          '<div class="cc-role" style="color:' + roleColor + ';">' + roleLabel + '</div>' +
        '</div>';
      div.onclick = () => {
        document.querySelectorAll(".chat-contact").forEach(el => el.classList.remove("active"));
        div.classList.add("active");
        document.getElementById("chatWrap").classList.add("chat-open"); // mobile: slide to chat view
        if (isAi) openAiCoachChat();
        else openChatWith(uid, u.name || u.username);
      };
      contactListEl.appendChild(div);
    });
  }

  function aiConversationKey() {
    let ns = "guest";
    try { ns = typeof window.storageNamespace === "function" ? String(window.storageNamespace() || "guest") : String(window.CURRENT_USER?.uid || window.CURRENT_USER?.username || "guest"); } catch (_) {}
    return "pandahan_ai_conversation_v2_" + ns.replace(/[^a-zA-Z0-9_-]/g, "_");
  }
  function loadAiConversation() {
    try { const value = JSON.parse(localStorage.getItem(aiConversationKey()) || "[]"); return Array.isArray(value) ? value.filter((m) => m && (m.role === "user" || m.role === "bot") && String(m.text || "").trim()).slice(-30) : []; } catch (_) { return []; }
  }
  function saveAiConversation(items) {
    try { localStorage.setItem(aiConversationKey(), JSON.stringify(items.slice(-30))); } catch (_) {}
  }
  function conversationBox(area) {
    if (!area) return null;
    let box = area.querySelector("[data-ai-conversation]");
    if (!box) {
      box = document.createElement("section");
      box.setAttribute("data-ai-conversation", "true");
      box.style.cssText = "margin-top:12px;display:flex;flex-direction:column;gap:7px;";
      area.appendChild(box);
    }
    return box;
  }
  function renderAiConversation(area) {
    const box = conversationBox(area);
    if (!box) return;
    box.innerHTML = "";
    const history = loadAiConversation();
    if (!history.length) {
      const welcomeVi = "Xin chào! Mình là AI Coach của PandaHán. Lộ trình 3.0 gồm 120 ngày HSK1–HSK2–HSK3: mỗi ngày học Ngữ âm, nhóm từ liên kết, luyện nghe/nói, Pinyin Tone Quest và viết/ôn tập. Buổi tiếp theo chỉ được xét mở khi đủ nhiệm vụ đã xác minh và đạt ngưỡng 30%. Nếu bỏ lỡ hoặc chưa hoàn thành, hệ thống tạo buổi repeat 121, 122, 123…; từ/câu làm sai sẽ vào hàng đợi ôn lại theo mốc 1–3–5–7–14–30–60 ngày. Bạn có thể hỏi mình bất kỳ bài nào, ví dụ: “Viết đoạn văn HSK 2 về cuối tuần” hoặc “Giải thích rubric grammar”.";
      const welcomeEn = "Hi! I am PandaHan AI Coach. The 3.0 path has 120 HSK1–HSK2–HSK3 days: each day connects phonetics, linked vocabulary, listening/speaking, Pinyin Tone Quest, writing and review. The next session is evaluated for unlock only after verified tasks are complete and the 30% threshold is met. Missed or incomplete work creates repeat sessions 121, 122, 123…; wrong words/sentences enter spaced redo at 1–3–5–7–14–30–60-day intervals. Ask me about any task, for example “Write an HSK 2 paragraph about my weekend” or “Explain the grammar rubric”.";
      renderAiCoachMessage(window.LANG_MODE === "en" ? welcomeEn : welcomeVi, "bot", true);
    } else {
      history.forEach((m) => renderAiCoachMessage(m.text, m.role, false));
    }
  }
  function renderAiTopicLibrary(area) {
    area?.querySelector("[data-ai-topic-library]")?.remove();
    const library = window.PandaHanHskLibrary?.items;
    if (!Array.isArray(library) || !library.length || !area) return;
    const en = window.LANG_MODE === "en";
    const section = document.createElement("section");
    section.setAttribute("data-ai-topic-library", "true");
    section.style.cssText = "margin-top:10px;padding:10px 11px;border:1px solid #f2bfd8;border-radius:12px;background:#fff7fb;";
    const groups = [1, 2, 3, 4, 5, 6].map((level) => {
      const buttons = library.filter((item) => Number(item.level) === level).map((item) => `<button type="button" data-ai-topic="${escapeHtml(item.id)}" style="border:1px solid #efb6ce;background:#fce7f3;color:#201c22;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:700;cursor:pointer;">${escapeHtml(en ? item.topicEn : item.topicVi)}</button>`).join("");
      return `<div style="margin-top:7px;display:flex;gap:6px;align-items:flex-start;flex-wrap:wrap;"><b style="font-size:11px;color:#a21c5a;min-width:38px;padding-top:6px;">HSK ${level}</b>${buttons}</div>`;
    }).join("");
    section.innerHTML = `<b style="color:#75214c;">${en ? "Choose a structured HSK topic" : "Chọn chủ đề HSK có sẵn"}</b><div style="font-size:11.5px;color:#5b4964;margin-top:3px;">${en ? "Each topic gives a multi-sentence paragraph, pinyin, meaning, vocabulary, grammar and a mini dialogue." : "Mỗi chủ đề sẽ có đoạn nhiều câu, pinyin, nghĩa, từ vựng, ngữ pháp và hội thoại ngắn."}</div>${groups}`;
    section.querySelectorAll("[data-ai-topic]").forEach((button) => button.addEventListener("click", () => {
      const topic = library.find((item) => item.id === button.dataset.aiTopic);
      if (!topic) return;
      sendAiCoachMessage(en ? `HSK ${topic.level} topic: ${topic.topicEn}` : `Chủ đề HSK ${topic.level}: ${topic.topicVi}`);
    }));
    area.appendChild(section);
  }
  const aiTutorState = { level: 0, length: "adaptive", language: "auto", selectedTopicId: "", selectedVocabChar: "", reviewFeedback: "", selectedInlineTerm: "", inlineFeedback: "", inlineOverrides: {}, busy: false };
  function tutorResponseLanguage(text) {
    if (["vi", "en", "zh"].includes(aiTutorState.language)) return aiTutorState.language;
    return window.PandaHanMission?.detectResponseLanguage?.(text, "auto") || window.LANG_MODE || "vi";
  }
  function tutorText(vi, en, zh) {
    const lang = tutorResponseLanguage("");
    return lang === "zh" ? zh : lang === "en" ? en : vi;
  }
  function tutorHighlightScope(role, text, stableId = "") {
    const seed = `${stableId}|${role}|${String(text || "").slice(0, 3000)}`;
    let hash = 5381;
    for (let index = 0; index < seed.length; index += 1) hash = ((hash * 33) ^ seed.charCodeAt(index)) >>> 0;
    return `ai_tutor_${role}_${hash.toString(36)}`;
  }
  function tutorBubble(area, text, role, stableId = "") {
    if (!area) return;
    const row = document.createElement("div");
    row.className = "chat-msg-row " + (role === "user" ? "me" : "them");
    const bubble = document.createElement("div");
    const highlightScope = tutorHighlightScope(role, text, stableId);
    bubble.className = "chat-bubble2 lookup-text ai-tutor-highlightable";
    bubble.dataset.highlightScope = highlightScope;
    bubble.title = tutorText("Bôi đen nội dung để highlight giống Từ điển", "Select text to highlight it like Dictionary text", "选中文本即可像词典一样高亮");
    bubble.innerHTML = escapeHtml(String(text || "")).replace(/\n/g, "<br>");
    row.appendChild(bubble);
    area.appendChild(row);
    requestAnimationFrame(() => window.PandaHanTextHighlights?.apply?.(highlightScope, bubble));
    area.scrollTop = area.scrollHeight;
  }
  function tutorProcessingStatus(area, mode, text) {
    if (!area) return;
    area.querySelector("[data-ai-tutor-processing]")?.remove();
    const row = document.createElement("div");
    row.className = `ai-tutor-processing ${mode || "processing"}`;
    row.setAttribute("data-ai-tutor-processing", "true");
    const dots = mode === "processing" ? "<span class=\"ai-tutor-typing-dots\"><i></i><i></i><i></i></span>" : "";
    row.innerHTML = `${dots}<span>${escapeHtml(String(text || ""))}</span>`;
    area.appendChild(row);
    area.scrollTop = area.scrollHeight;
  }
  function tutorClearProcessing(area) { area?.querySelector("[data-ai-tutor-processing]")?.remove(); }
  function setTutorComposerBusy(busy) {
    aiTutorState.busy = !!busy;
    const input = document.getElementById("aiTutorInput");
    const send = document.getElementById("aiTutorSend");
    if (input) input.disabled = !!busy;
    if (send) {
      send.disabled = !!busy;
      send.setAttribute("aria-busy", String(!!busy));
      send.textContent = busy ? tutorText("Đang xử lý…", "Working…", "处理中…") : tutorText("Gửi", "Send", "发送");
    }
  }
  function renderAiTutorHistory(area) {
    if (!area) return;
    area.innerHTML = "";
    const history = loadAiConversation();
    if (!history.length) {
      tutorBubble(area, tutorText(
        "Chọn một chủ đề HSK hoặc nhập yêu cầu bằng 中文, Tiếng Việt hay English. AI Tutor sẽ điều chỉnh đoạn mẫu theo cấp độ và độ dài bạn chọn.",
        "Choose an HSK topic or type a request in 中文, Vietnamese, or English. AI Tutor will adapt the model text to your level and selected length.",
        "请选择 HSK 主题，或用中文、Tiếng Việt、English 输入要求。AI Tutor 会按你的等级和篇幅生成练习。"
      ), "bot");
      return;
    }
    history.forEach((item) => tutorBubble(area, item.text, item.role, item.createdAt || ""));
  }
  function tutorTopicGroups() {
    const library = window.PandaHanHskLibrary?.items || [];
    const language = tutorResponseLanguage("");
    return [1, 2, 3, 4, 5, 6].map((level) => {
      const topics = library.filter((topic) => Number(topic.level) === level && (!aiTutorState.level || Number(aiTutorState.level) === level));
      if (!topics.length) return "";
      const buttons = topics.map((topic) => `<button type="button" data-ai-tutor-topic="${escapeHtml(topic.id)}" style="border:1px solid ${aiTutorState.selectedTopicId === topic.id ? "#be185d" : "#efb6ce"};background:${aiTutorState.selectedTopicId === topic.id ? "#f8d7e7" : "#fce7f3"};color:#201c22;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:800;cursor:pointer;">${escapeHtml(language === "vi" ? topic.topicVi : topic.topicEn)}</button>`).join("");
      return `<div style="display:flex;gap:7px;align-items:flex-start;flex-wrap:wrap;margin-top:8px;"><b style="min-width:42px;padding-top:7px;color:#a21c5a;font-size:11px;">HSK ${level}</b>${buttons}</div>`;
    }).join("");
  }
  function tutorSelectedTopic() {
    return (window.PandaHanHskLibrary?.items || []).find((topic) => topic.id === aiTutorState.selectedTopicId) || null;
  }
  function tutorVocabularyEntries(topic) {
    return (topic?.vocabulary || []).map((raw, index) => {
      const [head, ...meaningParts] = String(raw || "").split("—");
      const tokens = String(head || "").trim().split(/\s+/).filter(Boolean);
      return { index, raw: String(raw || ""), char: tokens.shift() || "", pinyin: tokens.join(" "), meaning: meaningParts.join("—").trim() };
    }).filter((entry) => entry.char);
  }
  function tutorSrsLabel(count, due) {
    return tutorText(`${count} từ đã lưu · ${due} từ đến hạn`, `${count} saved words · ${due} due`, `已保存 ${count} 个词 · ${due} 个到期`);
  }
  function tutorHanziSelection(value) {
    return (String(value || "").match(/[\u3400-\u9fff]/g) || []).join("").slice(0, 16);
  }
  function tutorLookupInlineTerm(term, topic) {
    const target = tutorHanziSelection(term);
    if (!target) return { term: "", pinyin: "", meaning: "", source: "" };
    const override = aiTutorState.inlineOverrides?.[target];
    if (override?.pinyin && override?.meaning) return { term: target, pinyin: override.pinyin, meaning: override.meaning, source: tutorText("Ghi chú từ của bạn", "Your saved term note", "你的词汇备注") };
    const topicEntry = tutorVocabularyEntries(topic).find((entry) => entry.char === target);
    if (topicEntry) return { term: target, pinyin: topicEntry.pinyin, meaning: topicEntry.meaning, source: tutorText("Từ mục tiêu của chủ đề", "Topic target vocabulary", "主题重点词汇") };
    const map = window.VOCAB_BY_CHAR || {};
    const record = map[target] || (Array.isArray(window.VOCAB) ? window.VOCAB.find((item) => item.char === target) : null);
    if (record) return {
      term: target,
      pinyin: String(record.pinyin || ""),
      meaning: tutorResponseLanguage("") === "en" ? String(record.meaning_en || record.meaning || "") : String(record.meaning || record.meaning_en || ""),
      source: `Offline HSK ${record.hsk || ""}`.trim()
    };
    const parts = Array.from(target).map((char) => map[char]).filter(Boolean);
    if (parts.length === Array.from(target).length && parts.length) return {
      term: target,
      pinyin: parts.map((item) => item.pinyin || "").filter(Boolean).join(" "),
      meaning: tutorText("Cụm được chọn từ các mục từ đơn trong từ điển Offline.", "Phrase selected from single-word entries in the Offline dictionary.", "由离线词典单字条目组成的所选短语。"),
      source: tutorText("Ghép từ điển Offline", "Offline dictionary composition", "离线词典组合")
    };
    return { term: target, pinyin: "", meaning: "", source: tutorText("Chưa có mục từ Offline khớp hoàn toàn", "No exact Offline dictionary entry", "离线词典暂未找到完全匹配项") };
  }
  function selectedReadingTerm(reading) {
    const selection = window.getSelection?.();
    if (!selection?.rangeCount || !reading?.contains(selection.anchorNode)) return "";
    return tutorHanziSelection(selection.toString());
  }
  function renderTutorInlineTermDetail(container, topic, term) {
    const detail = container?.querySelector("[data-ai-tutor-inline-detail]");
    if (!detail) return;
    const item = tutorLookupInlineTerm(term, topic);
    if (!item.term) {
      detail.innerHTML = `<span>${escapeHtml(tutorText("Bôi đen một từ hoặc cụm từ tiếng Trung trong đoạn rồi bấm Tra nghĩa & lưu.", "Highlight a Chinese word or phrase in the passage, then choose Look up & save.", "请在段落中选中中文词语或短语，然后点击“查义并保存”。"))}</span>`;
      return;
    }
    const needsManual = !item.pinyin || !item.meaning;
    const feedback = aiTutorState.inlineFeedback ? `<div class="ai-tutor-inline-feedback">${escapeHtml(aiTutorState.inlineFeedback)}</div>` : "";
    detail.innerHTML = `<div class="ai-tutor-inline-term"><div><b>${escapeHtml(item.term)}</b><span>${escapeHtml(item.pinyin || "—")}</span></div><p>${escapeHtml(item.meaning || tutorText("Chưa có nghĩa Offline. Bạn có thể điền nghĩa và pinyin trước khi lưu.", "No Offline meaning is available. Enter a meaning and pinyin before saving.", "暂无离线释义；请填写释义和拼音后再保存。"))}</p><small>${escapeHtml(item.source)}</small>${needsManual ? `<div class="ai-tutor-inline-manual"><input id="aiTutorInlinePinyin" value="${escapeHtml(item.pinyin)}" placeholder="${escapeHtml(tutorText("Pinyin", "Pinyin", "拼音"))}"><input id="aiTutorInlineMeaning" value="${escapeHtml(item.meaning)}" placeholder="${escapeHtml(tutorText("Nghĩa", "Meaning", "释义"))}"></div>` : ""}<button type="button" id="aiTutorSaveInlineTerm">${escapeHtml(tutorText("Lưu từ đã chọn vào SRS", "Save selected term to SRS", "保存所选词语到 SRS"))}</button>${feedback}</div>`;
    detail.querySelector("#aiTutorSaveInlineTerm")?.addEventListener("click", () => {
      const pinyin = String(detail.querySelector("#aiTutorInlinePinyin")?.value || item.pinyin || "").trim();
      const meaning = String(detail.querySelector("#aiTutorInlineMeaning")?.value || item.meaning || "").trim();
      if (!pinyin || !meaning) {
        aiTutorState.inlineFeedback = tutorText("Để tạo bài ôn có ích, hãy điền cả pinyin và nghĩa cho mục từ chưa có trong Offline dictionary.", "To create a useful review, enter both pinyin and meaning for a term missing from the Offline dictionary.", "为了生成有效复习，请为离线词典中没有的词语填写拼音和释义。");
        renderTutorInlineTermDetail(container, topic, item.term);
        return;
      }
      window.PandaHanTutorSrs?.add?.(item.term, { pinyin, meaning, topicId: topic.id });
      aiTutorState.inlineOverrides[item.term] = { pinyin, meaning };
      aiTutorState.inlineFeedback = tutorText("Đã lưu từ/cụm từ trong đoạn vào SRS. Lịch ôn 1–3–5–7–14–30–60 chỉ được cập nhật sau câu trả lời ôn thật.", "The selected term has been saved to SRS. The 1–3–5–7–14–30–60 schedule only updates after an actual review answer.", "所选词语已保存到 SRS。1–3–5–7–14–30–60 天的计划只会在实际复习作答后更新。");
      renderTutorInlineTermDetail(container, topic, item.term);
      const study = document.getElementById("aiTutorStudyMount");
      if (study) renderTutorStudyTools(study);
    });
  }
  function renderTutorInlineReading(container) {
    if (!container) return;
    const topic = tutorSelectedTopic();
    const formatted = topic ? window.PandaHanMission?.formatTopicForTutor?.(topic.id, aiTutorState.length) : null;
    if (!topic || !formatted) { container.innerHTML = ""; return; }
    const readingScope = `ai_tutor_reading_${topic.id}_${aiTutorState.length || "adaptive"}`;
    container.innerHTML = `<section class="ai-tutor-inline-reading"><div class="ai-tutor-inline-head"><div><b>${escapeHtml(tutorText("Đoạn đọc tương tác", "Interactive reading", "互动阅读"))}</b><span>${escapeHtml(`HSK ${formatted.level} · ${topic.topicEn}`)}</span></div><small>${escapeHtml(tutorText("Bôi đen từ/cụm từ để tra nghĩa hoặc chọn màu từ thanh highlight giống Từ điển.", "Select a word/phrase to look it up, or use the Dictionary-style highlight palette.", "选中词语可查义，或使用与词典相同的高亮色板。"))}</small></div><p id="aiTutorReadingText" class="ai-tutor-reading-text lookup-text ai-tutor-highlightable" data-highlight-scope="${escapeHtml(readingScope)}" lang="zh" title="${escapeHtml(tutorText("Bôi đen nội dung để highlight giống Từ điển", "Select text to highlight it like Dictionary text", "选中文本即可像词典一样高亮"))}">${escapeHtml(formatted.zh)}</p><p class="ai-tutor-reading-pinyin">${escapeHtml(formatted.pinyin)}</p><div class="ai-tutor-reading-actions"><button type="button" id="aiTutorLookupSelection">${escapeHtml(tutorText("Tra nghĩa & lưu phần đã chọn", "Look up & save selection", "查义并保存所选内容"))}</button><span>${escapeHtml(tutorText("Có thể lưu cả từ đơn lẫn cụm từ; thao tác này không mở khóa schedule.", "You can save single words or phrases; this never unlocks the schedule.", "可保存单词或短语；此操作不会解锁日程。"))}</span></div><div data-ai-tutor-inline-detail></div></section>`;
    const reading = container.querySelector("#aiTutorReadingText");
    window.PandaHanTextHighlights?.apply?.(readingScope, reading);
    const showSelected = () => {
      const term = selectedReadingTerm(reading);
      if (!term) return;
      aiTutorState.selectedInlineTerm = term;
      aiTutorState.inlineFeedback = "";
      renderTutorInlineTermDetail(container, topic, term);
    };
    reading.addEventListener("mouseup", showSelected);
    reading.addEventListener("keyup", showSelected);
    container.querySelector("#aiTutorLookupSelection")?.addEventListener("click", () => {
      const term = selectedReadingTerm(reading) || aiTutorState.selectedInlineTerm;
      aiTutorState.inlineFeedback = "";
      renderTutorInlineTermDetail(container, topic, term);
    });
    renderTutorInlineTermDetail(container, topic, aiTutorState.selectedInlineTerm);
  }
  function renderTutorStudyTools(container) {
    if (!container) return;
    const topic = tutorSelectedTopic();
    const api = window.PandaHanTutorSrs;
    const saved = api?.getAll?.() || [];
    const due = api?.getDue?.() || [];
    if (!topic) {
      container.innerHTML = `<div class="ai-tutor-study-note">${escapeHtml(tutorText("Chọn một chủ đề để xem thẻ từ, lưu từ vào SRS và luyện lại khi đến hạn. Lưu từ không mở khóa lộ trình học.", "Choose a topic to view word cards, save words to SRS, and practise them when due. Saving a word never unlocks the learning schedule.", "选择主题后可查看词卡、保存到 SRS，并在到期时复习。保存词汇不会解锁学习进度。"))}</div>`;
      return;
    }
    const entries = tutorVocabularyEntries(topic);
    const selected = entries.find((entry) => entry.char === aiTutorState.selectedVocabChar) || entries[0] || null;
    const isSaved = selected && saved.some((item) => item.char === selected.char);
    const review = due[0] || null;
    const feedback = aiTutorState.reviewFeedback ? `<div class="ai-tutor-srs-feedback">${escapeHtml(aiTutorState.reviewFeedback)}</div>` : "";
    const reviewHtml = review
      ? `<section class="ai-tutor-srs-review"><b>${escapeHtml(tutorText("Ôn SRS đến hạn", "Due SRS review", "到期 SRS 复习"))}</b><p>${escapeHtml(tutorText("Nhập chữ Hán tương ứng với pinyin và nghĩa sau. Đây là câu trả lời thực tế; kết quả mới cập nhật lịch ôn.", "Type the Hanzi matching the pinyin and meaning below. This is an actual response; only its result updates the review schedule.", "请根据下面的拼音和释义输入对应汉字。只有这次实际作答的结果才会更新复习计划。"))}</p><div class="ai-tutor-review-prompt"><b>${escapeHtml(review.pinyin || "—")}</b><span>${escapeHtml(review.meaning || "—")}</span></div><div class="ai-tutor-review-form"><input id="aiTutorSrsAnswer" autocomplete="off" placeholder="${escapeHtml(tutorText("Nhập chữ Hán", "Type Hanzi", "输入汉字"))}"><button type="button" id="aiTutorSrsCheck">${escapeHtml(tutorText("Kiểm tra", "Check", "检查"))}</button></div>${feedback}</section>`
      : `<section class="ai-tutor-srs-summary"><b>${escapeHtml(tutorText("SRS của AI Tutor", "AI Tutor SRS", "AI Tutor SRS"))}</b><span>${escapeHtml(tutorSrsLabel(saved.length, due.length))}</span><small>${escapeHtml(tutorText("Lịch ôn: 1 · 3 · 5 · 7 · 14 · 30 · 60 ngày. Bài ôn này là học tự do, không ghi evidence mở khóa ngày.", "Review schedule: 1 · 3 · 5 · 7 · 14 · 30 · 60 days. This is free study and does not create schedule-unlock evidence.", "复习间隔：1 · 3 · 5 · 7 · 14 · 30 · 60 天。此练习属于自由学习，不产生解锁日程的 evidence。"))}</small>${feedback}</section>`;
    const cards = entries.map((entry) => {
      const active = selected?.char === entry.char;
      const already = saved.some((item) => item.char === entry.char);
      return `<button type="button" class="ai-tutor-vocab-card ${active ? "active" : ""}" data-ai-tutor-vocab="${entry.index}"><b>${escapeHtml(entry.char)}</b><span>${escapeHtml(entry.pinyin)}</span><em>${already ? "✓ SRS" : ""}</em></button>`;
    }).join("");
    const detail = selected ? `<div class="ai-tutor-vocab-detail"><div><b>${escapeHtml(selected.char)}</b><span>${escapeHtml(selected.pinyin)}</span></div><p>${escapeHtml(selected.meaning)}</p><button type="button" id="aiTutorSaveVocab" ${isSaved ? "disabled" : ""}>${escapeHtml(isSaved ? tutorText("Đã lưu vào SRS", "Saved to SRS", "已保存到 SRS") : tutorText("Lưu từ & tạo lịch ôn", "Save word & create review plan", "保存词汇并创建复习计划"))}</button></div>` : "";
    container.innerHTML = `<section class="ai-tutor-study-tools"><div class="ai-tutor-study-head"><div><b>${escapeHtml(tutorText("Từ vựng của chủ đề", "Topic vocabulary", "主题词汇"))}</b><span>${escapeHtml(`HSK ${topic.level} · ${topic.topicEn}`)}</span></div><small>${escapeHtml(tutorSrsLabel(saved.length, due.length))}</small></div><div class="ai-tutor-vocab-grid">${cards}</div>${detail}${reviewHtml}</section>`;
    container.querySelectorAll("[data-ai-tutor-vocab]").forEach((button) => button.addEventListener("click", () => {
      const entry = entries[Number(button.dataset.aiTutorVocab)];
      if (!entry) return;
      aiTutorState.selectedVocabChar = entry.char;
      aiTutorState.reviewFeedback = "";
      renderTutorStudyTools(container);
    }));
    container.querySelector("#aiTutorSaveVocab")?.addEventListener("click", () => {
      if (!selected) return;
      window.PandaHanTutorSrs?.add?.(selected.char, { pinyin: selected.pinyin, meaning: selected.meaning, topicId: topic.id });
      aiTutorState.reviewFeedback = tutorText("Đã lưu từ. Bạn sẽ thấy bài ôn theo lịch 1–3–5–7–14–30–60 ngày; thao tác này không thay đổi schedule.", "Word saved. Its reviews follow 1–3–5–7–14–30–60 days; this action does not change the schedule.", "词汇已保存。它将按 1–3–5–7–14–30–60 天复习；此操作不会改变学习日程。");
      renderTutorStudyTools(container);
    });
    const check = () => {
      const answer = String(container.querySelector("#aiTutorSrsAnswer")?.value || "").trim();
      if (!review || !answer) return;
      const correct = answer === review.char;
      const result = window.PandaHanTutorSrs?.grade?.(review.char, correct);
      aiTutorState.reviewFeedback = correct
        ? tutorText(`Đúng. Lần ôn tiếp theo sau ${result?.retryDays || 1} ngày.`, `Correct. Your next review is in ${result?.retryDays || 1} day(s).`, `正确。下次复习在 ${result?.retryDays || 1} 天后。`)
        : tutorText("Chưa đúng. Từ được xếp lại sau 1 ngày để bạn ôn tiếp.", "Not correct. The word is scheduled again in 1 day.", "不正确。该词将在 1 天后再次安排复习。");
      renderTutorStudyTools(container);
    };
    container.querySelector("#aiTutorSrsCheck")?.addEventListener("click", check);
    container.querySelector("#aiTutorSrsAnswer")?.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); check(); } });
  }
  async function sendAiTutorMessage(text, topic = null) {
    const clean = String(text || "").trim().slice(0, 2000);
    const area = document.getElementById("aiTutorMessages");
    if (!clean || !area || aiTutorState.busy) return;
    const language = tutorResponseLanguage(clean);
    const userCreatedAt = Date.now();
    tutorBubble(area, clean, "user", userCreatedAt);
    const history = loadAiConversation();
    history.push({ role: "user", text: clean, createdAt: userCreatedAt });
    saveAiConversation(history);
    let reply = "";
    let usedOffline = false;
    setTutorComposerBusy(true);
    tutorProcessingStatus(area, "processing", tutorText("AI Tutor đang suy nghĩ…", "AI Tutor is thinking…", "AI Tutor 正在思考…"));
    try {
      reply = await requestRealAiCoach(clean, language);
    } catch (error) {
      usedOffline = true;
      tutorProcessingStatus(area, "offline", tutorText("Cloud AI chưa khả dụng — đang dùng thư viện Offline…", "Cloud AI is unavailable — using the Offline library…", "Cloud AI 暂不可用 — 正在使用离线题库…"));
      const fallbackText = topic
        ? (language === "zh" ? `HSK ${topic.level} 主题：${topic.topicEn}` : language === "en" ? `HSK ${topic.level} topic: ${topic.topicEn}` : `Chủ đề HSK ${topic.level}: ${topic.topicVi}`)
        : clean;
      reply = window.PandaHanMission?.replyTo?.(fallbackText, { language, length: aiTutorState.length }) || tutorText("AI Tutor đang tải. Hãy thử lại sau.", "AI Tutor is loading. Please try again.", "AI Tutor 正在加载，请稍后再试。");
    }
    tutorClearProcessing(area);
    const botCreatedAt = Date.now();
    tutorBubble(area, reply, "bot", botCreatedAt);
    const next = loadAiConversation();
    next.push({ role: "bot", text: String(reply).slice(0, 3000), createdAt: botCreatedAt });
    saveAiConversation(next);
    setTutorComposerBusy(false);
    tutorProcessingStatus(area, usedOffline ? "offline" : "complete", usedOffline
      ? tutorText("Đã trả lời bằng thư viện Offline. Hội thoại mở cần Cloud Function được deploy.", "Answered with the Offline library. Open conversation needs the Cloud Function deployment.", "已使用离线题库回答。开放式对话需要部署 Cloud Function。")
      : tutorText("Phản hồi AI đã sẵn sàng.", "AI response is ready.", "AI 回复已生成。"));
  }
  function renderAiTutorWorkspace() {
    const mount = document.getElementById("aiChatMount");
    if (!mount) return;
    const language = tutorResponseLanguage("");
    const copy = (vi, en, zh) => language === "zh" ? zh : language === "en" ? en : vi;
    mount.innerHTML = `<section data-ai-tutor-workspace="true" style="display:grid;grid-template-columns:minmax(230px,0.8fr) minmax(0,1.45fr);gap:14px;align-items:start;"><aside style="padding:13px;border:1px solid #f2bfd8;border-radius:16px;background:linear-gradient(135deg,#fff7fb,#fff);"><div style="font-size:11px;font-weight:900;letter-spacing:.08em;color:#a21c5a;text-transform:uppercase;">${copy("AI TUTOR STUDIO", "AI TUTOR STUDIO", "AI TUTOR 工作室")}</div><h3 style="margin:4px 0 5px;color:#3a2432;font-size:18px;">${copy("Luyện theo chủ đề", "Practise by topic", "按主题练习")}</h3><p style="margin:0;color:#645565;font-size:12px;line-height:1.5;">${copy("Chọn HSK, độ dài và ngôn ngữ trả lời. Bạn vẫn có thể gõ bất kỳ yêu cầu học nào.", "Choose HSK, length and reply language. You can still type any learning request.", "选择 HSK、篇幅和回复语言；你也可以输入任何学习要求。")}</p><label style="display:block;margin-top:12px;font-size:11px;font-weight:800;color:#75214c;">${copy("Cấp độ", "Level", "等级")}</label><select id="aiTutorLevel" style="width:100%;margin-top:5px;padding:8px;border:1px solid #efb6ce;border-radius:9px;background:#fff;color:#2d2430;"><option value="0">${copy("Tất cả HSK 1–6", "All HSK 1–6", "全部 HSK 1–6")}</option>${[1,2,3,4,5,6].map((n) => `<option value="${n}" ${Number(aiTutorState.level)===n?"selected":""}>HSK ${n}</option>`).join("")}</select><label style="display:block;margin-top:10px;font-size:11px;font-weight:800;color:#75214c;">${copy("Độ dài đoạn", "Text length", "篇幅")}</label><select id="aiTutorLength" style="width:100%;margin-top:5px;padding:8px;border:1px solid #efb6ce;border-radius:9px;background:#fff;color:#2d2430;"><option value="adaptive" ${aiTutorState.length==="adaptive"?"selected":""}>${copy("Theo cấp độ", "By level", "按等级")}</option><option value="short" ${aiTutorState.length==="short"?"selected":""}>${copy("Ngắn", "Short", "短篇")}</option><option value="medium" ${aiTutorState.length==="medium"?"selected":""}>${copy("Vừa", "Medium", "中篇")}</option><option value="long" ${aiTutorState.length==="long"?"selected":""}>${copy("Dài", "Long", "长篇")}</option></select><label style="display:block;margin-top:10px;font-size:11px;font-weight:800;color:#75214c;">${copy("Ngôn ngữ phản hồi", "Reply language", "回复语言")}</label><select id="aiTutorLanguage" style="width:100%;margin-top:5px;padding:8px;border:1px solid #efb6ce;border-radius:9px;background:#fff;color:#2d2430;"><option value="auto" ${aiTutorState.language==="auto"?"selected":""}>${copy("Tự nhận diện", "Auto-detect", "自动识别")}</option><option value="zh" ${aiTutorState.language==="zh"?"selected":""}>中文</option><option value="vi" ${aiTutorState.language==="vi"?"selected":""}>Tiếng Việt</option><option value="en" ${aiTutorState.language==="en"?"selected":""}>English</option></select><div style="margin-top:12px;padding:9px;border-radius:10px;background:#fff0f6;color:#5d3347;font-size:11px;line-height:1.5;">${copy("Offline: thư viện chủ đề có sẵn. Cloud AI: hội thoại mở sau khi Function được deploy.", "Offline: curated topic library. Cloud AI: open conversation after the Function is deployed.", "离线：使用主题库。Cloud AI：部署 Function 后可进行开放对话。")}</div></aside><main style="min-width:0;"><div data-ai-tutor-topic-grid style="padding:12px;border:1px solid #f2bfd8;border-radius:16px;background:#fff9fc;"><b style="color:#75214c;">${copy("Chọn chủ đề", "Choose a topic", "选择主题")}</b><div style="font-size:11.5px;color:#5b4964;margin-top:3px;">${copy("Mỗi chủ đề có đoạn tiếng Trung, pinyin, nghĩa, từ mục tiêu, ngữ pháp và hội thoại.", "Every topic includes Chinese text, pinyin, meaning, target vocabulary, grammar and dialogue.", "每个主题含中文短文、拼音、释义、重点词汇、语法和对话。")}</div>${tutorTopicGroups()}</div><div id="aiTutorMessages" style="margin-top:12px;min-height:260px;max-height:420px;overflow:auto;padding:12px;border:1px solid #f2bfd8;border-radius:16px;background:#fff;display:flex;flex-direction:column;gap:7px;"></div><div style="display:flex;gap:8px;margin-top:10px;"><input id="aiTutorInput" type="text" placeholder="${escapeHtml(copy("Nhập bằng 中文, Tiếng Việt hoặc English...", "Type in 中文, Vietnamese, or English...", "可用中文、Tiếng Việt 或 English 输入…"))}" style="flex:1;min-width:0;padding:10px 12px;border:1px solid #efb6ce;border-radius:10px;color:#211d22;background:#fff;font-family:inherit;"><button id="aiTutorSend" type="button" style="border:0;border-radius:10px;padding:10px 14px;background:#e5488d;color:#fff;font-weight:900;cursor:pointer;">${copy("Gửi", "Send", "发送")}</button></div></main></section>`;
    const readingMount = document.createElement("div");
    readingMount.id = "aiTutorReadingMount";
    mount.querySelector("#aiTutorMessages")?.before(readingMount);
    const studyMount = document.createElement("div");
    studyMount.id = "aiTutorStudyMount";
    mount.querySelector("#aiTutorMessages")?.before(studyMount);
    const refresh = () => renderAiTutorWorkspace();
    mount.querySelector("#aiTutorLevel").addEventListener("change", (event) => { aiTutorState.level = Number(event.target.value); refresh(); });
    mount.querySelector("#aiTutorLength").addEventListener("change", (event) => { aiTutorState.length = event.target.value; refresh(); });
    mount.querySelector("#aiTutorLanguage").addEventListener("change", (event) => { aiTutorState.language = event.target.value; refresh(); });
    mount.querySelectorAll("[data-ai-tutor-topic]").forEach((button) => button.addEventListener("click", () => {
      const topic = (window.PandaHanHskLibrary?.items || []).find((item) => item.id === button.dataset.aiTutorTopic);
      if (!topic) return;
      aiTutorState.selectedTopicId = topic.id;
      aiTutorState.selectedVocabChar = "";
      aiTutorState.reviewFeedback = "";
      aiTutorState.selectedInlineTerm = "";
      aiTutorState.inlineFeedback = "";
      renderTutorInlineReading(readingMount);
      renderTutorStudyTools(studyMount);
      const prompt = tutorResponseLanguage("") === "zh" ? `请给我 HSK ${topic.level} 主题：${topic.topicEn}` : tutorResponseLanguage("") === "en" ? `HSK ${topic.level} topic: ${topic.topicEn}` : `Chủ đề HSK ${topic.level}: ${topic.topicVi}`;
      sendAiTutorMessage(prompt, topic);
    }));
    const input = mount.querySelector("#aiTutorInput");
    const send = () => { const value = String(input.value || "").trim(); if (!value) return; input.value = ""; sendAiTutorMessage(value); };
    mount.querySelector("#aiTutorSend").addEventListener("click", send);
    input.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } });
    renderAiTutorHistory(mount.querySelector("#aiTutorMessages"));
    renderTutorInlineReading(readingMount);
    renderTutorStudyTools(studyMount);
  }
  window.openAiTutorWorkspace = renderAiTutorWorkspace;
  function renderAiCoachMessage(text, role, persist = true) {
    const area = document.getElementById("chatMessagesArea");
    const box = conversationBox(area);
    if (!box) return;
    const row = document.createElement("div");
    row.className = "chat-msg-row " + (role === "user" ? "me" : "them");
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble2";
    bubble.innerHTML = escapeHtml(String(text || "")).replace(/\n/g, "<br>");
    row.appendChild(bubble);
    box.appendChild(row);
    if (persist && String(text || "").trim()) {
      const history = loadAiConversation();
      history.push({ role: role === "user" ? "user" : "bot", text: String(text).slice(0, 2000), createdAt: Date.now() });
      saveAiConversation(history);
    }
    area.scrollTop = area.scrollHeight;
  }

  function aiCoachTimelineKey() {
    let ns = "guest";
    try { ns = typeof window.storageNamespace === "function" ? String(window.storageNamespace() || "guest") : String(window.CURRENT_USER?.uid || window.CURRENT_USER?.username || "guest"); } catch (_) {}
    return "pandahan_ai_coach_timeline_" + ns.replace(/[^a-zA-Z0-9_-]/g, "_");
  }
  function loadAiCoachTimeline() {
    try {
      const value = JSON.parse(localStorage.getItem(aiCoachTimelineKey()) || "[]");
      return Array.isArray(value) ? value.filter((entry) => entry?.type === "daily_plan" || entry?.verified === true) : [];
    } catch (_) { return []; }
  }
  function saveAiCoachTimeline(items) {
    try { localStorage.setItem(aiCoachTimelineKey(), JSON.stringify(items.slice(0, 80))); } catch (_) {}
  }
  function aiCoachTimelineItem(detail, type = "evaluation") {
    const d = detail || {};
    const day = Number(d.dayNumber || d.day_number || 0);
    if (!day) return null;
    const taskId = String(d.taskId || d.task_id || "");
    const score = Number.isFinite(Number(d.scorePercent)) ? Number(d.scorePercent) : (Number.isFinite(Number(d.score)) ? Number(d.score) : null);
    const date = String(d.date || d.evaluatedAt || new Date().toISOString());
    const id = String(d.id || `${type}_${day}_${taskId}_${score == null ? "na" : score}_${date.slice(0, 10)}`);
    const sequenceIndex = Number(d.sequenceIndex || d.sequence_index || day);
    const isRepeat = !!d.isRepeat || !!d.is_repeat || !!d.is_repeat_of;
    return { id, type, verified: d.verified === true, dayNumber: day, sequenceIndex, isRepeat, carriedCompletedTasks: Array.isArray(d.carriedCompletedTasks) ? d.carriedCompletedTasks.slice(0, 10) : (Array.isArray(d.carried_task_ids) ? d.carried_task_ids.slice(0, 10) : []), taskId, scorePercent: score, threshold: Number.isFinite(Number(d.threshold)) ? Number(d.threshold) : null, passed: typeof d.passed === "boolean" ? d.passed : null, action: String(d.action || ""), missingTaskIds: Array.isArray(d.missingTaskIds) ? d.missingTaskIds.slice(0, 10) : (Array.isArray(d.missing_task_ids) ? d.missing_task_ids.slice(0, 10) : []), requiredTaskIds: Array.isArray(d.requiredTaskIds) ? d.requiredTaskIds.slice(0, 10) : (Array.isArray(d.required_task_ids) ? d.required_task_ids.slice(0, 10) : []), topic: String(d.topic || ""), date, source: String(d.source || type), rawSource: String(d.rawSource || ""), evidenceType: String(d.evidenceType || ""), attempts: Number.isFinite(Number(d.attempts)) ? Number(d.attempts) : null, correct: Number.isFinite(Number(d.correct)) ? Number(d.correct) : null, total: Number.isFinite(Number(d.total)) ? Number(d.total) : null, durationSeconds: Number.isFinite(Number(d.durationSeconds)) ? Number(d.durationSeconds) : null, components: d.components && typeof d.components === "object" ? d.components : null, details: Array.isArray(d.details) ? d.details.slice(0, 6) : [], createdAt: Number(d.evaluatedAt || Date.now()) };
  }
  function recordAiCoachTimeline(detail, type = "evaluation") {
    if (type !== "daily_plan" && detail?.verified !== true) return;
    const item = aiCoachTimelineItem(detail, type);
    if (!item) return;
    const items = [item, ...loadAiCoachTimeline().filter((entry) => entry.id !== item.id)].sort((a, b) => b.createdAt - a.createdAt).slice(0, 80);
    saveAiCoachTimeline(items);
    const area = document.getElementById("chatMessagesArea");
    if (activeChatUserId === "__pandahan_ai__" && area) renderAiCoachTimeline(area);
  }
  function aiCoachTaskLabel(taskId) {
    return ({ quest: "Pinyin Quest", vocabulary: "Từ vựng", sentence_unscramble: "Sắp xếp câu", tone_practice: "Luyện thanh điệu", advanced_reading: "Đọc nâng cao", practice: "Bài luyện", listening: "Nghe", speaking: "Nói / phát âm", reading_writing: "Đọc / Viết", srs: "SRS" })[taskId] || taskId || "nhiệm vụ";
  }
  function renderAiCoachTimeline(area) {
    if (!area) return;
    area.querySelector("[data-ai-coach-timeline]")?.remove();
    const allTimelineItems = loadAiCoachTimeline();
    const items = allTimelineItems.filter((item) => item.verified === true);
    const latestPlan = allTimelineItems.find((item) => item.type === "daily_plan");
    const section = document.createElement("section");
    section.setAttribute("data-ai-coach-timeline", "true");
    section.style.cssText = "margin-top:12px;padding:10px 11px;border:1px solid #e9d5ff;border-radius:12px;background:#faf5ff;";
    const title = window.LANG_MODE === "en" ? "Review timeline from your real activity" : "Lịch sử review từ hoạt động thực tế";
    const planNote = latestPlan ? `<div style="font-size:11.5px;color:#64748b;margin-top:5px;padding-bottom:6px;border-bottom:1px dashed #ddd6fe;">${window.LANG_MODE === "en" ? "Today's plan has been assigned. It is not a learning score until real activity is recorded." : "Kế hoạch hôm nay đã được giao. Đây chưa phải điểm đánh giá cho đến khi có hoạt động học thật."}</div>` : "";
    if (!items.length) {
      section.innerHTML = `<b>${title}</b>${planNote}<div style="font-size:11.5px;color:#64748b;margin-top:5px;">${window.LANG_MODE === "en" ? "Only verified activity data will appear here; no self-confirmation is used." : "Chỉ dữ liệu hoạt động đã xác minh mới xuất hiện ở đây; không dùng xác nhận tự khai."}</div>`;
    } else {
      const rows = items.slice(0, 12).map((item) => {
        const score = item.scorePercent == null ? (window.LANG_MODE === "en" ? "score pending" : "chưa có điểm tổng") : `${item.scorePercent}%${item.threshold != null ? ` / ${item.threshold}%` : ""}`;
        const outcome = item.passed === true ? (window.LANG_MODE === "en" ? "passed" : "đạt") : item.action === "incomplete_day_requirements" ? (window.LANG_MODE === "en" ? "requirements incomplete" : "chưa đủ nhiệm vụ") : item.passed === false ? (window.LANG_MODE === "en" ? "review required" : "cần ôn lại") : (window.LANG_MODE === "en" ? "recorded" : "đã ghi nhận");
        const missing = item.missingTaskIds.length ? ` · ${window.LANG_MODE === "en" ? "still needed" : "còn thiếu"}: ${item.missingTaskIds.map(aiCoachTaskLabel).join(", ")}` : "";
        const source = item.source === "pinyin-tone-quest" || item.source === "quest" ? "Pinyin Quest" : item.source === "phonetics-pronunciation" || item.source === "phonetics-listening" || item.source === "phonetics" ? "Ngữ âm" : item.source === "practice" ? "Từ vựng/Practice" : item.source === "task" ? "Verified task" : "AI Coach";
        const metrics = [item.attempts != null ? `${item.attempts} lần` : "", item.correct != null && item.total != null ? `${item.correct}/${item.total} đúng` : "", item.durationSeconds != null ? `${Math.round(item.durationSeconds)}s` : ""].filter(Boolean).join(" · ");
        const sessionLabel = item.isRepeat ? (window.LANG_MODE === "en" ? `Session ${item.sequenceIndex} — continue Day ${item.dayNumber}` : `Buổi ${item.sequenceIndex} — tiếp tục Ngày ${item.dayNumber}`) : (window.LANG_MODE === "en" ? `Day ${item.dayNumber}` : `Ngày ${item.dayNumber}`);
        const carried = item.carriedCompletedTasks.length ? ` · ${window.LANG_MODE === "en" ? "carried" : "đã giữ"}: ${item.carriedCompletedTasks.map(aiCoachTaskLabel).join(", ")}` : "";
        return `<div style="padding:7px 0;border-top:1px solid #ede9fe;font-size:11.5px;line-height:1.45;"><b>${sessionLabel}</b> · ${source}${item.taskId ? ` · ${aiCoachTaskLabel(item.taskId)}` : ""}<br><span>${score} · ${outcome}${missing}${carried}${metrics ? ` · ${metrics}` : ""}</span></div>`;
      }).join("");
      section.innerHTML = `<b>${title}</b>${planNote}${rows}`;
    }
    area.appendChild(section);
    area.scrollTop = area.scrollHeight;
  }

  function openAiCoachChat() {
    window.switchTab?.("ai");
    setTimeout(() => window.openAiTutorWorkspace?.(), 0);
  }

  window.openAiCoachChat = openAiCoachChat;
  window.PandaHanAiCoach = { recordTimeline: recordAiCoachTimeline, renderTimeline: renderAiCoachTimeline, getTimeline: loadAiCoachTimeline };
  window.addEventListener("pandahan-learning-evaluation", (event) => {
    if (event.detail?.verified !== true) return;
    recordAiCoachTimeline(event.detail || {}, "evaluation");
  });
  window.addEventListener("pandahan-daily-plan", (event) => recordAiCoachTimeline(event.detail || {}, "daily_plan"));
  window.addEventListener("pandahan-vocabulary-lesson-completed", (event) => {
    const detail = event.detail || {};
    if (detail.verified !== true) return;
    recordAiCoachTimeline({ ...detail, source: "vocabulary", taskId: "vocabulary", action: "vocabulary_exposure_completed", passed: null, scorePercent: null, evaluatedAt: detail.completedAt || Date.now() }, "evaluation");
  });

  function getAiChatEndpoint() {
    if (window.PANDAHAN_AI_ENDPOINT) return String(window.PANDAHAN_AI_ENDPOINT);
    try {
      const projectId = window.firebase?.app?.()?.options?.projectId;
      return projectId ? `https://asia-southeast1-${projectId}.cloudfunctions.net/aiChat` : "";
    } catch (_) { return ""; }
  }
  function buildAiLearnerContext() {
    const mission = window.PandaHanMission?.getCurrent?.() || {};
    const schedule = window.PandaHanSchedule?.getSchedule?.() || {};
    const currentDay = Array.isArray(schedule.days) ? schedule.days.find((d) => d.status === "unlocked") : null;
    const timeline = window.PandaHanAiCoach?.getTimeline?.() || [];
    const mistakes = window.PandaHanMistakes?.getQueue?.() || [];
    return {
      dayNumber: Number(mission.dayNumber || currentDay?.day_number || 0),
      topic: String(mission.topic || currentDay?.topic || ""),
      requiredScore: Number(mission.requiredScore || 30),
      tasks: Array.isArray(mission.tasks) ? mission.tasks.slice(0, 12).map((t) => ({ id: t.id, title: t.titleVi || t.titleEn, status: t.status || "assigned" })) : [],
      chain: mission.chain ? { lessonId: mission.chain.lessonId, vocabularyIds: mission.chain.vocabularyIds, vocabularyChars: mission.chain.vocabularyChars, phoneticFocus: mission.chain.phoneticFocus } : null,
      currentScheduleDay: currentDay ? { dayNumber: currentDay.day_number, sequenceIndex: currentDay.sequence_index, isRepeat: !!currentDay.is_repeat_of || currentDay.day_type === "repeat", repeatReason: currentDay.repeat_reason || null, carriedCompletedTasks: currentDay.carried_completed_tasks || [], requiredTasks: currentDay.required_tasks || [], status: currentDay.status, score: currentDay.last_score || null, scoreHistoryBest: currentDay.best_score || null, completedTasks: currentDay.completed_tasks || {}, missingTasks: (currentDay.required_tasks || []).filter((id) => !currentDay.completed_tasks?.[id]) } : null,
      verifiedTimeline: timeline.filter((x) => x.verified === true).slice(0, 12),
      unresolvedMistakeCount: mistakes.length,
      scheduleRule: "Sequential curriculum: free practice never unlocks a day; incomplete work continues in the next repeat session.",
    };
  }
  async function requestRealAiCoach(text, preferredLanguage = "auto") {
    const endpoint = getAiChatEndpoint();
    const currentUser = window.firebase?.auth?.()?.currentUser;
    if (!endpoint || !currentUser) throw new Error("AI backend is not configured or user is not signed in");
    const token = await currentUser.getIdToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ message: String(text).slice(0, 2000), history: loadAiConversation().slice(-12), learner: buildAiLearnerContext(), lang: window.PandaHanMission?.detectResponseLanguage?.(text, preferredLanguage) || window.LANG_MODE || "vi" }),
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.reply) throw new Error(payload.error || `AI_HTTP_${response.status}`);
      return String(payload.reply).trim();
    } finally { clearTimeout(timer); }
  }
  async function sendAiCoachMessage(text) {
    const area = document.getElementById("chatMessagesArea");
    if (!area || !String(text || "").trim()) return;
    const clean = String(text).trim().slice(0, 2000);
    renderAiCoachMessage(clean, "user");
    let reply = "";
    try {
      reply = await requestRealAiCoach(clean, window.PandaHanMission?.detectResponseLanguage?.(clean) || "auto");
    } catch (error) {
      console.info("AI backend unavailable; using deterministic learning fallback:", error.message || error);
      reply = window.PandaHanMission?.replyTo ? window.PandaHanMission.replyTo(clean) : ((window.LANG_MODE === "en") ? "Today's learning plan is still loading. Please try again shortly." : "Kế hoạch hôm nay đang được tải. Hãy thử lại sau một chút.");
    }
    renderAiCoachMessage(reply || ((window.PandaHanMission?.detectResponseLanguage?.(clean) || window.LANG_MODE) === "en" ? "I could not create a reply yet. Please try again." : "Mình chưa tạo được phản hồi. Bạn thử gửi lại câu hỏi nhé."), "bot");
  }

  window.addEventListener("pandahan-language-changed", () => {
    const tutorView = document.getElementById("aiTeacherView");
    if (tutorView && tutorView.style.display !== "none") window.openAiTutorWorkspace?.();
  });

  function getChatId(uid1, uid2) {
    return [uid1, uid2].sort().join("_");
  }

  // ── File attachments — uploaded via Google Drive using ONE Google account
  // as the intermediary/host (a free Google Apps Script "Web App" endpoint
  // saves the file into a Drive folder and returns a public view link). This
  // avoids needing Firebase Storage / the Blaze billing plan entirely.
  //
  // SETUP REQUIRED — paste the values from your deployed Apps Script here:
  const DRIVE_UPLOAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbx8iP5WJZvlTECyXWXXetmsqHZammb0uO2zCQOT-RLWHLKKh6BaASox_nqrwdRhfxAN/exec";
  const DRIVE_UPLOAD_API_KEY = "Nhanpham191123";

  // Shared helper: proxies AI requests through the same Apps Script endpoint
  // (which holds the real Anthropic key server-side in ANTHROPIC_API_KEY).
  // Calling api.anthropic.com directly from the browser never works outside
  // Claude.ai's own artifact sandbox — no key, and the API blocks browser
  // CORS requests anyway.
  async function callClaudeAI(prompt){
    // Offline-safe adapter. It deliberately returns a structured unavailable
    // response for dictionary-generation prompts instead of throwing a
    // ReferenceError or exposing an API key in the static client.
    if (/JSON|mục từ điển|câu ví dụ/i.test(String(prompt || ""))) return JSON.stringify({ error: "offline_unavailable" });
    return "AI Chat Box bản tối ưu đang chạy ở chế độ nội bộ; hãy chọn chủ đề HSK để luyện hội thoại mẫu.";
  }
  window.callClaudeAI = callClaudeAI;

  const CHAT_FILE_MAX_MB = 15;
  const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;

  function clearPendingChatFile() {
    pendingChatFile = null;
    const input = document.getElementById("chatFileInput");
    if (input) input.value = "";
    const preview = document.getElementById("chatFilePreview");
    if (preview) { preview.style.display = "none"; preview.innerHTML = ""; }
  }

  function showPendingChatFilePreview() {
    const preview = document.getElementById("chatFilePreview");
    if (!preview || !pendingChatFile) return;
    preview.style.display = "flex";
    preview.innerHTML = '<span>📎 ' + escapeHtml(pendingChatFile.name) + '</span>' +
      '<button type="button" id="chatFileRemoveBtn" style="background:none;border:none;color:var(--pink);font-weight:800;cursor:pointer;font-size:13px;">✕</button>';
    const rm = document.getElementById("chatFileRemoveBtn");
    if (rm) rm.onclick = clearPendingChatFile;
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // dataURL looks like "data:<mime>;base64,<data>" — strip the prefix.
        const commaIdx = reader.result.indexOf(",");
        resolve(reader.result.slice(commaIdx + 1));
      };
      reader.onerror = () => reject(reader.error || new Error("Không đọc được file."));
      reader.readAsDataURL(file);
    });
  }

  async function uploadChatFile(){throw new Error("Tải tệp cloud đã tắt trong bản tối ưu host.");}

  function renderMessageBubble(m, isMe) {
    const en = window.LANG_MODE === "en";
    const messageText = window.LANG_MODE === "en" ? (m.text_en || m.text || m.text_vi || "") : (m.text_vi || m.text || m.text_en || "");
    const isBroadcast = !!m.isBroadcast;
    const row = document.createElement("div");
    row.className = "chat-msg-row " + (isMe ? "me" : "them") + (isBroadcast ? " broadcast" : "");
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble2";
    const timeStr = m.createdAt && m.createdAt.toDate ? m.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : (en ? "Just now" : "Vừa xong");

    let inner = "";
    if (isBroadcast) inner += `<div style="font-size:9.5px;font-weight:800;opacity:0.8;margin-bottom:3px;">📢 ${en ? "Broadcast" : "Thông báo chung"}</div>`;
    if (m.fileUrl) {
      if (m.isImage) {
        inner += '<a href="' + m.fileUrl + '" target="_blank" rel="noopener">' +
          '<img class="chat-img" src="' + m.fileUrl + '" alt="' + escapeHtml(m.fileName || "") + '" ' +
          'onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'chat-file-card\',innerHTML:\'🖼️ <span>' + escapeHtml(m.fileName || (en ? "Image" : "Hình ảnh")) + ' (' + (en ? "image unavailable; click to open" : "không tải được ảnh, bấm để mở") + ')</span>\'}))" /></a>';
      } else {
        inner += '<a href="' + m.fileUrl + '" target="_blank" rel="noopener" class="chat-file-card">📄 <span style="word-break:break-all;">' + escapeHtml(m.fileName || (en ? "Attachment" : "Tệp đính kèm")) + '</span></a>';
      }
      if (m.driveDownloadUrl) {
        inner += `<br><a href="${m.driveDownloadUrl}" target="_blank" rel="noopener" class="chat-dl-link">⬇ ${en ? "Download" : "Tải xuống"}</a>`;
      }
      if (messageText) inner += '<div style="margin-top:4px;">' + escapeHtml(messageText) + '</div>';
    } else if (messageText) {
      inner += '<div>' + escapeHtml(messageText) + '</div>';
    }
    inner += '<div class="chat-msg-time">' + timeStr + '</div>';
    bubble.innerHTML = inner;
    row.appendChild(bubble);
    return row;
  }

  async function openChatWith(otherUid, otherName) {
    if (!CURRENT_USER) return;
    activeChatUserId = otherUid;
    const myUid = CURRENT_USER.uid || CURRENT_USER.username;
    activeChatId = getChatId(myUid, otherUid);
    
    const titleEl = document.getElementById("activeChatTitle");
    if (titleEl) titleEl.textContent = (window.LANG_MODE === "en" ? "Chatting with: " : "Đang chat với: ") + otherName;

    clearPendingChatFile();

    if (chatUnsubscribe) chatUnsubscribe();

    const msgArea = document.getElementById("chatMessagesArea");
    if (msgArea) msgArea.innerHTML = `<div style="text-align:center;color:var(--text-light);font-size:12px;">${window.LANG_MODE === "en" ? "Loading messages..." : "Đang tải tin nhắn..."}</div>`;

    try {
      const chatRef = db.collection("chats").doc(activeChatId);
      const chatDoc = await chatRef.get();
      if (!chatDoc.exists) {
        await chatRef.set({
          participants: [myUid, otherUid],
          updatedAt: Date.now()
        });
      }

      chatUnsubscribe = chatRef.collection("messages").orderBy("createdAt", "asc").onSnapshot(snapshot => {
        msgArea.innerHTML = "";
        if (snapshot.empty) {
          msgArea.innerHTML = `<div style="text-align:center;color:var(--text-light);font-size:12px;margin-top:20px;">${window.LANG_MODE === "en" ? "No messages yet. Send a greeting!" : "Chưa có tin nhắn nào. Hãy gửi lời chào!"}</div>`;
          return;
        }
        snapshot.forEach(doc => {
          const m = doc.data();
          const isMe = m.senderId === myUid;
          msgArea.appendChild(renderMessageBubble(m, isMe));
        });
        msgArea.scrollTop = msgArea.scrollHeight;
      });
    } catch(e) {
      console.error("Chat error:", e);
      if (msgArea) msgArea.innerHTML = `<div style="color:red;font-size:12px;text-align:center;">${window.LANG_MODE === "en" ? "Unable to load messages (check Firestore Rules)." : "Lỗi tải tin nhắn (Kiểm tra Firestore Rules)."}</div>`;
    }
  }

  // ── "Gửi thông báo cho tất cả học viên" — writes straight into each
  // student's real 1-1 chat with the teacher (tagged isBroadcast:true), so it
  // shows up right inside their normal conversation, not a separate screen. ──
  function openBroadcastComposer() {
    if (!isTeacherRole()) return;
    const overlay = document.createElement("div");
    overlay.id = "broadcastComposerOverlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;";
    overlay.innerHTML = `
      <div style="background:#fff;color:#2d2a3a;border-radius:16px;padding:20px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <h3 style="font-size:16px;font-weight:800;color:var(--pink);margin-bottom:4px;">📢 Gửi thông báo cho tất cả học viên</h3>
        <p style="font-size:11.5px;color:#6b6478;margin-bottom:12px;">Tin nhắn sẽ tự động xuất hiện trong khung chat riêng giữa bạn và từng học viên.</p>
        <textarea id="broadcastText" rows="4" placeholder="Nhập nội dung thông báo..." style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid #e0dce8;outline:none;font-family:inherit;font-size:13px;resize:vertical;margin-bottom:10px;color:#2d2a3a;background:#fff;"></textarea>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
          <input type="file" id="broadcastFileInput" style="display:none;" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt" />
          <button type="button" id="broadcastAttachBtn" style="background:#f7f5fa;color:#2d2a3a;border:1.5px solid #e0dce8;border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer;">📎 Đính kèm file</button>
          <span id="broadcastFileName" style="font-size:11px;color:#6b6478;"></span>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" id="broadcastCancelBtn" class="btn btn-outline" style="padding:8px 16px;font-size:12.5px;">Hủy</button>
          <button type="button" id="broadcastSendBtn" class="btn btn-pink" style="padding:8px 16px;font-size:12.5px;">Gửi cho tất cả</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    let broadcastFile = null;
    const fileInput = document.getElementById("broadcastFileInput");
    document.getElementById("broadcastAttachBtn").onclick = () => fileInput.click();
    fileInput.onchange = () => {
      const f = fileInput.files && fileInput.files[0];
      if (f && f.size > CHAT_FILE_MAX_MB * 1024 * 1024) {
        alert(`File quá lớn (tối đa ${CHAT_FILE_MAX_MB}MB).`);
        fileInput.value = "";
        return;
      }
      broadcastFile = f || null;
      document.getElementById("broadcastFileName").textContent = f ? f.name : "";
    };

    const close = () => overlay.remove();
    document.getElementById("broadcastCancelBtn").onclick = close;
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    document.getElementById("broadcastSendBtn").onclick = async () => {
      const text = document.getElementById("broadcastText").value.trim();
      if (!text && !broadcastFile) { alert("Vui lòng nhập nội dung hoặc đính kèm file."); return; }
      const sendBtn = document.getElementById("broadcastSendBtn");
      sendBtn.disabled = true;
      sendBtn.textContent = "Đang gửi...";
      try {
        let fileMeta = null;
        if (broadcastFile) fileMeta = await uploadChatFile(broadcastFile, "chat_files/broadcast");
        await sendBroadcastToAllStudents(text, fileMeta);
        close();
      } catch (e) {
        console.error("Broadcast send error:", e);
        alert("Không thể gửi thông báo: " + e.message);
        sendBtn.disabled = false;
        sendBtn.textContent = "Gửi cho tất cả";
      }
    };
  }

  async function sendBroadcastToAllStudents(text, fileMeta) {
    const myUid = CURRENT_USER.uid || CURRENT_USER.username;
    const all = await fetchAllUsers();
    const students = all.filter(u => u.role === "student" && (u.uid || u.username) !== myUid);
    if (!students.length) { alert("Chưa có học viên nào để gửi thông báo."); return; }

    let sent = 0;
    for (const st of students) {
      const otherUid = st.uid || st.username;
      const chatId = getChatId(myUid, otherUid);
      try {
        const chatRef = db.collection("chats").doc(chatId);
        const chatDoc = await chatRef.get();
        if (!chatDoc.exists) {
          await chatRef.set({ participants: [myUid, otherUid], updatedAt: Date.now() });
        }
        const msg = {
          senderId: myUid,
          senderName: CURRENT_USER.name || CURRENT_USER.username || "Giáo viên",
          text: text || "",
          isBroadcast: true,
          createdAt: Date.now()
        };
        if (fileMeta) Object.assign(msg, fileMeta);
        await chatRef.collection("messages").add(msg);
        await chatRef.set({
          lastMessage: (text || (fileMeta ? "📎 " + fileMeta.fileName : "")),
          lastSenderId: myUid,
          updatedAt: Date.now()
        }, {merge: true});
        triggerAutomaticEmailNotification(otherUid, "📢 Thông báo mới từ " + (CURRENT_USER.name || "Giáo viên"), text || "Giáo viên đã gửi một tệp đính kèm.");
        sent++;
      } catch (e) {
        console.error("Broadcast to " + otherUid + " failed:", e);
      }
    }
    alert(`Đã gửi thông báo cho ${sent}/${students.length} học viên.`);
    // Nếu đang mở đúng cuộc trò chuyện với một trong các học viên đó thì tin
    // nhắn mới sẽ tự cập nhật qua onSnapshot ở trên, không cần làm gì thêm.
  }

  document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.getElementById("chatSendMsgBtn");
    const msgInput = document.getElementById("chatMsgInput");
    const attachBtn = document.getElementById("chatAttachBtn");
    const fileInput = document.getElementById("chatFileInput");

    if (attachBtn && fileInput) {
      attachBtn.onclick = () => fileInput.click();
      fileInput.onchange = () => {
        const f = fileInput.files && fileInput.files[0];
        if (!f) return;
        if (f.size > CHAT_FILE_MAX_MB * 1024 * 1024) {
          alert(`File quá lớn (tối đa ${CHAT_FILE_MAX_MB}MB).`);
          fileInput.value = "";
          return;
        }
        pendingChatFile = f;
        showPendingChatFilePreview();
      };
    }

    if (sendBtn && msgInput) {
      const doSend = async () => {
        const text = msgInput.value.trim();
        if ((!text && !pendingChatFile)) return;
        if (activeChatUserId === "__pandahan_ai__") {
          if (!text || pendingChatFile) return;
          msgInput.value = "";
          sendBtn.disabled = true;
          try { await sendAiCoachMessage(text); } finally { sendBtn.disabled = false; }
          return;
        }
        if (!CURRENT_USER || !activeChatId) return;
        const myUid = CURRENT_USER.uid || CURRENT_USER.username;

        sendBtn.disabled = true;
        const fileToSend = pendingChatFile;
        if (fileToSend) sendBtn.textContent = "⏳";
        msgInput.value = "";
        clearPendingChatFile();

        try {
          let fileMeta = null;
          if (fileToSend) fileMeta = await uploadChatFile(fileToSend, "chat_files/" + activeChatId);

          const msg = {
            senderId: myUid,
            text: text,
            createdAt: Date.now()
          };
          if (fileMeta) Object.assign(msg, fileMeta);

          await db.collection("chats").doc(activeChatId).collection("messages").add(msg);
          await db.collection("chats").doc(activeChatId).set({
            lastMessage: text || (fileMeta ? "📎 " + fileMeta.fileName : ""),
            lastSenderId: myUid,
            updatedAt: Date.now()
          }, {merge: true});

          const notifBody = text || (fileMeta ? (fileMeta.isImage ? "Đã gửi một hình ảnh." : "Đã gửi một tệp đính kèm.") : "");
          triggerAutomaticEmailNotification(activeChatUserId, "Bạn có tin nhắn mới từ " + (CURRENT_USER.name || "Thành viên"), notifBody);
        } catch(e) {
          console.error("Send message error:", e);
          alert("Không thể gửi tin nhắn: " + e.message);
        } finally {
          sendBtn.disabled = false;
          sendBtn.textContent = "➤";
        }
      };
      sendBtn.onclick = doSend;
      msgInput.onkeydown = (e) => { if (e.key === "Enter") doSend(); };
    }
  });

  function triggerAutomaticEmailNotification(targetUserId, subject, bodyText) {
    console.log("[Auto Email Notification Triggered]", {targetUserId, subject, bodyText});
    try {
      db.collection("notifications").add({
        userId: targetUserId,
        subject: subject,
        body: bodyText,
        sent: false,
        type: "email_alert",
        createdAt: Date.now()
      });
    } catch(e) {
      console.error("Error triggering automatic email notification:", e);
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  const originalRenderTeacherDashboard = window.renderTeacherDashboard || function(){};
  window.renderTeacherDashboard = function() {
    if (typeof originalRenderTeacherDashboard === "function") originalRenderTeacherDashboard();
    initChatSystem();
  };
