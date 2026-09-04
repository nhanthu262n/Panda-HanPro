(function () {
  'use strict';

  const loaderScript = document.currentScript;
  const baseUrl = new URL('./', loaderScript.src);
  const API_BASE = "";
  window.__PINYIN_TEACHER_API_BASE__ = "";

  const PHONETICS_BUILD = "v44-stable-loader-20260904";
  const PARTS = [
    `pinyin-phonetics.part-01.js?v=${PHONETICS_BUILD}`,
    `pinyin-phonetics.part-02.js?v=${PHONETICS_BUILD}`,
    `pinyin-phonetics.part-03.js?v=${PHONETICS_BUILD}`,
    `pinyin-phonetics.part-04.js?v=${PHONETICS_BUILD}`,
    `pinyin-phonetics.part-05.js?v=${PHONETICS_BUILD}`
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
    const isFetchError = error instanceof TypeError || /fetch|cors|network/i.test(String(error?.message || error));
    const detail = isFetchError
      ? 'AI Tutor requires a backend that permits CORS from GitHub Pages. Retry after the backend is configured.'
      : 'Check your network connection, then press Ctrl + F5 to retry.';
    root.innerHTML = `<div style="margin:20px auto;max-width:760px;padding:18px;color:#991b1b;background:#fee2e2;border:1px solid #fecaca;border-radius:14px;line-height:1.6">
      <strong>Unable to load the Phonetics module.</strong><br>${detail}
    </div>`;
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
      const timeoutMs = 45000;
      const maxAttempts = 3;

      async function fetchPart(part, index) {
        const url = new URL(part, baseUrl).href;
        let cache = null;
        try { if (window.caches) cache = await caches.open(CACHE_NAME); } catch (_) {}

        // A versioned cache is safe: PHONETICS_BUILD changes whenever source changes.
        // Prefer it to avoid downloading ~93 MB again on every Phonics visit.
        if (cache) {
          try {
            const cached = await cache.match(url);
            if (cached) return await cached.text();
          } catch (_) {}
        }

        let lastError = null;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : 0;
          try {
            const response = await fetch(url, {
              cache: attempt === 1 ? 'default' : 'reload',
              signal: controller ? controller.signal : undefined
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const clone = response.clone();
            const text = await response.text();
            if (!text || text.length < 1000) throw new Error('Incomplete Phonetics part');
            if (cache) { try { await cache.put(url, clone); } catch (_) {} }
            return text;
          } catch (error) {
            lastError = error;
            // If the network failed but an older response for this exact version appeared
            // in cache meanwhile, use it instead of failing the whole module.
            if (cache) {
              try {
                const fallback = await cache.match(url);
                if (fallback) return await fallback.text();
              } catch (_) {}
            }
            if (attempt < maxAttempts) await new Promise(r => setTimeout(r, 700 * attempt));
          } finally {
            if (timer) clearTimeout(timer);
          }
        }
        throw new Error(`Unable to load Phonetics part ${index + 1}/${PARTS.length}: ${lastError?.message || lastError || 'network error'}`);
      }

      // Limit concurrency to 2 large files at a time. Five simultaneous 12–21 MB
      // downloads were causing intermittent failures on mobile/GitHub Pages.
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
      await Promise.all([worker(), worker()]);

      // Yield briefly before assembling/evaluating the large bundle to keep the UI responsive.
      await new Promise((resolve) => {
        const resume = () => resolve();
        if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(resume, { timeout: 120 });
        else window.setTimeout(resume, 0);
      });
      // Concatenate part-01 → part-05 in order; namespace recording history per learner.
      // Preserve the module UI/scoring while isolating learner-specific recording history.
      const owner = (() => { try { return typeof window.storageNamespace === "function" ? String(window.storageNamespace() || "guest") : String(window.CURRENT_USER?.uid || window.CURRENT_USER?.username || "guest"); } catch (_) { return "guest"; } })().replace(/[^a-zA-Z0-9_-]/g, "_");
      const recordingKey = `pinyin-recording-history_${owner}`;
      const namespacedBundle = texts.join("").replace(/pinyin-recording-history/g, recordingKey);
      (0, eval)(namespacedBundle);
      if (typeof window.__PANDAHAN_PHONETICS_MOUNT__ !== 'function') {
        throw new Error('The Phonetics bundle is missing its mount function.');
      }

      const mountRoot = getRoot();
      if (!mountRoot) throw new Error('Phonetics mount region not found.');
      window.__PANDAHAN_PHONETICS_ROOT__ = mountRoot;
      window.__PANDAHAN_PHONETICS_MOUNT__(mountRoot);window.dispatchEvent(new Event("pinyin-mounted"));
      mounted = true;

      setTimeout(() => { installPinyinObservers(); applyPinyinLanguageContent();  }, 0);
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
