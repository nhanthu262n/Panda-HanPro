(function () {
  'use strict';

  const loaderScript = document.currentScript;
  const baseUrl = new URL('./', loaderScript.src);
  // AI Teacher backend thật; phải cho phép CORS từ domain GitHub Pages.
  window.__PINYIN_TEACHER_API_BASE__ = 'https://pinyinteach-xct3ccac.manus.space';
  const PARTS = [
    'pinyin-phonetics.part-01.js',
    'pinyin-phonetics.part-02.js',
    'pinyin-phonetics.part-03.js',
    'pinyin-phonetics.part-04.js',
    'pinyin-phonetics.part-05.js'
  ];
  let loadingPromise = null;
  let mounted = false;

  function getRoot() { return document.getElementById('pinyin-phonetics-root'); }

  function showLoading(done) {
    const el = getRoot();
    if (!el) return;
    const pct = Math.round((done / PARTS.length) * 100);
    el.innerHTML = `<div style="padding:28px;text-align:center;color:#9ca3af;font-weight:700">
      <div style="font-size:18px;margin-bottom:8px">Đang tải Ngữ âm Pinyin…</div>
      <div style="font-size:13px;margin-bottom:12px">Lần đầu cần tải dữ liệu âm thanh và flashcard.</div>
      <div style="height:8px;background:#fce7f3;border-radius:99px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#ec4899,#a855f7);transition:width .25s"></div>
      </div><div style="font-size:12px;margin-top:8px">${done}/${PARTS.length} phần đã tải</div>
    </div>`;
  }

  function showError(error) {
    console.error('PandaHán Pinyin loader error:', error);
    const el = getRoot();
    if (el) el.innerHTML = '<div style="padding:16px;color:#b91c1c;background:#fee2e2;border-radius:10px">Không tải được module Ngữ âm. Hãy kiểm tra mạng rồi nhấn Ctrl + F5 để thử lại.</div>';
  }

  function bytesFromDataUrl(dataUrl) {
    const comma = String(dataUrl || '').indexOf(',');
    if (comma < 0) return new Uint8Array();
    const raw = atob(String(dataUrl).slice(comma + 1));
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function hideVietnameseSubtitle() {
    const host = getRoot();
    const shadow = host && host.shadowRoot;
    if (!shadow) return;

    // Ẩn nhãn và giá trị nghĩa tiếng Việt của flashcard Học.
    const walker = document.createTreeWalker(shadow, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach((textNode) => {
      const text = (textNode.nodeValue || '').trim();
      if (!/^(Nghĩa tiếng Việt|Vietnamese meaning)(?: đang được bổ sung)?[:：]?$/i.test(text)) return;
      const label = textNode.parentElement;
      if (!label) return;
      label.style.display = 'none';
      label.setAttribute('aria-hidden', 'true');
      const next = label.nextElementSibling;
      if (next && next.textContent && next.textContent.trim().length < 140) {
        next.style.display = 'none';
        next.setAttribute('aria-hidden', 'true');
      }
    });

    // Ẩn dòng vietsub trong từng thẻ đáp án Trắc nghiệm, nhưng giữ Hán tự và Pinyin.
    shadow.querySelectorAll('button').forEach((button) => {
      const children = [...button.children];
      if (children.length < 3) return;
      const texts = children.map((el) => (el.textContent || '').trim());
      const hasHan = texts.some((t) => /[一-鿿]/.test(t));
      const hasPinyin = texts.some((t) => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(t));
      if (!hasHan || !hasPinyin) return;
      const meaning = children[children.length - 1];
      if (meaning && !/[一-鿿]/.test(meaning.textContent || '')) {
        meaning.style.display = 'none';
        meaning.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function installVietnameseSubtitleHider() {
    const host = getRoot();
    if (!host || !host.shadowRoot) return;
    const shadow = host.shadowRoot;
    hideVietnameseSubtitle();
    if (!host.__subtitleObserver) {
      host.__subtitleObserver = new MutationObserver(() => {
        hideVietnameseSubtitle();
        queueMicrotask(hideVietnameseSubtitle);
      });
      host.__subtitleObserver.observe(shadow, { childList: true, subtree: true, characterData: true });
    }
    if (!host.__subtitleTimer) {
      let rounds = 0;
      host.__subtitleTimer = setInterval(() => {
        hideVietnameseSubtitle();
        if (++rounds >= 20) {
          clearInterval(host.__subtitleTimer);
          host.__subtitleTimer = null;
        }
      }, 500);
    }
  }

  window.loadPinyinPhonetics = function () {
    if (mounted && typeof window.__PANDAHAN_PHONETICS_MOUNT__ === 'function') return Promise.resolve();
    if (loadingPromise) return loadingPromise;
    showLoading(0);
    loadingPromise = (async function () {
      const responses = await Promise.all(PARTS.map((part) => fetch(new URL(part, baseUrl), { cache: 'force-cache' })));
      for (const response of responses) if (!response.ok) throw new Error(`Không tải được ${response.url} (${response.status})`);
      let done = 0;
      const texts = await Promise.all(responses.map(async (response) => { const t = await response.text(); showLoading(++done); return t; }));
      (0, eval)(texts.join(''));
      if (typeof window.__PANDAHAN_PHONETICS_MOUNT__ !== 'function') throw new Error('Bundle thiếu hàm mount Pinyin.');
      const el = getRoot();
      if (!el) throw new Error('Không tìm thấy vùng Ngữ âm.');
      window.__PANDAHAN_PHONETICS_ROOT__ = el;
      window.__PANDAHAN_PHONETICS_MOUNT__(el);
      mounted = true;
      setTimeout(installVietnameseSubtitleHider, 0);
      setTimeout(installVietnameseSubtitleHider, 300);
      setTimeout(installVietnameseSubtitleHider, 1000);
    })().catch((error) => { loadingPromise = null; mounted = false; showError(error); throw error; });
    return loadingPromise;
  };
})();
