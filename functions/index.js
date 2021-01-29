const functions = require("firebase-functions");

const admin = require("firebase-admin");
const serviceAccount = require("./DBkey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({origin: true}));

const db = admin.firestore();

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Succes",
  });
});

// Export the api to firebase cloud functions
exports.app = functions.https.onRequest(app);
