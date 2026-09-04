(function () {
  'use strict';

  const loaderScript = document.currentScript;
  const baseUrl = new URL('./', loaderScript.src);
  const API_BASE = "";
  window.__PINYIN_TEACHER_API_BASE__ = "";

  const PHONETICS_BUILD = "v45-resilient-chunks-20260904";
  const PARTS = [
    { file: "phonetics-chunks-v45/phonetics-01.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-02.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-03.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-04.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-05.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-06.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-07.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-08.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-09.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-10.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-11.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-12.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-13.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-14.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-15.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-16.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-17.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-18.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-19.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-20.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-21.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-22.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-23.js", chars: 4000000 },
    { file: "phonetics-chunks-v45/phonetics-24.js", chars: 3864786 }
  ];

  let loadingPromise = null;
  let mounted = false;

  function getRoot() {
    return document.getElementById('pinyin-phonetics-root');
  }

  function showLoading(done) {
    const root = getRoot();
    if (!root) return;
    const pct = Math.round((done / PARTS.length) * 100);
    root.innerHTML = `<div style="padding:28px;text-align:center;color:#9ca3af;font-weight:700">
      <div style="font-size:18px;margin-bottom:8px">Loading Pinyin Phonetics…</div>
      <div style="font-size:13px;margin-bottom:12px">Audio and flashcard data load on first use.</div>
      <div style="height:8px;background:#fce7f3;border-radius:99px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#ec4899,#a855f7);transition:width .25s"></div>
      </div>
      <div style="font-size:12px;margin-top:8px">${done}/${PARTS.length} parts loaded</div>
    </div>`;
  }

  function showError(error) {
    console.error('PanTutor Phonetics loader error:', error);
    const root = getRoot();
    if (!root) return;
    const message = String(error?.message || error || 'Unknown loading error');
    root.innerHTML = `<div style="margin:20px auto;max-width:760px;padding:18px;color:#991b1b;background:#fee2e2;border:1px solid #fecaca;border-radius:14px;line-height:1.6">
      <strong>Unable to load the Phonetics module.</strong><br>
      <span style="font-size:13px">A Phonetics data chunk could not be loaded completely. This can happen on a slow or interrupted connection.</span>
      <details style="margin-top:8px;font-size:11px;color:#7f1d1d"><summary>Technical detail</summary><code>${message.replace(/</g,'&lt;')}</code></details>
      <button type="button" id="pinyinRetryLoadBtn" style="margin-top:12px;border:0;border-radius:10px;padding:9px 15px;background:#db2777;color:#fff;font-weight:800;cursor:pointer">Retry Phonetics</button>
    </div>`;
    root.querySelector('#pinyinRetryLoadBtn')?.addEventListener('click', () => {
      loadingPromise = null;
      mounted = false;
      window.loadPinyinPhonetics?.().catch(() => {});
    });
  }

  // Hide the gloss line inside quiz answer buttons.
  // Do not rewrite the entire shadow root; Phonetics now ships with direct English source content.
  function hideQuizAnswerMeanings() {
    const host = getRoot();
    const shadow = host && host.shadowRoot;
    if (!shadow) return;

    shadow.querySelectorAll('button').forEach((button) => {
      const children = [...button.children];
      if (children.length < 3) return;
      const texts = children.map((child) => (child.textContent || '').trim());
      const hasHan = texts.some((text) => /[一-鿿]/.test(text));
      const hasPinyin = texts.some((text) => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(text));
      if (!hasHan || !hasPinyin) return;

      // In đáp án quiz, Hán tự và Pinyin ở trên; dòng nghĩa to be phần tử cuối.
      const meaning = children[children.length - 1];
      if (meaning && !/[一-鿿]/.test(meaning.textContent || '')) {
        meaning.style.display = 'none';
        meaning.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function hideOverviewHistory() {
    const host = getRoot();
    const shadow = host && host.shadowRoot;
    if (!shadow) return;
    const hasHistory = (el) => {
      const text = (el.textContent || '').trim();
      return text.includes('Pronunciation history') && text.includes('Clear history');
    };
    const panel = [...shadow.querySelectorAll('section')].find(hasHistory)
      || [...shadow.querySelectorAll('div')].filter(hasHistory).sort((a, b) => (b.textContent || '').length - (a.textContent || '').length)[0];
    if (panel) {
      panel.style.display = 'none';
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('data-pandahan-overview-history-hidden', 'true');
    }
  }

  function applyPinyinLanguageContent() {
    const host = getRoot();
    const shadow = host && host.shadowRoot;
    if (!shadow) return;
    const intro = [...shadow.querySelectorAll('p')].find((el) => el.dataset.pandahanPinyinViHtml || (el.textContent || '').includes('In zhi/chi/shi/ri'));
    if (!intro) return;
    if (!intro.dataset.pandahanPinyinViHtml) intro.dataset.pandahanPinyinViHtml = intro.innerHTML;
    intro.innerHTML = 'For <b>zhi/chi/shi/ri</b>, <b>i</b> represents a posterior apical vowel, not the high front vowel /i/. In <b>zi/ci/si</b>, <b>i</b> represents an anterior apical vowel. Keep the retroflex and non-retroflex tongue configurations distinct.';
  }

  function installPinyinLayoutFix() {
    const host = getRoot();
    const shadow = host && host.shadowRoot;
    if (!shadow) return;

    if (!shadow.querySelector('style[data-pandahan-layout-fix]')) {
      const style = document.createElement('style');
      style.setAttribute('data-pandahan-layout-fix', 'true');
      style.textContent = `
        :host { display:block; width:100%; min-width:0; color:#374151; font-family:'Nunito','Segoe UI',system-ui,sans-serif; }
        :host > .animate-slide-up { width:100%; max-width:1100px !important; margin:0 auto !important; padding:clamp(18px,3vw,32px) !important; box-sizing:border-box; background:rgba(255,255,255,.94); border:1px solid rgba(236,72,153,.14); border-radius:24px; box-shadow:0 8px 30px rgba(157,23,77,.08); line-height:1.5; }
        :host h1 { font-size:clamp(22px,2.4vw,32px) !important; line-height:1.2 !important; margin-bottom:8px !important; }
        :host h2 { line-height:1.25 !important; }
        :host p { line-height:1.6 !important; }
        :host button { font-family:inherit; }
        [data-pandahan-overview-history-hidden="true"] { display:none !important; }
        :host > .animate-slide-up > div { box-sizing:border-box; }

        .pinyin-sticky-nav {
          position:sticky !important;
          bottom:12px;
          z-index:40;
          margin:12px auto 0 !important;
          padding:10px !important;
          max-width:1100px;
          border:1px solid rgba(236,72,153,.16);
          border-radius:20px;
          background:rgba(255,255,255,.92);
          box-shadow:0 8px 24px rgba(157,23,77,.12);
          backdrop-filter:blur(10px);
        }
        .pinyin-sticky-nav button { min-height:44px; }
        @media (max-width:640px) {
          .pinyin-sticky-nav { gap:8px !important; padding:8px !important; bottom:8px; }
          .pinyin-sticky-nav button { min-height:44px; font-size:12px !important; }
        }
      `;
      shadow.appendChild(style);
    }

    const buttons = [...shadow.querySelectorAll('button')];
    const next = buttons.find((button) => (button.textContent || '').includes('Next card'));
    const previous = buttons.find((button) => (button.textContent || '').includes('Previous card'));
    const nav = next && previous && next.parentElement === previous.parentElement ? next.parentElement : null;
    if (nav) nav.classList.add('pinyin-sticky-nav');
  }

  function installPinyinObservers() {
    const host=getRoot();
    if(!host||!host.shadowRoot||host.__pinyinUiObserver)return;
    const shadow=host.shadowRoot;
    let timer=0;
    const refresh=()=>{if(timer)return;timer=window.setTimeout(()=>{timer=0;hideQuizAnswerMeanings();hideOverviewHistory();installPinyinLayoutFix();applyPinyinLanguageContent();},120)};
    hideQuizAnswerMeanings();hideOverviewHistory();installPinyinLayoutFix();
    host.__pinyinUiObserver=new MutationObserver(refresh);
    host.__pinyinUiObserver.observe(shadow,{childList:true,subtree:true});
  }

  window.loadPinyinPhonetics = function () {
    const root = getRoot();
    if (mounted && root && root.shadowRoot && root.shadowRoot.firstElementChild) {
      installPinyinObservers();
      return Promise.resolve();
    }

    if (loadingPromise) return loadingPromise;
    showLoading(0);

    loadingPromise = (async function () {
      const CACHE_NAME = `pantutor-phonetics-${PHONETICS_BUILD}`;
      const timeoutMs = 120000;
      const maxAttempts = 4;

      async function openChunkCache() {
        try { return window.caches ? await caches.open(CACHE_NAME) : null; } catch (_) { return null; }
      }

      async function fetchPart(part, index) {
        const url = new URL(part.file + `?v=${PHONETICS_BUILD}`, baseUrl).href;
        const cache = await openChunkCache();

        if (cache) {
          try {
            const cached = await cache.match(url);
            if (cached) {
              const text = await cached.text();
              if (text.length === part.chars) return text;
              try { await cache.delete(url); } catch (_) {}
            }
          } catch (_) {}
        }

        let lastError = null;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : 0;
          try {
            const response = await fetch(url, {
              // URL is versioned, so normal browser caching cannot serve an old build.
              cache: attempt === 1 ? 'default' : 'reload',
              signal: controller ? controller.signal : undefined
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const text = await response.text();
            if (text.length !== part.chars) {
              throw new Error(`Incomplete chunk ${index + 1}: expected ${part.chars} chars, received ${text.length}`);
            }
            if (cache) {
              try {
                await cache.put(url, new Response(text, {headers:{'Content-Type':'application/javascript; charset=utf-8'}}));
              } catch (_) { /* Cache quota is optional; HTTP cache still works. */ }
            }
            return text;
          } catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
              const wait = 900 * attempt + Math.floor(Math.random() * 350);
              await new Promise(r => setTimeout(r, wait));
            }
          } finally {
            if (timer) clearTimeout(timer);
          }
        }
        throw new Error(`Chunk ${index + 1}/${PARTS.length} failed after ${maxAttempts} attempts: ${lastError?.message || lastError || 'network error'}`);
      }

      // Adaptive concurrency: slow/mobile connections download one 4 MB chunk at a time;
      // faster connections use two. This avoids the former 20-40 MB simultaneous transfers.
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const slow = !!(conn && (conn.saveData || /(^|-)2g|3g/i.test(String(conn.effectiveType || ''))));
      const workerCount = slow ? 1 : 2;
      const texts = new Array(PARTS.length);
      let cursor = 0;
      let done = 0;
      async function worker() {
        while (true) {
          const index = cursor++;
          if (index >= PARTS.length) return;
          texts[index] = await fetchPart(PARTS[index], index);
          showLoading(++done);
        }
      }
      await Promise.all(Array.from({length:workerCount}, () => worker()));

      await new Promise((resolve) => {
        const resume = () => resolve();
        if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(resume, { timeout: 250 });
        else window.setTimeout(resume, 0);
      });

      const owner = (() => { try { return typeof window.storageNamespace === "function" ? String(window.storageNamespace() || "guest") : String(window.CURRENT_USER?.uid || window.CURRENT_USER?.username || "guest"); } catch (_) { return "guest"; } })().replace(/[^a-zA-Z0-9_-]/g, "_");
      const recordingKey = `pinyin-recording-history_${owner}`;
      const namespacedBundle = texts.join("").replace(/pinyin-recording-history/g, recordingKey);
      (0, eval)(namespacedBundle);
      if (typeof window.__PANDAHAN_PHONETICS_MOUNT__ !== 'function') {
        throw new Error('The Phonetics bundle loaded but its mount function is missing.');
      }

      const mountRoot = getRoot();
      if (!mountRoot) throw new Error('Phonetics mount region not found.');
      window.__PANDAHAN_PHONETICS_ROOT__ = mountRoot;
      window.__PANDAHAN_PHONETICS_MOUNT__(mountRoot);
      window.dispatchEvent(new Event("pinyin-mounted"));
      mounted = true;
      setTimeout(() => { installPinyinObservers(); applyPinyinLanguageContent(); }, 0);
    })().catch((error) => {
      loadingPromise = null;
      mounted = false;
      showError(error);
      throw error;
    });

    return loadingPromise;
  };
  window.addEventListener("pandahan-language-changed", () => {
    const root = getRoot();
    if (root) { applyPinyinLanguageContent();  }
  });
})();
