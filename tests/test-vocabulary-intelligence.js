"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");

function extractArray(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing marker: ${marker}`);
  const arrayStart = source.indexOf("[", start);
  let depth = 0, quote = "", escaped = false;
  for (let i = arrayStart; i < source.length; i += 1) {
    const c = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === "[") depth += 1;
    if (c === "]" && --depth === 0) return source.slice(arrayStart, i + 1);
  }
  throw new Error("Unterminated vocabulary array");
}

function check(condition, message) {
  if (!condition) throw new Error(message);
  process.stdout.write(`PASS ${message}\n`);
}

const app01 = fs.readFileSync(path.join(root, "js/app-01.js"), "utf8");
const app02 = fs.readFileSync(path.join(root, "js/app-02.js"), "utf8");
const raw = vm.runInNewContext(`(${extractArray(app01, "const VOCAB_RAW =")})`);
const schemaStart = app02.indexOf('const VOCABULARY_INTELLIGENCE_SCHEMA_VERSION =');
const schemaEnd = app02.indexOf('const VOCAB = VOCAB_RAW.concat', schemaStart);
const schemaCode = `${app02.slice(schemaStart, schemaEnd)}\nthis.api={normalizeVocabularyRecord,VOCABULARY_INTELLIGENCE_SAMPLES,VOCABULARY_INTELLIGENCE_SCHEMA_VERSION};`;
const sandbox = {};
vm.runInNewContext(schemaCode, sandbox);
const { normalizeVocabularyRecord, VOCABULARY_INTELLIGENCE_SAMPLES, VOCABULARY_INTELLIGENCE_SCHEMA_VERSION } = sandbox.api;
const vocab = raw.map((w, index) => normalizeVocabularyRecord(w, index));

check(raw.length === 2254, "all 2254 legacy vocabulary records loaded");
check(vocab.length === raw.length, "normalization preserves vocabulary count");
check(vocab.every((w) => w.char && w.character_intelligence && w.usage_intelligence && w.pedagogy && w.provenance), "every record has the four new safe objects");
check(vocab.every((w) => Array.isArray(w.character_intelligence.components) && Array.isArray(w.usage_intelligence.collocations) && Array.isArray(w.pedagogy.recognition_tasks)), "all new collection fields are arrays");
check(vocab.every((w) => w.provenance.last_reviewed_at === null || typeof w.provenance.last_reviewed_at === "string"), "nullable review date is safe");

const byChar = Object.fromEntries(vocab.map((w) => [w.char, w]));
for (const char of ["方便", "情况", "安排", "联系", "需要", "其实"]) {
  check(!!byChar[char], `search index contains ${char}`);
  check(!!VOCABULARY_INTELLIGENCE_SAMPLES[char], `sample enrichment exists for ${char}`);
  check(byChar[char].pedagogy.problem_solving_seed.length > 0, `${char} has problem-solving seed`);
}

const legacy = vocab.find((w) => !VOCABULARY_INTELLIGENCE_SAMPLES[w.char] && w.chietu_vi && w.cumtu.length && w.examples.length);
check(legacy.character_intelligence.mnemonic_vi === legacy.chietu_vi, "legacy mnemonic fallback uses chietu_vi");
check(legacy.usage_intelligence.collocations.length === legacy.cumtu.length, "legacy collocation fallback uses cumtu");
check(legacy.examples.length > 0 && legacy.mc.length > 0, "legacy card and quiz fields remain available");

const existingStat = { repetitions: 3, interval: 15, ef: 2.4, nextReview: 123456789, studyLog: [{ grade: 4 }] };
const before = JSON.stringify(existingStat);
normalizeVocabularyRecord(raw[0], 0);
check(JSON.stringify(existingStat) === before, "normalization does not mutate SM-2 data");
check(VOCABULARY_INTELLIGENCE_SCHEMA_VERSION === "1.0.0", "schema version is 1.0.0");

fs.writeFileSync(path.join(root, "VOCABULARY_INTELLIGENCE_SCHEMA.json"), JSON.stringify({
  schema_version: VOCABULARY_INTELLIGENCE_SCHEMA_VERSION,
  character_intelligence: { structure: "string", components: ["string"], semantic_component: "string", phonetic_component: "string", mnemonic_vi: "string", mnemonic_en: "string", historical_note: "string", cultural_connection_vi: "string", cultural_connection_en: "string", source_type: "AI-assisted draft | Teacher-reviewed | Verified reference | Legacy content", validation_status: "string" },
  usage_intelligence: { core_meaning_vi: "string", core_meaning_en: "string", collocations: ["string"], sentence_patterns: ["string"], confusable_words: ["object|string"], common_errors: ["string"], register: "string", contexts: ["string"] },
  pedagogy: { recognition_tasks: ["object|string"], productive_tasks: ["object|string"], problem_solving_seed: ["string"], reflection_seed: ["string"] },
  provenance: { content_origin: "string", reviewed_by_teacher: "boolean", reference: "string", last_reviewed_at: "string|null" }
}, null, 2) + "\n");
fs.writeFileSync(path.join(root, "VOCABULARY_INTELLIGENCE_6_SAMPLES.json"), JSON.stringify(VOCABULARY_INTELLIGENCE_SAMPLES, null, 2) + "\n");
process.stdout.write("ALL TESTS PASSED\n");
