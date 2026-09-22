"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");
const app01 = fs.readFileSync(path.join(root, "js/app-01.js"), "utf8");
const app02 = fs.readFileSync(path.join(root, "js/app-02.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");

function check(condition, message) {
  if (!condition) throw new Error(message);
  process.stdout.write(`PASS ${message}\n`);
}
function extractArray(source, marker) {
  const start = source.indexOf(marker), arrayStart = source.indexOf("[", start);
  let depth = 0, quote = "", escaped = false;
  for (let i = arrayStart; i < source.length; i += 1) {
    const c = source[i];
    if (quote) { if (escaped) escaped = false; else if (c === "\\") escaped = true; else if (c === quote) quote = ""; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === "[") depth += 1;
    if (c === "]" && --depth === 0) return source.slice(arrayStart, i + 1);
  }
  throw new Error("Vocabulary array not found");
}

const raw = vm.runInNewContext(`(${extractArray(app01, "const VOCAB_RAW =")})`);
const schemaStart = app02.indexOf('const VOCABULARY_INTELLIGENCE_SCHEMA_VERSION =');
const schemaEnd = app02.indexOf('const VOCAB = VOCAB_RAW.concat', schemaStart);
const schemaSandbox = {};
vm.runInNewContext(`${app02.slice(schemaStart, schemaEnd)}\nthis.api={normalizeVocabularyRecord,VOCABULARY_INTELLIGENCE_SAMPLES};`, schemaSandbox);
const vocab = raw.map((word, index) => schemaSandbox.api.normalizeVocabularyRecord(word, index));
const byChar = Object.fromEntries(vocab.map((word) => [word.char, word]));

for (const char of ["方便", "情况", "安排", "联系", "需要", "其实"]) {
  const word = byChar[char];
  check(!!word, `${char} loads`);
  check(!!word.character_intelligence.validation_status, `${char} has content status`);
  check(!!(word.character_intelligence.mnemonic_vi || word.character_intelligence.mnemonic_en), `${char} has memory story`);
}

const legacy = vocab.find((word) => !schemaSandbox.api.VOCABULARY_INTELLIGENCE_SAMPLES[word.char] && word.chietu_vi);
check(legacy.character_intelligence.mnemonic_vi === legacy.chietu_vi, "legacy word falls back to chietu_vi");
check(/Legacy learning note/.test(app02), "legacy fallback label exists");
check(/Memory aid – not a historical etymology\./.test(app02), "memory-aid disclaimer exists");
check(/statusKey === "verified"/.test(app02), "historical note is gated by verified status");
check(/ciHistorical && \(ciValidation !== "Verified reference" \|\| !ciSource\)/.test(app02), "teacher historical-note validation is enforced");
check(["nwCiStructure", "nwCiComponents", "nwCiMnemonicVi", "nwCiHistorical", "nwCiCultureVi", "nwCiSource", "nwCiValidation"].every((id) => app02.includes(`id="${id}"`)), "teacher form uses separate intelligence fields");
check(html.includes('id="dChietuBox"') && html.includes('id="dChietuSource"') && html.includes('id="dChietu"'), "legacy Character Intelligence DOM ids are preserved");
check(css.includes("@media(max-width:600px)") && css.includes(".ci-clue-grid{grid-template-columns:1fr}"), "mobile Character Intelligence layout exists");
check(app02.includes('section("Cấu trúc chữ", "Character Structure"') && app02.includes('section("Liên hệ văn hóa", "Cultural Connection"'), "Vietnamese and English labels are implemented");
check(!/nwChietuVi|nwChietuEn/.test(app02), "single-field etymology-style teacher inputs were removed");
process.stdout.write("ALL MILESTONE 2 TESTS PASSED\n");
