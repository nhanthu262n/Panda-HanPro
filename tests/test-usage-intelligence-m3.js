"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");
const app01 = fs.readFileSync(path.join(root, "js/app-01.js"), "utf8");
const app02 = fs.readFileSync(path.join(root, "js/app-02.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
function check(value, message) { if (!value) throw new Error(message); process.stdout.write(`PASS ${message}\n`); }
function extractArray(source, marker) {
  const start = source.indexOf(marker), arrayStart = source.indexOf("[", start); let depth = 0, quote = "", escaped = false;
  for (let i = arrayStart; i < source.length; i += 1) { const c = source[i]; if (quote) { if (escaped) escaped = false; else if (c === "\\") escaped = true; else if (c === quote) quote = ""; continue; } if (c === '"' || c === "'") { quote = c; continue; } if (c === "[") depth += 1; if (c === "]" && --depth === 0) return source.slice(arrayStart, i + 1); }
  throw new Error("VOCAB_RAW not found");
}
const raw = vm.runInNewContext(`(${extractArray(app01, "const VOCAB_RAW =")})`);
const start = app02.indexOf('const VOCABULARY_INTELLIGENCE_SCHEMA_VERSION ='), end = app02.indexOf('const VOCAB = VOCAB_RAW.concat', start), sandbox = {};
vm.runInNewContext(`${app02.slice(start, end)}\nthis.api={normalizeVocabularyRecord,VOCABULARY_INTELLIGENCE_SAMPLES};`, sandbox);
const vocab = raw.map((item, index) => sandbox.api.normalizeVocabularyRecord(item, index));
const byChar = Object.fromEntries(vocab.map((item) => [item.char, item]));
const full = byChar["方便"];
check(full.usage_intelligence.collocations.includes("交通方便") && full.usage_intelligence.sentence_patterns.length && full.usage_intelligence.confusable_words.length && full.usage_intelligence.common_errors.length && full.usage_intelligence.contexts.length, "full Usage Intelligence record is available");
check(full.usage_intelligence.confusable_words.some((item) => item.word === "容易"), "方便 distinguishes 容易");
const legacy = vocab.find((item) => !sandbox.api.VOCABULARY_INTELLIGENCE_SAMPLES[item.char] && item.cumtu.length > 0);
check(legacy.usage_intelligence.collocations.length === legacy.cumtu.length, "legacy cumtu falls back to collocations");
const withoutPhrases = vocab.find((item) => item.cumtu.length === 0 && item.usage_intelligence.collocations.length === 0);
check(!!withoutPhrases && Array.isArray(withoutPhrases.examples), "word without phrases normalizes safely");
check(["dCumtuBox", "dCumtuList", "dExamplesList", "dSentencePatterns", "dConfusableWords", "dCommonErrors", "dRegisterContext"].every((id) => html.includes(`id="${id}"`)), "legacy and new Usage Intelligence DOM targets exist");
check(["collocations", "patterns", "confusables", "errors", "context", "examples"].every((key) => html.includes(`data-usage-panel="${key}"`)), "all six Usage Intelligence panels exist");
check(app02.includes("function renderUsageIntelligence") && app02.includes("definitions.filter") === false, "Usage Intelligence renderer is installed");
check(["nwUiCollocations", "nwUiPatterns", "nwUiConfusables", "nwUiErrors", "nwUiRegister", "nwUiContexts"].every((id) => app02.includes(`id="${id}"`)), "teacher Usage Intelligence fields exist");
check(app02.includes("loadCustomWordForEdit") && app02.includes("edit-custom-word"), "teacher can edit usage data");
check(css.includes(".usage-tabs{display:flex") && css.includes("overflow-x:auto") && css.includes("@media(max-width:600px){.usage-intelligence"), "mobile responsive tabs and cards exist");
check(app02.includes('L("Cụm từ", "Collocations")') && app02.includes('L("Lỗi thường gặp", "Common errors")'), "Vietnamese and English usage labels exist");
process.stdout.write("ALL MILESTONE 3 TESTS PASSED\n");
