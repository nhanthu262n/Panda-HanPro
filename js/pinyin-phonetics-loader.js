(function () {
  'use strict';

  // Lưu ngay script hiện tại trước khi có await.
  const loaderScript = document.currentScript;
  const baseUrl = new URL('./', loaderScript.src);

  const PARTS = [
    'pinyin-phonetics.part-01.js',
    'pinyin-phonetics.part-02.js',
    'pinyin-phonetics.part-03.js',
    'pinyin-phonetics.part-04.js',
    'pinyin-phonetics.part-05.js'
  ];

  // Promise này giúp tránh tải lại hoặc eval lại bundle nhiều lần.
  let loadingPromise = null;
  let mounted = false;

  function getRoot() {
    return document.getElementById('pinyin-phonetics-root');
  }

  function showLoading(loaded = 0) {
    const root = getRoot();
    if (!root) return;

    root.innerHTML = `
      <div style="padding:28px;text-align:center;color:#9ca3af;font-weight:700">
        <div style="font-size:18px;margin-bottom:8px">
          Đang tải Ngữ âm Pinyin…
        </div>
        <div style="font-size:13px;margin-bottom:12px">
          Lần đầu cần tải ${PARTS.length} phần dữ liệu lớn.
        </div>
        <div style="height:8px;background:#fce7f3;border-radius:99px;overflow:hidden">
          <div style="width:${Math.round(loaded / PARTS.length * 100)}%;height:100%;background:linear-gradient(90deg,#ec4899,#a855f7);transition:width .25s"></div>
        </div>
        <div style="font-size:12px;margin-top:8px">
          ${loaded}/${PARTS.length} phần đã tải
        </div>
      </div>
    `;
  }

  function showError(error) {
    console.error('PandaHán Pinyin loader error:', error);

    const root = getRoot();
    if (!root) return;

    root.innerHTML = `
      <div style="padding:16px;color:#b91c1c;background:#fee2e2;border-radius:10px">
        Không tải được module Ngữ âm. Hãy nhấn Ctrl + F5 rồi thử lại.
      </div>
    `;
  }

  // Hàm này chỉ được gọi khi mở tab Ngữ âm.
  window.loadPinyinPhonetics = function () {
    if (mounted && typeof window.__PANDAHAN_PHONETICS_MOUNT__ === 'function') {
      return Promise.resolve();
    }

    if (loadingPromise) {
      return loadingPromise;
    }

    showLoading(0);

    loadingPromise = (async function () {
      const urls = PARTS.map((part) => new URL(part, baseUrl));

      // Tải song song cả 5 phần để giảm thời gian chờ mạng.
      const responses = await Promise.all(
        urls.map((url) => fetch(url, {
          cache: 'force-cache',
          credentials: 'same-origin'
        }))
      );

      for (const response of responses) {
        if (!response.ok) {
          throw new Error(
            `Không tải được ${response.url} (${response.status})`
          );
        }
      }

      let loaded = 0;
      const texts = await Promise.all(
        responses.map(async (response) => {
          const text = await response.text();
          loaded += 1;
          showLoading(loaded);
          return text;
        })
      );

      // Nối đúng thứ tự part-01 → part-05.
      const code = texts.join('');

      // Chạy bundle nguyên bản một lần.
      (0, eval)(code);

      if (typeof window.__PANDAHAN_PHONETICS_MOUNT__ !== 'function') {
        throw new Error(
          'Bundle đã tải nhưng không tìm thấy hàm __PANDAHAN_PHONETICS_MOUNT__.'
        );
      }

      const root = getRoot();
      if (!root) {
        throw new Error('Không tìm thấy pinyin-phonetics-root.');
      }

      window.__PANDAHAN_PHONETICS_ROOT__ = root;
      window.__PANDAHAN_PHONETICS_MOUNT__(root);
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
