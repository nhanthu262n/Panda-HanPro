(function () {
  'use strict';

  const loaderScript = document.currentScript;
  window.addEventListener("pandahan-language-changed", () => setTimeout(applyPhoneticsLanguage, 0));
  const baseUrl = new URL('./', loaderScript.src);
  const API_BASE = "";
  window.__PINYIN_TEACHER_API_BASE__ = "";

  const PARTS = [
    'pinyin-phonetics.part-01.js?v=segmental-20260820-v5',
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

  function pinyinT(vi, en) { return (window.PandaHanI18n?.isEnglish?.() || localStorage.getItem("pandahan_lang") === "en") ? en : vi; }

  function showLoading(done) {
    const root = getRoot();
    if (!root) return;
    const pct = Math.round((done / PARTS.length) * 100);
    root.innerHTML = `<div style="padding:28px;text-align:center;color:#9ca3af;font-weight:700">
      <div style="font-size:18px;margin-bottom:8px">${pinyinT("Đang tải Ngữ âm Pinyin…", "Loading Pinyin phonetics…")}</div>
      <div style="font-size:13px;margin-bottom:12px">${pinyinT("Lần đầu cần tải dữ liệu âm thanh và flashcard.", "The first load fetches audio data and flashcards.")}</div>
      <div style="height:8px;background:#fce7f3;border-radius:99px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#ec4899,#a855f7);transition:width .25s"></div>
      </div>
      <div style="font-size:12px;margin-top:8px">${done}/${PARTS.length} ${pinyinT("phần đã tải", "parts loaded")}</div>
    </div>`;
  }

  function showError(error) {
    console.error('PandaHán Pinyin loader error:', error);
    const root = getRoot();
    if (!root) return;
    const isFetchError = error instanceof TypeError || /fetch|cors|network/i.test(String(error?.message || error));
    const detail = isFetchError
      ? pinyinT('AI Teacher cần backend cho phép CORS từ GitHub Pages. Vui lòng thử lại sau khi backend được cấu hình.', 'AI Teacher needs a backend that allows CORS from GitHub Pages. Try again after configuring the backend.')
      : pinyinT('Hãy kiểm tra mạng rồi nhấn Ctrl + F5 để thử lại.', 'Check your network, then press Ctrl + F5 to try again.');
    root.innerHTML = `<div style="margin:20px auto;max-width:760px;padding:18px;color:#991b1b;background:#fee2e2;border:1px solid #fecaca;border-radius:14px;line-height:1.6">
      <strong>${pinyinT('Không tải được module Ngữ âm.', 'Could not load the Phonics module.')}</strong><br>${detail}
    </div>`;
  }

  const PHONETICS_LANGUAGE_PAIRS = [
    ["Giai đoạn 0 · Ngữ âm nền tảng · mở từng chữ để nghe đúng mẫu rồi luyện Flashcard → Game → Quiz", "Phase 0 · Phonetics foundation · open each item to hear the model, then practise with Flashcards → Game → Quiz"],
    ["Trong chi/shi/ri, chữ i là nguyên âm cuống lưỡi đặc biệt, gần “ư” nhưng không phải “ư” tiếng Việt và không đọc như “i” dài. Trong ci/si, chữ i là nguyên âm đầu lưỡi trước; không quặt lưỡi thành “ư”.", "In chi/shi/ri, i is a special retroflex vowel, similar to “ü” but not the Vietnamese “ư” and not the long “i” sound. In ci/si, i is a front dental vowel; do not curl the tongue into “ü”."],
    ["Chưa có lần thu âm nào. Mở một ô Pinyin, bấm Record rồi xem kết quả ở đây.", "No recordings yet. Open a Pinyin card, press Record, then view the result here."],
    ["Trong zhi/chi/shi/ri, chữ i là nguyên âm cuống lưỡi đặc biệt, gần “ư” nhưng không phải “ư” tiếng Việt và không đọc như “i” dài. Trong zi/ci/si, chữ i là nguyên âm đầu lưỡi trước, không quặt lưỡi thành “ư”.", "In zhi/chi/shi/ri, i is a special retroflex vowel, similar to “ü” but not the Vietnamese “ư” and not the long “i” sound. In zi/ci/si, i is a front dental vowel; do not curl the tongue into “ü”."],
    ["Chưa có lần thu âm nào. Mở một ô Pinyin, bấm Ghi âm rồi xem kết quả ở đây.", "No recordings yet. Open a Pinyin card, press Record, then view the result here."],
    ["mở từng chữ để nghe đúng mẫu rồi luyện Flashcard → Game → Quiz", "open each item to hear the model, then practise with Flashcards → Game → Quiz"],
    ["4 Thanh Điệu + Nguyên Âm", "4 Tones + Vowels"], ["Phụ Âm b/p/m/f · d/t/n/l", "Initials b/p/m/f · d/t/n/l"], ["Phụ Âm j / q / x", "Initials j / q / x"],
    ["Âm Cuộn Lưỡi zh/ch/sh/r · z/c/s", "Retroflex sounds zh/ch/sh/r · z/c/s"], ["Vận Mẫu Mũi -n và -ng", "Nasal finals -n and -ng"], ["Biến Điệu — Tone Sandhi", "Tone sandhi"], ["Ôn Tập Tuần 1", "Weekly review 1"],
    ["Tổng Ôn + Thi Thử Đọc", "Final review + reading mock test"], ["Phân biệt kết thúc mũi trước (-n) vs mũi sau (-ng)", "Distinguish the front nasal ending (-n) from the back nasal ending (-ng)"], ["Phân biệt uốn lưỡi (zh/ch/sh/r) vs không uốn (z/c/s)", "Distinguish retroflex sounds (zh/ch/sh/r) from non-retroflex sounds (z/c/s)"],
    ["Nhóm âm môi + nhóm âm đầu lưỡi", "Labial initials + front-tongue initials"], ["Âm mặt lưỡi — dễ nhầm với zh/ch/sh", "Alveolo-palatal sounds — easily confused with zh/ch/sh"], ["Thanh 3+3 · 不 biến điệu · 一 biến điệu", "Third-tone sandhi · 不 tone change · 一 tone change"],
    ["iu=iou · ui=uei · un=uen", "iu=iou · ui=uei · un=uen"], ["Trợ từ khinh thanh: 吗 呢 吧 的 — Erhua 儿化", "Neutral-tone particles: 吗 呢 吧 的 — Erhua 儿化"], ["Kiểm tra toàn bộ Pinyin Bootcamp — Giai đoạn 0", "Full Pinyin Bootcamp test — Phase 0"],
    ["Nền tảng: 4 thanh cơ bản + a o e i u", "Foundation: 4 basic tones + a o e i u"],
    ["Check tổng hợp buổi 1–6", "Review lessons 1–6"], ["Kiểm tra tổng hợp buổi 1–6", "Review lessons 1–6"],
    ["Âm Tiết Co Rút", "Contracted syllables"], ["Khinh Thanh & Âm Nhi", "Neutral Tone & Erhua"], ["Trợ từ khinh thanh", "Neutral-tone particles"],
    ["không uốn", "non-retroflex"], ["không quặt lưỡi", "do not curl the tongue"], ["biến điệu", "tone change"], ["Không bật hơi", "Unaspirated"],
 ["Đưa thanh điệu · HSK 1", "Tone drills · HSK 1"], ["Boss nghe tuần · HSK 1", "Weekly listening boss · HSK 1"], ["Chạm để bắt đầu", "Tap to start"], ["30max", "30 max"], ["10max", "10 max"],
    ["Ngữ âm", "Phonics"], ["Giai đoạn", "Phase"], ["nền tảng", "foundation"], ["Luyện nhóm i đặc biệt", "Practise the special i group"], ["Nghe mẫu", "Play model"], ["không bật hơi", "unaspirated"], ["bật hơi", "aspirated"], ["âm xát", "fricative"],
    ["Tổng số sao", "Total stars"], ["Tổng sao", "Total stars"], ["Buổi hoàn thành", "Lessons completed"], ["Lesson hoàn thành", "Lessons completed"], ["Buổi đã mở", "Lessons unlocked"], ["Lesson đã mở", "Lessons unlocked"], ["Lịch sử phát âm", "Pronunciation history"],
    ["Xóa lịch sử", "Clear history"], ["Phát âm đúng", "Correct pronunciation"], ["Phát âm sai/cần luyện lại", "Incorrect pronunciation / needs practice"], ["Phát âm sai", "Incorrect pronunciation"], ["Tất cả", "All"], ["Buổi", "Lesson"], ["Tuần", "Week"],
    ["Thanh Điệu", "Tones"], ["Nguyên Âm", "Vowels"], ["Phụ Âm", "Initials"], ["Âm Cuộn Lưỡi", "Retroflex Sounds"], ["Vận Mẫu Mũi", "Nasal Finals"], ["Biến Điệu", "Tone Sandhi"], ["Ôn Tập Tuần", "Weekly Review"], ["Tổng Ôn + Thi Thử", "Final Review + Mock Test"],
    ["Gần “trư”; giữ lưỡi cong, không phì hơi.", "Similar to “tr”; keep the tongue curled and do not puff air."], ["Gần “trư”; bật một luồng hơi rõ sau âm tắc-xát.", "Similar to “tr”; release a clear puff of air after the affricate."], ["Gần “sư”; lưỡi cong và hơi đi liên tục.", "Similar to “s”; curl the tongue and maintain continuous airflow."],
    ["Nền tảng: 4 thanh cơ bản", "Foundation: 4 basic tones"], ["Kiểm tra toàn bộ Pinyin Bootcamp", "Full Pinyin Bootcamp test"], ["Gần", "Similar to"], ["giữ lưỡi cong", "keep the tongue curled"], ["bật một luồng hơi rõ", "release a clear puff of air"], ["lưỡi cong và hơi đi liên tục", "curl the tongue with continuous airflow"],
  ];
  function applyPhoneticsLanguage() {
    const host = getRoot();
    const shadow = host && host.shadowRoot;
    if (!shadow) return;
    const mode = window.PandaHanI18n?.mode?.() || localStorage.getItem("pandahan_lang") || "vi";
    const sorted = PHONETICS_LANGUAGE_PAIRS.slice().sort((a, b) => b[0].length - a[0].length);
    const walker = document.createTreeWalker(shadow, NodeFilter.SHOW_TEXT);
    const nodes = []; let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach((textNode) => {
      if (!textNode.__pandahanPhoneticsOriginal) textNode.__pandahanPhoneticsOriginal = textNode.nodeValue || "";
      let value = textNode.__pandahanPhoneticsOriginal;
      if (mode === "en") sorted.forEach(([vi, en]) => { value = value.split(vi).join(en); });
      textNode.nodeValue = value;
    });
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

  function hideOverviewHistory() {
    const host = getRoot();
    const shadow = host && host.shadowRoot;
    if (!shadow) return;
    const hasHistory = (el) => {
      const text = (el.textContent || '').trim();
      return text.includes('Lịch sử phát âm') && text.includes('Xóa lịch sử');
    };
    const panel = [...shadow.querySelectorAll('section')].find(hasHistory)
      || [...shadow.querySelectorAll('div')].filter(hasHistory).sort((a, b) => (b.textContent || '').length - (a.textContent || '').length)[0];
    if (panel) {
      panel.style.display = 'none';
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('data-pandahan-overview-history-hidden', 'true');
    }
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
    const next = buttons.find((button) => (button.textContent || '').includes('Thẻ tiếp theo'));
    const previous = buttons.find((button) => (button.textContent || '').includes('Thẻ trước'));
    const nav = next && previous && next.parentElement === previous.parentElement ? next.parentElement : null;
    if (nav) nav.classList.add('pinyin-sticky-nav');
  }

  function installPinyinObservers() {
    const host=getRoot();
    if(!host||!host.shadowRoot||host.__pinyinUiObserver)return;
    const shadow=host.shadowRoot;
    let timer=0;
    const refresh=()=>{if(timer)return;timer=window.setTimeout(()=>{timer=0;hideQuizAnswerMeanings();hideOverviewHistory();installPinyinLayoutFix();applyPhoneticsLanguage();},120)};
    hideQuizAnswerMeanings();hideOverviewHistory();installPinyinLayoutFix();applyPhoneticsLanguage();
    host.__pinyinUiObserver=new MutationObserver(refresh);
    host.__pinyinUiObserver.observe(shadow,{childList:true,subtree:true});
    if (!host.__pinyinLanguageListener) {
      host.__pinyinLanguageListener = () => applyPhoneticsLanguage();
      window.addEventListener("pandahan-language-changed", host.__pinyinLanguageListener);
    }
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

      // Nhường một nhịp cho trình duyệt trước khi nối/eval bundle lớn để tránh khựng giao diện.
      await new Promise((resolve) => {
        const resume = () => resolve();
        if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(resume, { timeout: 120 });
        else window.setTimeout(resume, 0);
      });
      // Nối đúng thứ tự part-01 → part-05 rồi chạy bundle nguyên bản một lần.
      (0, eval)(texts.join(''));
      if (typeof window.__PANDAHAN_PHONETICS_MOUNT__ !== 'function') {
        throw new Error('Bundle thiếu hàm mount Pinyin.');
      }

      const mountRoot = getRoot();
      if (!mountRoot) throw new Error('Không tìm thấy vùng Ngữ âm.');
      window.__PANDAHAN_PHONETICS_ROOT__ = mountRoot;
      window.__PANDAHAN_PHONETICS_MOUNT__(mountRoot);
      window.dispatchEvent(new Event("pinyin-mounted"));
      window.dispatchEvent(new Event("pandahan-phonetics-mounted"));
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
