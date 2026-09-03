/* PanTutor — Firebase web bootstrap for RTDB/Auth/Firestore integrations. */
(function () {
  "use strict";

  if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
    console.warn("Firebase SDK chưa được tải; ứng dụng tiếp tục ở chế độ offline.");
    return;
  }

  const firebaseConfig = {
    apiKey: "AIzaSyBhjivJYd16vazp4Mi5XSv4Hp_N3Jd14Q4",
    authDomain: "pandahanpro.firebaseapp.com",
    databaseURL: "https://pandahanpro-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pandahanpro",
    storageBucket: "pandahanpro.firebasestorage.app",
    messagingSenderId: "897241491720",
    appId: "1:897241491720:web:43e654aeadc08668cf64bd",
    measurementId: "G-1JRBVDYFED"
  };

  if (!window.firebase.apps || !window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }

  window.PandaHanFirebase = {
    app: window.firebase.app(),
    auth: typeof window.firebase.auth === "function" ? window.firebase.auth() : null,
    database: typeof window.firebase.database === "function" ? window.firebase.database() : null,
    firestore: typeof window.firebase.firestore === "function" ? window.firebase.firestore() : null
  };
})();
