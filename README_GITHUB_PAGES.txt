PandaHán Pro - GitHub Pages test build
ALL files are below 25 MB.

Important:
- pinyin-phonetics.part-XX.js files are text chunks of the original bundle.
- pinyin-phonetics-loader.js fetches all chunks in parallel, joins them in original order,
  and evaluates the original bundle once. Do not rename/reorder the chunks.
- Upload the CONTENTS of this folder to the repository root.
- GitHub: Settings -> Pages -> Deploy from a branch -> main -> /(root).


Offline scoring update:
Pronunciation scoring now runs locally in the browser and no longer calls the remote /api/pronunciation/grade endpoint. It estimates tone shape, duration and loudness from the recorded WAV. The Vietnamese subtitle/meaning block is hidden in both the lesson card and quiz answer cards; the Pinyin quiz tab remains available. Offline scoring returns the full rubric fields used by the feedback panel. Học, Luyện đọc, recording and offline scoring remain available.
