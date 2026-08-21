/* PandaHan Pro — Quest UI bridge. Không sửa core app/login/audio. */
(() => {
  "use strict";
  function byId(id) { return document.getElementById(id); }
  function showPracticeGrid(show) {
    const grid = document.querySelector("#practiceTab .practice-grid");
    if (grid) grid.style.display = show ? "" : "none";
  }
  function closeOtherViews() {
    const game = byId("gameContainer");
    const advanced = byId("advancedSetsView");
    if (game) game.style.display = "none";
    if (advanced) advanced.style.display = "none";
  }
  function openQuest() {
    closeOtherViews();
    showPracticeGrid(false);
    const view = byId("pinyinToneQuestView");
    if (view) {
      view.style.display = "block";
      view.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  function closeQuest() {
    const view = byId("pinyinToneQuestView");
    if (view) view.style.display = "none";
    showPracticeGrid(true);
  }
  document.addEventListener("DOMContentLoaded", () => {
    const card = byId("pCardPinyinQuest");
    const back = byId("pinyinToneQuestBack");
    if (card) card.addEventListener("click", openQuest);
    if (back) back.addEventListener("click", closeQuest);
    window.PandaHanQuestUI = { openQuest, closeQuest };
  });
})();
