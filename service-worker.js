const CACHE_NAME = "pandahan-runtime-chain-learning-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "SHOW_DUE_NOTIFICATION") return;
  const due = Number(data.due || 0);
  const mistakeDue = Number(data.mistakeDue || 0);
  const isEnglish = data.lang === "en";
  const title = isEnglish ? "PandaHán Pro study reminder" : "PandaHán Pro nhắc học";
  const body = isEnglish
    ? `${due ? `${due} SRS word${due === 1 ? "" : "s"}` : ""}${due && mistakeDue ? " and " : ""}${mistakeDue ? `${mistakeDue} wrong item${mistakeDue === 1 ? "" : "s"} to redo` : ""} are ready.`
    : `${due ? `Có ${due} từ SRS` : ""}${due && mistakeDue ? " và " : ""}${mistakeDue ? `${mistakeDue} lỗi cần làm lại` : ""}.`;
  event.waitUntil(self.registration.showNotification(title, {
    body,
    tag: "pandahan-due-review",
    renotify: false,
    icon: "",
    data: { url: self.location.origin + self.location.pathname },
  }));
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag !== "pandahan-due-check") return;
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    clients.forEach((client) => client.postMessage({ type: "REQUEST_DUE_CHECK" }));
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    const first = clients[0];
    if (first && "focus" in first) return first.focus();
    return self.clients.openWindow(event.notification.data?.url || self.location.origin);
  }));
});
