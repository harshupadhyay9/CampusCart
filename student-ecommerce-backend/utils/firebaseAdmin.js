// backend/utils/firebaseAdmin.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or admin.credential.cert(serviceAccount)
  });
}

module.exports = admin;
