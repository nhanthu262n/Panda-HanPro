/* PandaHan feature updates: logic-only patch; existing layout and design tokens remain untouched. */
(function () {
  "use strict";

  const DAY_MIN = 1;
  const DAY_MAX = 120;
  const text = (vi, en) => window.LANG_MODE === "en" ? en : vi;
  const ns = () => {
    try { return String(typeof window.storageNamespace === "function" ? window.storageNamespace() : "guest").replace(/[^a-zA-Z0-9_-]/g, "_"); } catch (_) { return "guest"; }
  };
  const readJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch (_) { return fallback; } };
  const writeJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };

  /* 1) Quick Search: open the embedded 120-day roadmap and retry after iframe load. */
  function searchDayInFrame(day) {
    const frame = document.getElementById("pinyinToneQuestFrame") || document.querySelector("iframe[srcdoc], iframe");
    const doc = frame && frame.contentDocument;
    if (!doc) return false;
    const nodes = Array.from(doc.querySelectorAll(".day-quest-card,[data-day]"));
    const target = nodes.find((node) => {
      const raw = `${node.getAttribute("data-day") || ""} ${node.getAttribute("aria-label") || ""} ${node.textContent || ""}`;
      return Number((raw.match(/(?:day|ngày)\s*#?\s*(\d+)/i) || [])[1] || node.getAttribute("data-day") || 0) === day;
    });
    if (!target) return false;
    doc.querySelectorAll("[data-quest-search-hit]").forEach((node) => { node.style.outline = ""; node.removeAttribute("data-quest-search-hit"); });
    target.style.outline = "4px solid #f59e0b";
    target.style.outlineOffset = "3px";
    target.setAttribute("data-quest-search-hit", "true");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }
  async function jumpToReviewDay(day) {
    const input = document.getElementById("questDaySearch");
    const error = document.getElementById("questDaySearchError");
    const raw = String(day ?? input?.value ?? "").trim();
    const fail = (message) => { if (error) { error.textContent = message; error.style.display = "inline"; } };
    if (!/^\d+$/.test(raw)) return fail(text("Nhập số ngày từ 1 đến 120.", "Enter a day number from 1 to 120."));
    const value = Number(raw);
    if (value < DAY_MIN || value > DAY_MAX) return fail(text("Ngày phải từ 1 đến 120.", "Day must be between 1 and 120."));
    if (error) { error.textContent = ""; error.style.display = "none"; }
    if (searchDayInFrame(value)) return true;
    try { await window.PandaHanQuestParts?.loadQuestOffline?.(); } catch (_) {}
    for (let i = 0; i < 20; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      if (searchDayInFrame(value)) return true;
    }
    fail(text("Chưa tải được roadmap Ôn tập 120 ngày.", "The 120-day roadmap could not be loaded."));
    return false;
  }
  let lastSubmittedQuestKey = "";
  async function submitQuestScoreFromReview(event) {
    const detail = event?.detail || {};
    const dayNumber = Number(detail.dayNumber || detail.day || 0);
    const scorePercent = Number(detail.scorePercent ?? detail.score);
    if (!dayNumber || !Number.isFinite(scorePercent)) return null;
    const key = `${dayNumber}:${scorePercent}:${detail.resultToken || ""}`;
    if (key === lastSubmittedQuestKey) return null;
    lastSubmittedQuestKey = key;
    const api = window.PandaHanSchedule;
    if (!api || typeof api.submitQuestResult !== "function") return null;
    try {
      const result = await api.submitQuestResult(dayNumber, scorePercent, detail.resultToken || key);
      window.dispatchEvent(new CustomEvent("pandahan-quest-schedule-saved", { detail: result }));
      return result;
    } catch (error) {
      lastSubmittedQuestKey = "";
      console.warn("Không ghi được điểm Ôn tập 120 ngày vào schedule:", error);
      return null;
    }
  }
  window.PandaHanFeatureUpdates = { jumpToReviewDay, submitQuestScoreFromReview };
  window.addEventListener("pandahan-quest-score-saved", submitQuestScoreFromReview);
  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("questDaySearch");
    if (input) {
      input.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); jumpToReviewDay(input.value); } }, true);
      input.addEventListener("change", () => { if (input.value) jumpToReviewDay(input.value); });
    }
  });

  /* 2) AI Coach: remove the deprecated linked-vocabulary speaking item at render time. */
  function removeDeprecatedCoachStep(root = document) {
    root.querySelectorAll('[data-mission-task="vocab-speaking"]').forEach((node) => node.remove());
    root.querySelectorAll('[data-coach-step="4"],[data-ai-coach-section="4"]').forEach((node) => {
      if (/liên kết nói|linked vocabulary\s*[—-]\s*speak/i.test(node.textContent || "")) node.remove();
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    removeDeprecatedCoachStep();
    new MutationObserver(() => removeDeprecatedCoachStep()).observe(document.body, { childList: true, subtree: true });
  });

  /* 3) Objective phonetics evidence: keep detailed, user-generated results. */
  function savePhoneticsEvidence(detail, source) {
    const d = detail || {};
    const score = Number(d.scorePercent ?? d.score ?? d.percentage ?? d.accuracy);
    const row = {
      id: `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source, verified: d.verified !== false, scorePercent: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null,
      correct: Number(d.correct ?? d.right ?? 0), total: Number(d.total ?? d.answered ?? d.questions ?? 0),
      components: d.components || d.metrics || null, details: d.details || d.items || d.wrongItems || [],
      dayNumber: Number(d.dayNumber || window.PandaHanMission?.getCurrent?.()?.dayNumber || 0) || null,
      createdAt: Date.now()
    };
    const key = `pandahan_phonetics_evidence_${ns()}`;
    const rows = [row, ...readJson(key, [])].slice(0, 100);
    writeJson(key, rows);
    window.dispatchEvent(new CustomEvent("pandahan-phonetics-evidence-updated", { detail: row }));
    if (Number.isFinite(row.scorePercent) && typeof window.savePracticeCompletion === "function") {
      const practiceSource = /speak|pronunciation/i.test(source) ? "speaking" : "quiz";
      Promise.resolve(window.savePracticeCompletion(row.scorePercent, practiceSource, { source, phoneticsEvidenceId: row.id, components: row.components, details: row.details })).catch(() => {});
    }
    return row;
  }
  ["pandahan-phonetics-listening-quiz", "pandahan-pronunciation-scored", "pandahan-phonetics-speaking-score", "pandahan-learning-evaluation"].forEach((eventName) => {
    window.addEventListener(eventName, (event) => {
      const source = eventName.replace(/^pandahan-/, "");
      const detail = event.detail || {};
      if (eventName === "pandahan-learning-evaluation" && !/phonetic|pronunciation|speaking|listening/i.test(`${detail.source || ""} ${detail.evidenceType || ""}`)) return;
      savePhoneticsEvidence(detail, source);
    });
  });
  window.PandaHanPhoneticsEvidence = {
    getAll: () => readJson(`pandahan_phonetics_evidence_${ns()}`, []),
    getLatest: () => readJson(`pandahan_phonetics_evidence_${ns()}`, [])[0] || null,
    record: savePhoneticsEvidence
  };

  /* 4) Sequential daily vocabulary flow: dictionary detail -> SM-2 grade -> next word. */
  let flow = null;
  function getWord(char) { return window.VOCAB_BY_CHAR?.[char] || window.VOCAB?.find?.((word) => word.char === char) || null; }
  function getDayWords(dayNumber) {
    const mission = window.PandaHanMission?.getCurrent?.();
    const candidates = mission?.chainVocabulary || mission?.newVocab || mission?.adaptivePlan?.introWords || [];
    const fromMission = candidates.map((w) => typeof w === "string" ? getWord(w) : w).filter(Boolean);
    if (fromMission.length) return fromMission;
    const day = window.PandaHanMission?.getCurriculumDay?.(Number(dayNumber));
    const raw = day?.new_vocab_raw || "";
    const chars = Array.from(raw.matchAll(/([\u3400-\u9fff]+)\s*\(/g)).map((m) => m[1]);
    return chars.map(getWord).filter(Boolean);
  }
  function ensureFlowPanel() {
    const host = document.getElementById("detailView") || document.querySelector("#detailView,.detail-view");
    if (!host) return null;
    let panel = document.getElementById("pandahanFlashcardReview");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "pandahanFlashcardReview";
      panel.style.cssText = "margin:14px 0 4px;padding:12px;border:1px solid #f3c4d8;border-radius:12px;background:#fff8fb;";
      host.appendChild(panel);
    }
    return panel;
  }
  function renderFlowPanel() {
    const panel = ensureFlowPanel();
    if (!panel || !flow) return;
    const word = flow.words[flow.index];
    if (!word) {
      panel.innerHTML = `<b>${text("Đã hoàn thành toàn bộ từ vựng hôm nay.", "All vocabulary for today is complete.")}</b>`;
      return;
    }
    const stat = window.getStat?.(word.char) || {};
    const graded = Object.values(flow.grades || {});
    const dailyAverage = graded.length ? Math.round(graded.reduce((sum, item) => sum + Number(item.scorePercent || 0), 0) / graded.length) : 0;
    panel.innerHTML = `<div style="font-weight:800;font-size:12px;">${text("Học từ vựng liên kết", "Linked vocabulary study")} · ${flow.index + 1}/${flow.words.length}</div><div style="font-size:10.5px;color:#7e2258;margin:4px 0 7px;">${text("Điểm SM-2 trong ngày", "Today's SM-2 score")}: <b>${dailyAverage}%</b> · ${graded.length}/${flow.words.length}</div><div style="font-size:11px;color:#64748b;margin:5px 0 9px;">${text("Xem nghĩa và ví dụ ở phía trên, sau đó bấm Trắc nghiệm. Điểm được lấy từ câu trả lời được chấm, không tự đánh giá.", "Review the meaning and examples above, then start the quiz. Scores come from graded answers, not self-assessment.")}</div><button type="button" data-vocab-quiz="1" style="border:0;border-radius:9px;background:#db2777;color:#fff;padding:8px 13px;font-weight:800;font-size:11px;cursor:pointer;">📝 ${text("Trắc nghiệm từ này", "Quiz this word")} · ${flow.index + 1 === flow.words.length ? text("Từ cuối", "Last word") : text("Tiếp", "Next")}</button><div style="font-size:10.5px;color:#64748b;margin-top:7px;">SM-2: ${Number(stat.repetitions || 0)} ${text("lần đúng", "successful repetitions")} · EF ${Number(stat.ef || 2.5).toFixed(2)}</div>`;
    panel.querySelector("[data-vocab-quiz]")?.addEventListener("click", () => window.startQuizForWord?.(word.char, { vocabularyFlow: true }));
  }
    function startVocabularyFlow(words, dayNumber = null) {
    const normalized = (words || []).map((w) => typeof w === "string" ? getWord(w) : w).filter(Boolean);
    if (!normalized.length) return false;
    flow = { words: normalized, index: 0, dayNumber: Number(dayNumber || 0) || null, grades: {} };
    if (typeof window.openDetail === "function") window.openDetail(normalized[0].char);
    setTimeout(renderFlowPanel, 0);
    return true;
  }
  window.PandaHanVocabularyFlow = {
    start: startVocabularyFlow,
    startForDay: (day) => startVocabularyFlow(getDayWords(day), day),
    getState: () => flow,
    quizCompleted: (result) => {
      if (!flow) return;
      const char = String(result?.char || flow.words[flow.index]?.char || "");
      const scorePercent = Math.max(0, Math.min(100, Number(result?.scorePercent) || 0));
      flow.grades = flow.grades || {};
      flow.grades[char] = { scorePercent, correct: Number(result?.correct || 0), total: Number(result?.total || 0), reviewedAt: Date.now(), source: "graded-vocabulary-quiz" };
      flow.index += 1;
      const next = flow.words[flow.index];
      if (next && typeof window.openDetail === "function") window.openDetail(next.char);
      else {
        const returnToCoach = () => {
          if (typeof window.switchTab === "function") window.switchTab("chat");
          setTimeout(() => window.openAiCoachChat?.(), 0);
        };
        returnToCoach();
      }
      renderFlowPanel();
    }
  };
  document.addEventListener("click", (event) => {
    const card = event.target.closest?.("#wordListContent [data-char]");
    if (card) {
      const chars = Array.from(document.querySelectorAll("#wordListContent [data-char]" )).map((node) => node.dataset.char);
      setTimeout(() => startVocabularyFlow(chars), 0);
      return;
    }
    const task = event.target.closest?.('[data-mission-task="vocab-intro"]');
    if (task) setTimeout(() => startVocabularyFlow(getDayWords(window.PandaHanMission?.getCurrent?.()?.dayNumber)), 0);
  });
  window.addEventListener("pandahan-detail-opened", renderFlowPanel);
})();
