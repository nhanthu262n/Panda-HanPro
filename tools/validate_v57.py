from pathlib import Path
import json, re, subprocess, sys
root=Path(__file__).resolve().parents[1]
errors=[]
cat=json.loads((root/'assets/research/vocabulary-intelligence-v57.json').read_text(encoding='utf-8'))
entries=cat.get('entries',[])
if len(entries)!=2254: errors.append(f'Expected 2254 entries, got {len(entries)}')
terms=[e.get('term') for e in entries]
if len(set(terms))!=len(terms): errors.append('Duplicate terms found')
counts={str(i):sum(1 for e in entries if str(e.get('hsk'))==str(i)) for i in (1,2,3)}
if counts!={'1':353,'2':672,'3':1229}: errors.append(f'HSK counts mismatch: {counts}')
if not all(e.get('sourceRefs') and 'GF0025_2021' in e['sourceRefs'] for e in entries): errors.append('Not all entries have sourceRefs/GF0025 target')
chars=[e for e in entries if e.get('entryType')=='character']
if not all('UNICODE_UNIHAN' in e.get('sourceRefs',[]) and 'MAKE_ME_A_HANZI' in e.get('sourceRefs',[]) for e in chars): errors.append('Character source targets incomplete')
# local resource references in index
html=(root/'index.html').read_text(encoding='utf-8')
for attr in re.findall(r'(?:src|href)="([^"]+)"',html):
    if attr.startswith(('http://','https://','data:','#','javascript:','about:')): continue
    rel=attr.split('?',1)[0].split('#',1)[0]
    if rel and not (root/rel).exists(): errors.append(f'Missing local resource: {rel}')
# required research/runtime artefacts
required=[
 'assets/research/source-registry-v57.json','assets/research/data-qa-report-v57.json',
 'assets/research/data-quality-corrections-v57.json','js/vocabulary-intelligence/vocabulary-intelligence-data.js',
 'js/ai-core/strategy-model.js','js/ai-core/session-reflection.js','tests/v57-core-integration-test.js'
]
for rel in required:
    if not (root/rel).exists(): errors.append(f'Missing required v57.1 artefact: {rel}')
# ensure fallback script is loaded before runtime loader
try:
    a=html.index('js/vocabulary-intelligence/vocabulary-intelligence-data.js')
    b=html.index('js/vocabulary-intelligence/vocabulary-intelligence.js')
    if a>b: errors.append('Vocabulary fallback is loaded after runtime loader')
except ValueError:
    errors.append('Vocabulary runtime/fallback script reference missing in index')
# validate source registry + correction audit
try:
    reg=json.loads((root/'assets/research/source-registry-v57.json').read_text(encoding='utf-8'))
    ids={x.get('id') for x in reg.get('sources',[])}
    if not {'PANTUTOR_CORE','UNICODE_UNIHAN','MAKE_ME_A_HANZI','CC_CEDICT','GF0025_2021'} <= ids:
        errors.append(f'Source registry incomplete: {sorted(ids)}')
except Exception as ex:
    errors.append(f'Source registry invalid: {ex}')
try:
    cor=json.loads((root/'assets/research/data-quality-corrections-v57.json').read_text(encoding='utf-8'))
    if len(cor.get('corrections',[])) != 13:
        errors.append(f'Expected 13 correction audit records, got {len(cor.get("corrections",[]))}')
except Exception as ex:
    errors.append(f'Correction audit invalid: {ex}')

# syntax check only new/modified AI files, excluding legacy malformed asset inherited unchanged
js_files=[
 'js/adaptive-learning-engine.js','js/app-02.js','js/daily-missions.js','js/data-quality-patch-v57.js','js/ai-learning-ui-v57.js',
 'js/ai-core/learning-evidence.js','js/ai-core/learner-model.js','js/ai-core/strategy-model.js','js/ai-core/session-reflection.js',
 'js/ai-core/diagnostic-engine.js','js/ai-core/pedagogical-planner.js','js/ai-core/teacher-governance.js',
 'js/vocabulary-intelligence/vocabulary-intelligence.js','js/vocabulary-intelligence/vocabulary-intelligence-data.js','service-worker.js'
]
for rel in js_files:
    p=root/rel
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if r.returncode: errors.append(f'JS syntax failed {rel}: {r.stderr.strip()}')
print(json.dumps({'entries':len(entries),'hsk':counts,'characters':len(chars),'word_or_phrase':len(entries)-len(chars),'errors':errors},ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
