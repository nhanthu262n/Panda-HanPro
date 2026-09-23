/* PanTutor — Evidence-based Vocabulary Learner Model
   Answers WHAT the learner knows. SM-2 remains separate and answers WHEN to review. */
((root, factory) => {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PandaHanVocabularyLearnerModel = api;
})(typeof window !== "undefined" ? window : globalThis, (root) => {
  "use strict";

  const VERSION = 1;
  const DIMENSIONS = Object.freeze(["form", "sound", "meaning", "usage", "production"]);
  const STORAGE_PREFIX = "pandahan_vocabulary_learner_model_v1_";
  const BLOCKED_GENERATORS = /(?:openai|llm|gpt|generative[_ -]?ai|claude|gemini)/i;
  const MAX_EVIDENCE_LOG = 50;

  function clamp01(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }
  function safeObject(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
  function safeNamespace() {
    try {
      const value = typeof root.storageNamespace === "function" ? root.storageNamespace() : root.CURRENT_USER?.uid || root.CURRENT_USER?.username || root.firebase?.auth?.().currentUser?.uid || "guest";
      return String(value || "guest").replace(/[^a-zA-Z0-9_-]/g, "_");
    } catch (_) { return "guest"; }
  }
  function safeCharKey(char) { return encodeURIComponent(String(char || "").trim()).replace(/%/g, "_"); }
  function storageKey(char = "") { return STORAGE_PREFIX + (char ? safeCharKey(char) + "_" : "") + safeNamespace(); }
  function readStoredProfile(char) {
    try {
      const parsed = JSON.parse(root.localStorage?.getItem(storageKey(char)) || "null");
      return parsed && parsed.version === VERSION && parsed.profile ? parsed.profile : null;
    } catch (_) { return null; }
  }
  function writeStoredProfile(char, profile) {
    const value = { version: VERSION, learner_id: safeNamespace(), char: String(char), profile, updated_at: Date.now() };
    root.localStorage?.setItem(storageKey(char), JSON.stringify(value));
    return profile;
  }
  function confidenceForCount(count) {
    const n = Math.max(0, Number(count) || 0);
    if (n === 0) return "none";
    if (n < 3) return "low";
    if (n < 8) return "medium";
    return "high";
  }
  function emptyDimension() { return { score: 0, evidence_count: 0, confidence: "none", last_updated: null, evidence_log: [] }; }
  function normalizeDimension(value) {
    const source = safeObject(value);
    const count = Math.max(0, Math.floor(Number(source.evidence_count) || 0));
    return { score: clamp01(source.score), evidence_count: count, confidence: confidenceForCount(count), last_updated: source.last_updated == null ? null : Number(source.last_updated), evidence_log: Array.isArray(source.evidence_log) ? source.evidence_log.slice(-MAX_EVIDENCE_LOG) : [] };
  }
  function emptyProfile(char) {
    const profile = { char: String(char || ""), model: "Evidence-based Vocabulary Learner Model", schema_version: VERSION };
    DIMENSIONS.forEach((dimension) => { profile[dimension] = emptyDimension(); });
    return profile;
  }
  function normalizeProfile(char, value) {
    const source = safeObject(value), profile = emptyProfile(char);
    DIMENSIONS.forEach((dimension) => { profile[dimension] = normalizeDimension(source[dimension]); });
    return profile;
  }
  function getVocabularyProfile(char) {
    const key = String(char || "").trim();
    if (!key) return emptyProfile("");
    return normalizeProfile(key, readStoredProfile(key));
  }
  function normalizeEvidenceScore(evidence) {
    const raw = Number(evidence?.normalized_score ?? evidence?.score);
    if (!Number.isFinite(raw)) throw new Error("Evidence requires a numeric score.");
    return clamp01(raw > 1 && raw <= 100 ? raw / 100 : raw);
  }
  function validateEvidence(evidence) {
    const value = safeObject(evidence);
    const evidenceId = String(value.evidence_id || value.id || "").trim();
    const source = String(value.source || "").trim();
    const generator = String(value.generated_by || value.generator || "").trim();
    if (!evidenceId) throw new Error("Evidence requires evidence_id.");
    if (!source) throw new Error("Evidence requires source.");
    if (value.verified !== true) throw new Error("Only verified learner evidence may update the model.");
    if (BLOCKED_GENERATORS.test(`${source} ${generator}`)) throw new Error("LLM-generated values cannot update learner scores directly.");
    return { evidenceId, source, score: normalizeEvidenceScore(value), observedAt: Number(value.observed_at || value.timestamp || Date.now()), taskType: String(value.task_type || value.evidence_type || "objective_task"), result: value.result == null ? null : value.result };
  }
  function updateVocabularyDimension(char, dimension, evidence) {
    const key = String(char || "").trim();
    const dim = String(dimension || "").trim().toLowerCase();
    if (!key) throw new Error("Vocabulary character is required.");
    if (!DIMENSIONS.includes(dim)) throw new Error(`Dimension must be one of: ${DIMENSIONS.join(", ")}.`);
    const valid = validateEvidence(evidence);
    const profile = normalizeProfile(key, readStoredProfile(key));
    const previous = normalizeDimension(profile[dim]);
    if (previous.evidence_log.some((item) => item.evidence_id === valid.evidenceId)) return { profile, dimension: dim, idempotent: true };
    const nextScore = previous.evidence_count === 0 ? valid.score : clamp01(0.70 * previous.score + 0.30 * valid.score);
    const nextCount = previous.evidence_count + 1;
    profile[dim] = {
      score: Number(nextScore.toFixed(6)), evidence_count: nextCount, confidence: confidenceForCount(nextCount), last_updated: valid.observedAt,
      evidence_log: [...previous.evidence_log, { evidence_id: valid.evidenceId, source: valid.source, normalized_score: valid.score, observed_at: valid.observedAt, task_type: valid.taskType, result: valid.result }].slice(-MAX_EVIDENCE_LOG)
    };
    writeStoredProfile(key, profile);
    try { root.dispatchEvent?.(new CustomEvent("pandahan-vocabulary-model-updated", { detail: { char: key, dimension: dim, evidence_id: valid.evidenceId, score: profile[dim].score, source: valid.source } })); } catch (_) {}
    return { profile, dimension: dim, idempotent: false };
  }
  function getWeakestDimension(char) {
    const profile = getVocabularyProfile(char);
    const ranked = DIMENSIONS.map((dimension, index) => ({ dimension, ...profile[dimension], order: index })).sort((a, b) => a.score - b.score || a.evidence_count - b.evidence_count || a.order - b.order);
    const weakest = ranked[0];
    return { dimension: weakest.dimension, score: weakest.score, evidence_count: weakest.evidence_count, confidence: weakest.confidence, last_updated: weakest.last_updated };
  }
  function getProfileConfidence(char) {
    const profile = getVocabularyProfile(char);
    const counts = DIMENSIONS.map((dimension) => profile[dimension].evidence_count);
    const totalEvidence = counts.reduce((sum, count) => sum + count, 0);
    const coveredDimensions = counts.filter((count) => count > 0).length;
    const label = coveredDimensions === 5 && totalEvidence >= 40 ? "high" : coveredDimensions >= 3 && totalEvidence >= 12 ? "medium" : totalEvidence > 0 ? "low" : "none";
    return { confidence: label, total_evidence: totalEvidence, covered_dimensions: coveredDimensions, total_dimensions: DIMENSIONS.length };
  }
  function inferQuizDimension(meta = {}) {
    const source = String(meta.source || "").toLowerCase();
    const prompt = String(meta.prompt || "").toLowerCase();
    if (/unscramble|sentence|sắp xếp|造句/.test(`${source} ${prompt}`)) return "production";
    if (/context|ngữ cảnh|điền|fill/.test(`${source} ${prompt}`)) return "usage";
    if (/pinyin|thanh điệu|tone|pronun|sound/.test(`${source} ${prompt}`)) return "sound";
    if (/chữ hán|hanzi|character|form/.test(prompt)) return "form";
    return "meaning";
  }
  function recordObjectiveQuizEvidence(char, correct, meta = {}) {
    const now = Date.now();
    const source = String(meta.source || "vocabulary-quiz");
    const evidenceId = String(meta.evidence_id || `${source}:${safeNamespace()}:${char}:${now}:${correct ? 1 : 0}`);
    return updateVocabularyDimension(char, meta.dimension || inferQuizDimension(meta), { evidence_id: evidenceId, source, normalized_score: correct ? 1 : 0, verified: true, observed_at: now, task_type: meta.task_type || "objective_vocabulary_response", result: { correct: !!correct, prompt: String(meta.prompt || ""), expected: meta.expected ?? null, selected: meta.selected ?? null } });
  }

  return { DIMENSIONS, getVocabularyProfile, updateVocabularyDimension, getWeakestDimension, getProfileConfidence, recordObjectiveQuizEvidence, inferQuizDimension, confidenceForCount, storageKey };
});
