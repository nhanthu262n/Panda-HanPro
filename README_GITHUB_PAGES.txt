PandaHán Pro - GitHub Pages test build
ALL files are below 25 MB.

Important:
- pinyin-phonetics.part-XX.js files are text chunks of the original bundle.
- pinyin-phonetics-loader.js fetches all chunks in parallel, joins them in original order,
  and evaluates the original bundle once. Do not rename/reorder the chunks.
- Upload the CONTENTS of this folder to the repository root.
- GitHub: Settings -> Pages -> Deploy from a branch -> main -> /(root).


AI pronunciation scoring note:
The frontend calls https://pinyinteach-xct3ccac.manus.space/api/pronunciation/grade.
That API must allow the deployed GitHub Pages origin with CORS (OPTIONS and POST), for example https://nhanthu262n.github.io. This cannot be fixed by frontend-only code.
