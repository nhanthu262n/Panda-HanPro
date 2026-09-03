/* PandaHan AI Tutor chatbox-only exam context. No schedule, Quest, SRS or curriculum writes. */
(function () {
  "use strict";
  const DATA_URL = "assets/ai-tutor-chatbox-hsk30-bank.json";
  let bankPromise = null;
  let bank = null;

  function loadBank() {
    if (bank) return Promise.resolve(bank);
    if (!bankPromise) bankPromise = fetch(DATA_URL, { cache: "no-cache" }).then((r) => {
      if (!r.ok) throw new Error("CHATBOX_BANK_HTTP_" + r.status);
      return r.json();
    }).then((data) => { bank = data; return data; });
    return bankPromise;
  }

  function parseRequest(text) {
    const s = String(text || "");
    const levelMatch = s.match(/HSK\s*(?:3\.0\s*)?([1-6])/i);
    const setMatch = s.match(/(?:bộ|set|đề)\s*(?:số\s*)?(\d{1,3})/i);
    const level = levelMatch ? Number(levelMatch[1]) : 1;
    const set = setMatch ? Math.max(1, Math.min(100, Number(setMatch[1]))) : 1;
    const mode = /sửa|chỉnh|review|revise|kiểm tra lỗi/i.test(s) ? "review" : /giải|đáp án|chấm|score|solve|phân tích bài làm/i.test(s) ? "solve" : /tạo|soạn|create|generate|make|exam|test|bộ đề|đề thi|ma trận|rubric/i.test(s) ? "create" : "tutor";
    return { level, set, mode };
  }

  const AI_TUTOR_QUALITY_POLICY = {
    scope: "AI Tutor exam presentation only; never write to Quest, SRS, schedule, curriculum, or verified evidence.",
    hsk34: "For HSK 3–4, use familiar topics with multi-clause context, explicit cause/contrast/condition, and distractors that are grammatically possible but contextually wrong.",
    hsk56: "For HSK 5–6, use denser passages, inference, discourse markers, paraphrase, register, and distractors that require evidence rather than word matching.",
    replace_legacy_items: {
      meaning_mcq: "Do not present a bare synonym/gloss question. Rewrite it as a context-based vocabulary-inference MCQ with an original Chinese sentence or short passage and plausible options.",
      grammar_mcq: "Do not ask which isolated pattern name is correct. Rewrite it as a sentence-in-context MCQ testing word order, aspect, complements, collocation, or discourse relation.",
      sentence_order: "Use at least 5 chunks and include a time/place/adverbial element or a two-clause relation; avoid trivial reversed strings or punctuation-only distractors.",
      reading_sequence: "Use event order supported by at least two explicit temporal or causal links; do not make the answer recoverable by one repeated phrase."
    },
    language: "Keep all Chinese passages, options, answers, pinyin, and Chinese explanations unchanged. Vietnamese UI copy must have an accurate English counterpart.",
    response_contract: "Every generated item must include: level, skill, cognitive demand, Chinese prompt or passage, four plausible options, answer, evidence-based explanation, and a distractor analysis. Do not expose the answer until the learner asks to solve or review.",
    level_matrix: {
      HSK3: "Short familiar passage; identify explicit detail, simple cause/result, sequence, and common grammar in context.",
      HSK4: "Longer connected passage; distinguish main idea from detail, infer a simple implication, and handle contrast/condition/cause across clauses.",
      HSK5: "Medium-to-long passage; infer attitude or unstated relation, paraphrase key information, and distinguish near-synonymous options by register and collocation.",
      HSK6: "Dense passage; evaluate argument, reference, implication, discourse markers, register, and multi-step evidence; sentence ordering must preserve discourse coherence."
    }
  };

  function normalizeTutorItem(item, level, includeAnswers) {
    const out = { ...item };
    const numericLevel = Number(String(level || "").replace(/\D/g, ""));
    if (numericLevel >= 3 && numericLevel <= 6) {
      if (out.type === "meaning_mcq") { out.type = "reading_vocabulary_in_context"; out.legacy_type = "meaning_mcq"; out.rewrite_required = true; out.rewrite_instruction = "Create a new Chinese context sentence or short passage; do not copy the legacy prompt or options."; out.target_expression = String(out.prompt || "").match(/[“"]([^”"]+)[”"]/u)?.[1] || null; delete out.prompt; delete out.options; delete out.answer; delete out.answer_letter; }
      if (out.type === "grammar_mcq") { out.type = "grammar_in_context_mcq"; out.legacy_type = "grammar_mcq"; out.rewrite_required = true; out.rewrite_instruction = "Create a new complete Chinese sentence in context; test the grammar relationship, not an isolated pattern label; do not copy the legacy prompt or options."; delete out.prompt; delete out.options; delete out.answer; delete out.answer_letter; }
      if (out.type === "sentence_order") { out.difficulty = numericLevel >= 5 ? "reading-equivalent" : "upper-intermediate"; out.rewrite_required = true; out.rewrite_instruction = "Create a new natural sentence with at least five meaningful chunks and a multi-clause relation; do not copy punctuation-only distractors."; }
      if (out.type === "reading_sequence") out.difficulty = numericLevel >= 5 ? "inference" : "multi-step";
    }
    if (!includeAnswers) { delete out.answer; delete out.answer_letter; delete out.explanation; delete out.explanation_en; delete out.explanation_zh; delete out.solution_steps; delete out.solution_steps_en; delete out.solution_steps_zh; delete out.option_analysis_en; delete out.option_analysis_zh; }
    return out;
  }

  function slimSet(exam, includeAnswers) {
    return {
      id: exam.id, title: exam.title, level: exam.level, topic: exam.topic,
      original_content: exam.original_content, official_exam: exam.official_exam,
      source_note: exam.source_note, blueprint: exam.blueprint,
      items: exam.items.map((item) => {
        const out = normalizeTutorItem(item, exam.level, includeAnswers);
        if (!includeAnswers) { delete out.answer; delete out.answer_letter; delete out.explanation; delete out.explanation_en; delete out.explanation_zh; delete out.solution_steps; delete out.solution_steps_en; delete out.solution_steps_zh; delete out.option_analysis_en; delete out.option_analysis_zh; }
        return out;
      })
    };
  }

  async function contextFor(text) {
    const request = parseRequest(text);
    try {
      const data = await loadBank();
      const exam = (data.sets || []).find((x) => x.level === "HSK" + request.level && x.id.endsWith("-" + String(request.set).padStart(3, "0")))
        || (data.sets || []).find((x) => x.level === "HSK" + request.level) || null;
      if (!exam) return { mode: request.mode, request, available_sets: data.set_count || 380 };
      const wantsAnswers = request.mode === "solve" || request.mode === "review" || /đáp án|answer|giải thích|正确答案|正确/i.test(String(text));
      return { mode: request.mode, request, quality_policy: AI_TUTOR_QUALITY_POLICY, writing_rubric: window.PandaHanGrammarPack?.writingRubric || null, catalog: { set_count: data.set_count, levels: data.levels }, exam: slimSet(exam, wantsAnswers), answerKey: wantsAnswers ? slimSet(exam, true) : null, answer_key_policy: "For HSK 3–6 practice items, return the exact correct answer (正确答案) and evidence-based explanation in solve/review mode; do not expose answers in create mode unless explicitly requested. Legacy answers are not authoritative after an item is rewritten." };
    } catch (error) {
      return { mode: request.mode, request, error: "CHATBOX_BANK_UNAVAILABLE", available_sets: 380 };
    }
  }

  window.PandaHanChatboxExamData = { loadBank, contextFor, parseRequest };
})();
