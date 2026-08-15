(function () {
  'use strict';

  const loaderScript = document.currentScript;
  const baseUrl = new URL('./', loaderScript.src);
  const PARTS = [
    'pinyin-phonetics.part-01.js',
    'pinyin-phonetics.part-02.js',
    'pinyin-phonetics.part-03.js',
    'pinyin-phonetics.part-04.js',
    'pinyin-phonetics.part-05.js'
  ];

  let loadingPromise = null;
  let mounted = false;

  function root() {
    return document.getElementById('pinyin-phonetics-root');
  }

  function showLoading(done = 0) {
    const el = root();
    if (!el) return;
    const percent = Math.round(done / PARTS.length * 100);
    el.innerHTML = `
      <div style="padding:28px;text-align:center;color:#9ca3af;font-weight:700">
        <div style="font-size:18px;margin-bottom:8px">Đang tải Ngữ âm Pinyin…</div>
        <div style="font-size:13px;margin-bottom:12px">Lần đầu cần tải dữ liệu âm thanh và flashcard.</div>
        <div style="height:8px;background:#fce7f3;border-radius:99px;overflow:hidden">
          <div style="width:${percent}%;height:100%;background:linear-gradient(90deg,#ec4899,#a855f7);transition:width .25s"></div>
        </div>
        <div style="font-size:12px;margin-top:8px">${done}/${PARTS.length} phần đã tải</div>
      </div>`;
  }

  function showError(error) {
    console.error('PandaHán Pinyin loader error:', error);
    const el = root();
    if (!el) return;
    el.innerHTML = `
      <div style="padding:16px;color:#b91c1c;background:#fee2e2;border-radius:10px">
        Không tải được module Ngữ âm. Hãy kiểm tra mạng rồi nhấn Ctrl + F5 để thử lại.
      </div>`;
  }

  window.loadPinyinPhonetics = function () {
    if (mounted && typeof window.__PANDAHAN_PHONETICS_MOUNT__ === 'function') {
      return Promise.resolve();
    }
    if (loadingPromise) return loadingPromise;

    showLoading(0);
    loadingPromise = (async function () {
      const urls = PARTS.map((part) => new URL(part, baseUrl));
      const responses = await Promise.all(urls.map((url) => fetch(url, {
        cache: 'force-cache',
        credentials: 'same-origin'
      })));

      for (const response of responses) {
        if (!response.ok) {
          throw new Error(`Không tải được ${response.url} (${response.status})`);
        }
      }

      let done = 0;
      const texts = await Promise.all(responses.map(async (response) => {
        const text = await response.text();
        showLoading(++done);
        return text;
      }));

      // Các part là byte/text chunks của bundle gốc; phải nối đúng thứ tự.
      (0, eval)(texts.join(''));

      if (typeof window.__PANDAHAN_PHONETICS_MOUNT__ !== 'function') {
        throw new Error('Bundle đã tải nhưng thiếu hàm mount Pinyin.');
      }
      const el = root();
      if (!el) throw new Error('Không tìm thấy pinyin-phonetics-root.');
      window.__PANDAHAN_PHONETICS_ROOT__ = el;
      window.__PANDAHAN_PHONETICS_MOUNT__(el);
      mounted = true;
    })().catch((error) => {
      loadingPromise = null;
      mounted = false;
      showError(error);
      throw error;
    });

    return loadingPromise;
  };
})();
