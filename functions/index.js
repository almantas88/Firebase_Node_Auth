const functions = require("firebase-functions");

const admin = require("firebase-admin");
const serviceAccount = require("./DBkey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: true }));

// Routes
app.get("/", async (req, res) => {
  const dummyData = {
    email: "email@email.com",
    password: "password",
  };

  const response = await db.collection("users").add(dummyData);

  res.json({
    message: response.id,
  });
});

// Register a new user
app.post("/registration", async (req, res) => {
  const retrivedData = {
    email: req.body.email,
    password: req.body.password,
  };

  // Check if user email exists
  try {
    const userref = db.collection("users");
    const document = await userref
      .where("email", "==", retrivedData.email)
      .get();

    if (!document.empty) {
      return res.status(200).json({
        message: "User with this email already exists",
      });
    }
  } catch (error) {
    res.status(501).json({
      error: error,
    });
  }

  // Here would be hashing function
  retrivedData.password = "hashed";

  try {
    const response = await db.collection("users").add(retrivedData);

    res.status(200).json({
      data: retrivedData,
      message: "User creation succesful",
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

// Login an existing user
app.post("/login", async (req, res) => {
  const retrivedData = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    const userref = db.collection("users");
    const document = await userref
      .where("email", "==", retrivedData.email)
      .limit(1)
      .get();

    if (document.empty) {
      return res.status(200).json({
        message: "There is no user with this email",
      });
    }

    document.forEach((doc) => {
      console.log(doc.id, "=>", doc.data().email);
      if (doc.data().password == retrivedData.password) {
        return res.status(404).json({
          message: "Login succesful",
          token: "Token",
        });
      } else {
        return res.status(404).json({
          message: "incorrect password",
        });
      }
    });

  } catch (error) {
    res.status(501).json({
      error: error,
    });
  }
});

// Export the api to firebase cloud functions
exports.app = functions.https.onRequest(app);
