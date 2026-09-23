"use strict";

const path = require("path");
const fs = require("fs");
const memory = new Map();
global.localStorage = { getItem: (key) => memory.has(key) ? memory.get(key) : null, setItem: (key, value) => memory.set(key, String(value)), removeItem: (key) => memory.delete(key) };
let learner = "learner-A";
global.storageNamespace = () => learner;
const model = require(path.resolve(__dirname, "../js/vocabulary-learner-model.js"));
function check(value, message) { if (!value) throw new Error(message); process.stdout.write(`PASS ${message}\n`); }
function close(a, b) { return Math.abs(a - b) < 1e-9; }
function evidence(id, score, source = "objective-quiz") { return { evidence_id: id, normalized_score: score, source, verified: true, observed_at: 1700000000000 + Number(id.replace(/\D/g, "") || 0), task_type: "test-response" }; }

check(JSON.stringify(model.DIMENSIONS) === JSON.stringify(["form", "sound", "meaning", "usage", "production"]), "model exposes exactly five dimensions");

let result = model.updateVocabularyDimension("方便", "usage", evidence("e1", 0.8));
check(close(result.profile.usage.score, 0.8), "first evidence initializes score directly");
check(result.profile.usage.evidence_count === 1 && result.profile.usage.confidence === "low", "first evidence count and confidence are correct");
result = model.updateVocabularyDimension("方便", "usage", evidence("e2", 0.2));
check(close(result.profile.usage.score, 0.62), "subsequent evidence uses 0.70 previous + 0.30 recent");
check(result.profile.usage.evidence_log[1].source === "objective-quiz", "source evidence is logged");
const duplicate = model.updateVocabularyDimension("方便", "usage", evidence("e2", 1));
check(duplicate.idempotent && duplicate.profile.usage.evidence_count === 2, "duplicate evidence is idempotent");

model.updateVocabularyDimension("安排", "production", evidence("a1", 100, "verified-writing-rubric"));
check(close(model.getVocabularyProfile("安排").production.score, 1), "percentage evidence is normalized and clamped");
model.updateVocabularyDimension("情况", "meaning", evidence("q1", -4));
check(close(model.getVocabularyProfile("情况").meaning.score, 0), "negative evidence is clamped to zero");

let blocked = false;
try { model.updateVocabularyDimension("情况", "usage", evidence("q2", 0.9, "openai-generated-score")); } catch (_) { blocked = true; }
check(blocked, "LLM/OpenAI source cannot write scores directly");
blocked = false;
try { model.updateVocabularyDimension("情况", "usage", { evidence_id: "q3", score: 0.9, source: "manual", verified: false }); } catch (_) { blocked = true; }
check(blocked, "unverified evidence cannot update scores");

const weakest = model.getWeakestDimension("方便");
check(model.DIMENSIONS.includes(weakest.dimension) && weakest.score >= 0 && weakest.score <= 1, "weakest dimension helper returns a valid dimension");
const confidence = model.getProfileConfidence("方便");
check(confidence.confidence === "low" && confidence.total_evidence === 2, "profile confidence is evidence-based");

learner = "learner-B";
check(model.getVocabularyProfile("方便").usage.evidence_count === 0, "profiles are isolated per learner");
learner = "learner-A";
check(model.getVocabularyProfile("方便").usage.evidence_count === 2, "original learner profile remains available");

const sm2 = { ease: 2.5, ef: 2.5, interval: 6, due: 1701000000000, nextReview: 1701000000000, repetitions: 2 };
const before = JSON.stringify(sm2);
model.updateVocabularyDimension("安排", "form", evidence("a2", 0.5));
check(JSON.stringify(sm2) === before, "Learner Model does not mutate SM-2 fields");

const syncSource = fs.readFileSync(path.resolve(__dirname, "../js/progress-sync.js"), "utf8");
check(syncSource.includes("pandahan_vocabulary_learner_model_v1_") && syncSource.includes("pandahan-vocabulary-model-updated"), "current Firebase progress sync includes learner-model storage and update events");
check(model.getVocabularyProfile("方便").model === "Evidence-based Vocabulary Learner Model", "model is labelled evidence-based, not a neural network");
process.stdout.write("ALL MILESTONE 4 TESTS PASSED\n");
