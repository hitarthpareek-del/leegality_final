const { initializeApp, cert } = require("firebase-admin/app");

const serviceAccount = require("./firebaseServiceAccount.json");

initializeApp({
  credential: cert(serviceAccount),
});

console.log("✅ Firebase Admin Initialized");