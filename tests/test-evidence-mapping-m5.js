"use strict";
const path = require("path");
const memory = new Map();
global.localStorage = { getItem:key=>memory.get(key)||null, setItem:(key,value)=>memory.set(key,String(value)) };
global.storageNamespace = () => "learner-A";
const model = require(path.resolve(__dirname, "../js/vocabulary-learner-model.js"));
function check(value, message) { if (!value) throw new Error(message); process.stdout.write(`PASS ${message}\n`); }
function mapped(task) { return Object.fromEntries(model.mapEvidenceToDimensions({ task_type:task }).map(x=>[x.dimension,x.weight])); }

check(mapped("hanzi_recognition").form === 1, "Hanzi recognition maps to FORM");
check(mapped("pinyin_question").sound === 1, "Pinyin maps to SOUND");
check(mapped("meaning_question").meaning === 1 && mapped("meaning_question").production == null, "meaning MCQ maps only to MEANING, never PRODUCTION");
check(mapped("fill_in_context").usage === 1, "context fill maps to USAGE");
check(mapped("sentence_unscramble").usage === 0.8, "sentence ordering maps primarily to USAGE");
check(mapped("listening_sound_recognition").sound === 1 && mapped("pinyin_tone_quest").sound === 1, "listening and Tone Quest map to SOUND");
check(mapped("pronunciation").sound > mapped("pronunciation").production, "pronunciation has explicit SOUND-primary weights");
check(mapped("writing_task").production > mapped("writing_task").usage, "writing has explicit PRODUCTION-primary weights");
check(mapped("srs_review").form === 0.5 && mapped("srs_review").meaning === 0.5, "SRS recall mapping is explicit and does not alter SM-2");

function event(id, word, task, score, verified=true) { return { evidence_id:id, user:"learner-A", target_word:word, task_type:task, score, timestamp:1700000000000+Number(id.replace(/\D/g,"")||0), source:"verified-demo-task", attempt:1, response:score?"correct":"wrong", verified }; }
for (let i=1;i<=5;i++) model.recordEvidenceEvent(event(`m${i}`, "方便", "meaning_question", 1));
for (let i=1;i<=3;i++) model.recordEvidenceEvent(event(`u${i}`, "方便", "fill_in_context", 0));
const demo = model.getVocabularyProfile("方便");
check(demo.meaning.score > 0.8, "Learner A: five correct meaning answers produce high MEANING");
check(demo.usage.score < 0.3, "Learner A: three wrong usage answers produce low USAGE");
check(demo.meaning.score !== demo.usage.score, "MEANING and USAGE remain diagnostically distinct");
const log = demo.usage.evidence_log[0];
["user","target_word","task_type","dimension","score","timestamp","source","attempt","response","verified"].forEach(key=>check(Object.prototype.hasOwnProperty.call(log,key),`dimension evidence stores ${key}`));
const before = demo.sound.evidence_count;
model.recordEvidenceEvent(event("unverified1", "方便", "pronunciation", 1, false));
const after = model.getVocabularyProfile("方便");
check(after.sound.evidence_count === before, "unverified evidence is logged but cannot change a score");
check(after.evidence_events.some(item=>item.evidence_id === "unverified1" && item.verified === false), "unverified status is retained in the audit trail");
process.stdout.write("ALL MILESTONE 5 TESTS PASSED\n");
