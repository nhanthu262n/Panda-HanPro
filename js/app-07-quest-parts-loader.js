/* PandaHan Pro — Quest split-parts loader
 * Ghép 3 phần nhị phân nguyên byte khi người dùng mở Quest.
 */
(() => {
  "use strict";

  const PARTS = [
    "assets/pinyin-tone-quest.part-00",
    "assets/pinyin-tone-quest.part-01",
    "assets/pinyin-tone-quest.part-02",
  ];
  let loadPromise = null;
  let objectUrl = null;

  function frame() {
    return document.getElementById("pinyinToneQuestFrame");
  }

  function setStatus(message, isError = false) {
    const target = frame();
    if (!target) return;
    target.title = message;
    target.style.opacity = isError ? "0.35" : "0.7";
  }

  async function loadQuestOffline() {
    const target = frame();
    if (!target) throw new Error("Không tìm thấy iframe Quest.");
    if (objectUrl) {
      target.src = objectUrl;
      return objectUrl;
    }
    if (loadPromise) return loadPromise;

    setStatus("Đang ghép nội dung Pinyin Tone Quest…");
    loadPromise = Promise.all(PARTS.map(async (part) => {
      const response = await fetch(part, { cache: "force-cache" });
      if (!response.ok) throw new Error(`Không tải được ${part} (${response.status})`);
      return response.arrayBuffer();
    })).then((buffers) => {
      const blob = new Blob(buffers, { type: "text/html;charset=utf-8" });
      objectUrl = URL.createObjectURL(blob);
      target.src = objectUrl;
      target.style.opacity = "1";
      return objectUrl;
    }).catch((error) => {
      loadPromise = null;
      target.style.opacity = "1";
      target.srcdoc = `<body style="font-family:system-ui;padding:24px;color:#991b1b;background:#fff7ed"><h3>Không tải được Quest offline</h3><p>${String(error.message || error)}</p><p>Hãy kiểm tra đủ 3 file <code>pinyin-tone-quest.part-00/01/02</code> trong thư mục <code>assets</code>.</p></body>`;
      throw error;
    });
    return loadPromise;
  }

  window.PandaHanQuestParts = {
    parts: PARTS.slice(),
    loadQuestOffline,
  };

  document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("pCardPinyinQuest");
    if (card) card.addEventListener("click", () => loadQuestOffline().catch(() => {}));
  });
})();
