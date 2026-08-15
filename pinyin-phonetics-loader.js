(async function() {
  try {
    const base = new URL('.', document.currentScript.src);
    const parts = ["pinyin-phonetics.part-01.js", "pinyin-phonetics.part-02.js", "pinyin-phonetics.part-03.js", "pinyin-phonetics.part-04.js", "pinyin-phonetics.part-05.js", "pinyin-phonetics.part-06.js", "pinyin-phonetics.part-07.js", "pinyin-phonetics.part-08.js", "pinyin-phonetics.part-09.js", "pinyin-phonetics.part-10.js", "pinyin-phonetics.part-11.js", "pinyin-phonetics.part-12.js", "pinyin-phonetics.part-13.js"];
    const responses = await Promise.all(parts.map(p => fetch(new URL(p, base))));
    for (const r of responses) if (!r.ok) throw new Error("Không tải được " + r.url + " (" + r.status + ")");
    const code = (await Promise.all(responses.map(r => r.text()))).join("");
    (0, eval)(code);
  } catch (e) {
    console.error("PandaHán phonetics bundle load error:", e);
    const root = document.getElementById("pinyin-phonetics-root");
    if (root) root.innerHTML = '<div style="padding:16px;color:#b91c1c;background:#fee2e2;border-radius:10px;">Không tải được module Ngữ âm. Vui lòng tải lại trang.</div>';
  }
})();
