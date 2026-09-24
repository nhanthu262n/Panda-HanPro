(() => {
  "use strict";
  // v57 compatibility layer: language selection is source-driven by app-02.js.
  // No MutationObserver and no forced English mode. This avoids browser-specific
  // text rewriting regressions while preserving Chinese/Pinyin learning content.
  function refresh(){
    try { window.applyStaticLanguageUi?.(); } catch (_) {}
    try { window.PanTutorV57Vietnamese?.apply?.(document.body); } catch (_) {}
  }
  window.addEventListener("pandahan-language-changed", () => setTimeout(refresh, 0));
  document.addEventListener("DOMContentLoaded", () => setTimeout(refresh, 30));
})();