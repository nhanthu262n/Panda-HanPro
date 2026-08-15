(function () {
  'use strict';

  const loaderScript = document.currentScript;
  const baseUrl = new URL('./', loaderScript.src);
  const PARTS = [
    'pinyin-phonetics.part-01.js',
    'pinyin-phonetics.part-02.js',
    'pinyin-phonetics.part-03.js',
    'pinyin-phonetics.part-04.js',
    'pinyin-phonetics.part-05.js'
  ];
  let loadingPromise = null;
  let mounted = false;

  function getRoot() { return document.getElementById('pinyin-phonetics-root'); }

  function showLoading(done) {
    const el = getRoot();
    if (!el) return;
    const pct = Math.round((done / PARTS.length) * 100);
    el.innerHTML = `<div style="padding:28px;text-align:center;color:#9ca3af;font-weight:700">
      <div style="font-size:18px;margin-bottom:8px">Đang tải Ngữ âm Pinyin…</div>
      <div style="font-size:13px;margin-bottom:12px">Lần đầu cần tải dữ liệu âm thanh và flashcard.</div>
      <div style="height:8px;background:#fce7f3;border-radius:99px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#ec4899,#a855f7);transition:width .25s"></div>
      </div><div style="font-size:12px;margin-top:8px">${done}/${PARTS.length} phần đã tải</div>
    </div>`;
  }

  function showError(error) {
    console.error('PandaHán Pinyin loader error:', error);
    const el = getRoot();
    if (el) el.innerHTML = '<div style="padding:16px;color:#b91c1c;background:#fee2e2;border-radius:10px">Không tải được module Ngữ âm. Hãy kiểm tra mạng rồi nhấn Ctrl + F5 để thử lại.</div>';
  }

  function bytesFromDataUrl(dataUrl) {
    const comma = String(dataUrl || '').indexOf(',');
    if (comma < 0) return new Uint8Array();
    const raw = atob(String(dataUrl).slice(comma + 1));
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function analyzeWav(dataUrl) {
    const b = bytesFromDataUrl(dataUrl);
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    if (b.length < 44 || String.fromCharCode(...b.slice(0, 4)) !== 'RIFF') return null;
    let pos = 12, sampleRate = 44100, channels = 1, bits = 16, dataStart = -1, dataLen = 0;
    while (pos + 8 <= b.length) {
      const id = String.fromCharCode(...b.slice(pos, pos + 4));
      const len = dv.getUint32(pos + 4, true);
      if (id === 'fmt ' && pos + 24 <= b.length) {
        channels = dv.getUint16(pos + 10, true) || 1;
        sampleRate = dv.getUint32(pos + 12, true) || 44100;
        bits = dv.getUint16(pos + 22, true) || 16;
      }
      if (id === 'data') { dataStart = pos + 8; dataLen = Math.min(len, b.length - dataStart); break; }
      pos += 8 + len + (len % 2);
    }
    if (dataStart < 0 || dataLen < 4) return null;
    const bytesPerSample = Math.max(1, Math.ceil(bits / 8));
    const frameBytes = bytesPerSample * channels;
    const frames = Math.floor(dataLen / frameBytes);
    const samples = new Float32Array(frames);
    let sum = 0;
    for (let i = 0; i < frames; i++) {
      const off = dataStart + i * frameBytes;
      let value = 0;
      if (bits === 16) value = dv.getInt16(off, true) / 32768;
      else if (bits === 8) value = (dv.getUint8(off) - 128) / 128;
      else if (bits === 32) value = dv.getInt32(off, true) / 2147483648;
      samples[i] = value; sum += value * value;
    }
    return { samples, sampleRate, duration: frames / sampleRate, rms: Math.sqrt(sum / Math.max(1, frames)) };
  }

  function pitchContour(audio) {
    const { samples, sampleRate } = audio;
    const win = Math.max(512, Math.floor(sampleRate * 0.045));
    const hop = Math.max(256, Math.floor(sampleRate * 0.025));
    const values = [];
    for (let start = 0; start + win < samples.length; start += hop) {
      let energy = 0;
      for (let i = 0; i < win; i++) energy += samples[start + i] ** 2;
      if (Math.sqrt(energy / win) < 0.008) continue;
      let bestLag = 0, best = -Infinity;
      const minLag = Math.floor(sampleRate / 450), maxLag = Math.floor(sampleRate / 70);
      for (let lag = minLag; lag <= maxLag && lag < win - 1; lag++) {
        let corr = 0;
        for (let i = 0; i < win - lag; i++) corr += samples[start + i] * samples[start + i + lag];
        if (corr > best) { best = corr; bestLag = lag; }
      }
      if (bestLag) values.push(sampleRate / bestLag);
    }
    return values;
  }

  function offlineGrade(payload) {
    const audio = analyzeWav(payload.studentAudio);
    if (!audio) return { score: 45, feedback: 'Đã ghi âm nhưng không đọc được định dạng WAV để phân tích offline.', offline: true };
    const contour = pitchContour(audio);
    const tone = Number(payload.targetTone) || 1;
    const durationScore = Math.max(0, 1 - Math.abs(audio.duration - 0.65) / 1.2);
    const loudScore = Math.min(1, Math.max(0, (audio.rms - 0.008) / 0.08));
    let shapeScore = 0.5;
    let shapeText = 'đường thanh điệu chưa đủ rõ';
    if (contour.length >= 4) {
      const first = contour.slice(0, Math.max(1, Math.floor(contour.length * 0.25))).reduce((a,b)=>a+b,0) / Math.max(1, Math.floor(contour.length * 0.25));
      const mid = contour.slice(Math.floor(contour.length * 0.4), Math.ceil(contour.length * 0.6)).reduce((a,b)=>a+b,0) / Math.max(1, Math.ceil(contour.length * 0.6)-Math.floor(contour.length * 0.4));
      const last = contour.slice(Math.floor(contour.length * 0.75)).reduce((a,b)=>a+b,0) / Math.max(1, contour.length-Math.floor(contour.length*0.75));
      const norm = (x) => Math.max(-1, Math.min(1, x / 100));
      if (tone === 1) { shapeScore = 1 - Math.min(1, Math.abs(last - first) / 90); shapeText = 'giữ đường thanh điệu ngang'; }
      if (tone === 2) { shapeScore = (norm(last - first) + 1) / 2; shapeText = 'đường thanh điệu đi lên'; }
      if (tone === 3) { shapeScore = (norm(first - mid) + norm(last - mid) + 2) / 4; shapeText = 'hạ xuống rồi đi lên'; }
      if (tone === 4) { shapeScore = (norm(first - last) + 1) / 2; shapeText = 'đường thanh điệu đi xuống'; }
    }
    const score = Math.round(Math.max(20, Math.min(98, 100 * (0.55 * shapeScore + 0.25 * durationScore + 0.20 * loudScore))));
    const feedback = score >= 80
      ? `Tốt. Bản thu có ${shapeText}. Đây là điểm chấm offline trên thiết bị.`
      : score >= 60
        ? `Khá ổn, nhưng hãy luyện lại để ${shapeText} rõ hơn. Đây là điểm chấm offline trên thiết bị.`
        : `Hãy nói rõ và dài hơn một chút, đồng thời tập trung vào việc ${shapeText}. Đây là điểm chấm offline trên thiết bị.`;
    return { score, feedback, offline: true, duration: audio.duration, rms: audio.rms };
  }

  // Thay riêng request chấm điểm bằng bộ phân tích offline; các fetch khác giữ nguyên.
  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    if (String(url).includes('/api/pronunciation/grade')) {
      let payload = {};
      try { payload = JSON.parse((init && init.body) || '{}'); } catch (_) {}
      const result = offlineGrade(payload);
      return Promise.resolve(new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return originalFetch(input, init);
  };

  function hideVietnameseSubtitle() {
    const host = getRoot();
    const shadow = host && host.shadowRoot;
    if (!shadow) return;

    const walker = document.createTreeWalker(shadow, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    nodes.forEach((textNode) => {
      const text = (textNode.nodeValue || '').trim();
      if (!/^(Nghĩa tiếng Việt|Vietnamese meaning)[:：]?$/i.test(text)) return;

      const label = textNode.parentElement;
      if (!label) return;
      label.style.display = 'none';
      label.setAttribute('aria-hidden', 'true');

      // Ẩn luôn giá trị vietsub nằm ngay sau nhãn nếu chúng là hai node riêng.
      const next = label.nextElementSibling;
      if (next && next.textContent && next.textContent.trim().length < 120) {
        next.style.display = 'none';
        next.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function installVietnameseSubtitleHider() {
    const host = getRoot();
    if (!host || !host.shadowRoot) return;
    const shadow = host.shadowRoot;
    hideVietnameseSubtitle();
    if (!host.__subtitleObserver) {
      host.__subtitleObserver = new MutationObserver(() => {
        hideVietnameseSubtitle();
        queueMicrotask(hideVietnameseSubtitle);
      });
      host.__subtitleObserver.observe(shadow, { childList: true, subtree: true, characterData: true });
    }
    if (!host.__subtitleTimer) {
      let rounds = 0;
      host.__subtitleTimer = setInterval(() => {
        hideVietnameseSubtitle();
        if (++rounds >= 10) {
          clearInterval(host.__subtitleTimer);
          host.__subtitleTimer = null;
        }
      }, 500);
    }
  }

  window.loadPinyinPhonetics = function () {
    if (mounted && typeof window.__PANDAHAN_PHONETICS_MOUNT__ === 'function') return Promise.resolve();
    if (loadingPromise) return loadingPromise;
    showLoading(0);
    loadingPromise = (async function () {
      const responses = await Promise.all(PARTS.map((part) => fetch(new URL(part, baseUrl), { cache: 'force-cache' })));
      for (const response of responses) if (!response.ok) throw new Error(`Không tải được ${response.url} (${response.status})`);
      let done = 0;
      const texts = await Promise.all(responses.map(async (response) => { const t = await response.text(); showLoading(++done); return t; }));
      (0, eval)(texts.join(''));
      if (typeof window.__PANDAHAN_PHONETICS_MOUNT__ !== 'function') throw new Error('Bundle thiếu hàm mount Pinyin.');
      const el = getRoot();
      if (!el) throw new Error('Không tìm thấy vùng Ngữ âm.');
      window.__PANDAHAN_PHONETICS_ROOT__ = el;
      window.__PANDAHAN_PHONETICS_MOUNT__(el);
      mounted = true;
      setTimeout(installVietnameseSubtitleHider, 0);
      setTimeout(installVietnameseSubtitleHider, 300);
    })().catch((error) => { loadingPromise = null; mounted = false; showError(error); throw error; });
    return loadingPromise;
  };
})();
