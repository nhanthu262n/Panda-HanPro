PandaHán Pro - GitHub Pages test build
ALL files are below 25 MB.

Important:
- pinyin-phonetics.part-XX.js files are text chunks of the original bundle.
- pinyin-phonetics-loader.js fetches all chunks in parallel, joins them in original order,
  and evaluates the original bundle once. Do not rename/reorder the chunks.
- Upload the CONTENTS of this folder to the repository root.
- GitHub: Settings -> Pages -> Deploy from a branch -> main -> /(root).


Frontend GitHub Pages build:
This package keeps the entire frontend on GitHub Pages. The Pinyin module is lazy-loaded only when the Ngữ âm tab is opened. The Pinyin quiz tab remains available, while the Vietnamese subtitle/meaning block is hidden in both lesson cards and quiz answer cards.

Real AI integration:
The loader sets window.__PINYIN_TEACHER_API_BASE__ to https://pinyinteach-xct3ccac.manus.space. The frontend sends the recorded WAV to /api/pronunciation/grade and displays the backend rubric fields: score, feedback, classification, toneScore/toneFeedback, segmentalScore/segmentalFeedback, articulationScore/articulationFeedback, and fluencyScore/fluencyFeedback.

Important: GitHub Pages cannot run the backend. The remote backend endpoint must answer OPTIONS and POST with CORS headers for the exact frontend origin, for example https://nhanthu262n.github.io. Do not put any AI key in this package.
