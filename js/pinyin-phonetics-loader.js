(async function () {
  try {
    const loaderScript = document.currentScript;
    const base = new URL('.', loaderScript.src);

    const parts = [
      'pinyin-phonetics.part-01.js',
      'pinyin-phonetics.part-02.js',
      'pinyin-phonetics.part-03.js',
      'pinyin-phonetics.part-04.js',
      'pinyin-phonetics.part-05.js'
    ];

    const responses = await Promise.all(
      parts.map((part) => fetch(new URL(part, base)))
    );

    for (const response of responses) {
      if (!response.ok) {
        throw new Error(
          `Không tải được ${response.url} (${response.status})`
        );
      }
    }

    const code = (
      await Promise.all(responses.map((response) => response.text()))
    ).join('');

    // Chạy toàn bộ bundle sau khi đã nối đủ 5 phần theo đúng thứ tự.
    (0, eval)(code);
  } catch (error) {
    console.error('PandaHán phonetics bundle load error:', error);

    const root = document.getElementById('pinyin-phonetics-root');
    if (root) {
      root.innerHTML = `
        <div style="padding:16px;color:#b91c1c;background:#fee2e2;border-radius:10px;">
          Không tải được module Ngữ âm. Vui lòng tải lại trang.
        </div>
      `;
    }
  }
})();
