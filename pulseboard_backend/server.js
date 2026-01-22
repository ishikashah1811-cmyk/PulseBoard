const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

const User = require("./models/User");

/* ✅ ROOT TEST */
app.get("/", (req, res) => {
  res.status(200).send("OK WORKING");
});

/* ✅ MONGO TEST */
app.get("/test-user", async (req, res) => {
  try {
    const user = await User.create({
      name: "Test User",
      email: "Tgtestuser@gmail.com",
      googleId: "123456789",
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 7777;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(console.error);

app.post("/users", async (req, res) => {
  try {
    const { name, email, googleId } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res.status(200).json(user);
    }

    user = await User.create({
      name,
      email,
      googleId,
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

