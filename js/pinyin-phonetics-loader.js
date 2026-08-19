(function () {
  'use strict';

  const loaderScript = document.currentScript;
  const baseUrl = new URL('./', loaderScript.src);
  const API_BASE = "";
  window.__PINYIN_TEACHER_API_BASE__ = "";

  const PARTS = [
    'pinyin-phonetics.part-01.js',
    'pinyin-phonetics.part-02.js?v=audio-setting-20260819-v1',
    'pinyin-phonetics.part-03.js',
    'pinyin-phonetics.part-04.js',
    'pinyin-phonetics.part-05.js?v=overview-20260819'
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
      <div style="font-size:18px;margin-bottom:8px">Đang tải Ngữ âm Pinyin…</div>
      <div style="font-size:13px;margin-bottom:12px">Lần đầu cần tải dữ liệu âm thanh và flashcard.</div>
      <div style="height:8px;background:#fce7f3;border-radius:99px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#ec4899,#a855f7);transition:width .25s"></div>
      </div>
      <div style="font-size:12px;margin-top:8px">${done}/${PARTS.length} phần đã tải</div>
    </div>`;
  }

  function showError(error) {
    console.error('PandaHán Pinyin loader error:', error);
    const root = getRoot();
    if (!root) return;
    const isFetchError = error instanceof TypeError || /fetch|cors|network/i.test(String(error?.message || error));
    const detail = isFetchError
      ? 'AI Teacher cần backend cho phép CORS từ GitHub Pages. Vui lòng thử lại sau khi backend được cấu hình.'
      : 'Hãy kiểm tra mạng rồi nhấn Ctrl + F5 để thử lại.';
    root.innerHTML = `<div style="margin:20px auto;max-width:760px;padding:18px;color:#991b1b;background:#fee2e2;border:1px solid #fecaca;border-radius:14px;line-height:1.6">
      <strong>Không tải được module Ngữ âm.</strong><br>${detail}
    </div>`;
  }

  // Chỉ ẩn dòng dịch nghĩa trong các nút đáp án của Trắc nghiệm.
  // Không quét text node toàn bộ shadow root: flashcard Học phải giữ nghĩa tiếng Việt.
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

      // Trong đáp án quiz, Hán tự và Pinyin ở trên; dòng nghĩa là phần tử cuối.
      const meaning = children[children.length - 1];
      if (meaning && !/[一-鿿]/.test(meaning.textContent || '')) {
        meaning.style.display = 'none';
        meaning.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function installPinyinLayoutFix() {
    const host = getRoot();
    const shadow = host && host.shadowRoot;
    if (!shadow) return;

    if (!shadow.querySelector('style[data-pandahan-layout-fix]')) {
      const style = document.createElement('style');
      style.setAttribute('data-pandahan-layout-fix', 'true');
      style.textContent = `
        :host { display:block; width:100%; min-width:0; }
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
    const next = buttons.find((button) => (button.textContent || '').includes('Thẻ tiếp theo'));
    const previous = buttons.find((button) => (button.textContent || '').includes('Thẻ trước'));
    const nav = next && previous && next.parentElement === previous.parentElement ? next.parentElement : null;
    if (nav) nav.classList.add('pinyin-sticky-nav');
  }

  function installPinyinObservers() {
    const host=getRoot();
    if(!host||!host.shadowRoot||host.__pinyinUiObserver)return;
    const shadow=host.shadowRoot;
    let queued=false;
    const refresh=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;hideQuizAnswerMeanings();installPinyinLayoutFix();});};
    hideQuizAnswerMeanings();installPinyinLayoutFix();
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
      const responses = await Promise.all(
        PARTS.map((part) => fetch(new URL(part, baseUrl), { cache: 'force-cache' }))
      );
      for (const response of responses) {
        if (!response.ok) throw new Error(`Không tải được ${response.url} (${response.status})`);
      }

      let done = 0;
      const texts = await Promise.all(responses.map(async (response) => {
        const text = await response.text();
        showLoading(++done);
        return text;
      }));

      // Nối đúng thứ tự part-01 → part-05 rồi chạy bundle nguyên bản một lần.
      (0, eval)(texts.join(''));
      if (typeof window.__PANDAHAN_PHONETICS_MOUNT__ !== 'function') {
        throw new Error('Bundle thiếu hàm mount Pinyin.');
      }

      const mountRoot = getRoot();
      if (!mountRoot) throw new Error('Không tìm thấy vùng Ngữ âm.');
      window.__PANDAHAN_PHONETICS_ROOT__ = mountRoot;
      window.__PANDAHAN_PHONETICS_MOUNT__(mountRoot);window.dispatchEvent(new Event("pinyin-mounted"));
      mounted = true;

      setTimeout(installPinyinObservers, 0);
    })().catch((error) => {
      loadingPromise = null;
      mounted = false;
      showError(error);
      throw error;
    });

    return loadingPromise;
  };
})();
