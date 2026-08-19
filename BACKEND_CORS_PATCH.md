# Backend CORS patch for the real AI endpoint

The GitHub Pages frontend now calls:

`https://pinyinteach-xct3ccac.manus.space/api/pronunciation/grade`

The backend must allow the exact frontend origin. Add this middleware before the pronunciation route in the backend server:

```ts
const allowedOrigins = new Set([
  "https://nhanthu262n.github.io",
  "http://localhost:8000",
  "http://localhost:8124",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});
```

Do not put `BUILT_IN_FORGE_API_KEY` in the HTML or GitHub repository. It must stay on the backend as an environment variable.
