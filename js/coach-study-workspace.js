/* Conversation is optional; lesson actions remain in the full-page workspace. */
(() => {
  'use strict';
  const panel=document.getElementById('coachChatPanel');
  const launcher=document.getElementById('coachChatLauncher');
  if(!panel||!launcher)return;
  let returnFocus=launcher;
  function close(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');returnFocus?.focus();}
  function open(){returnFocus=document.activeElement;panel.hidden=false;launcher.setAttribute('aria-expanded','true');document.getElementById('chatMsgInput')?.focus();}
  launcher.addEventListener('click',()=>panel.hidden?open():close());
  document.getElementById('coachChatClose').addEventListener('click',close);
  document.querySelectorAll('[data-coach-chat-open]').forEach(b=>b.addEventListener('click',open));
  document.querySelectorAll('[data-coach-section]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.coachSection)?.scrollIntoView({behavior:'smooth',block:'start'})));
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
  // Always start with the lesson page, even after returning from another section.
  new MutationObserver(()=>{if(document.getElementById('aiCoachView').style.display==='none'){panel.hidden=true;launcher.setAttribute('aria-expanded','false');}}).observe(document.getElementById('aiCoachView'),{attributes:true,attributeFilter:['style']});
})();
