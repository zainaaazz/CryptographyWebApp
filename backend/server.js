const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const CryptoJS = require("crypto-js");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* --------------------- AES Routes --------------------- */

// AES text encryption
app.post("/encrypt/aes", (req, res) => {
  const { plaintext, key } = req.body;
  if (!plaintext || !key || key.length !== 16) {
    return res
      .status(400)
      .json({ error: "AES key must be 16 characters long." });
  }

  const ciphertext = CryptoJS.AES.encrypt(plaintext, key).toString();
  res.json({ ciphertext });
});

// AES text decryption
app.post("/decrypt/aes", (req, res) => {
  const { ciphertext, key } = req.body;
  if (!ciphertext || !key || key.length !== 16) {
    return res
      .status(400)
      .json({ error: "AES key must be 16 characters long." });
  }

  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  res.json({ plaintext });
});

// AES file encryption
app.post("/encrypt-file/aes", upload.single("file"), (req, res) => {
  try {
    const key = req.body.key;
    if (!req.file || !key || key.length !== 16) {
      return res
        .status(400)
        .send("Invalid file or AES key (must be 16 characters)");
    }

    const base64 = req.file.buffer.toString("base64");
    const encrypted = CryptoJS.AES.encrypt(base64, key).toString();
    res.send(encrypted);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to encrypt file");
  }
});

// AES file decryption
app.post("/decrypt-file/aes", upload.single("file"), (req, res) => {
  try {
    const key = req.body.key;
    if (!req.file || !key || key.length !== 16) {
      return res
        .status(400)
        .send("Invalid file or AES key (must be 16 characters)");
    }

    const encryptedText = req.file.buffer.toString("utf8");
    const decryptedBase64 = CryptoJS.AES.decrypt(encryptedText, key).toString(
      CryptoJS.enc.Utf8
    );
    const buffer = Buffer.from(decryptedBase64, "base64");

    res.setHeader("Content-Disposition", "attachment; filename=decrypted_file");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to decrypt file");
  }
});

/* --------------------- DES Routes --------------------- */

// DES text encryption
app.post("/encrypt/des", (req, res) => {
  const { plaintext, key } = req.body;
  if (!plaintext || !key || key.length !== 24) {
    return res
      .status(400)
      .json({ error: "DES key must be 24 characters long." });
  }

  const ciphertext = CryptoJS.TripleDES.encrypt(plaintext, key).toString();
  res.json({ ciphertext });
});

// DES text decryption
app.post("/decrypt/des", (req, res) => {
  const { ciphertext, key } = req.body;
  if (!ciphertext || !key || key.length !== 24) {
    return res
      .status(400)
      .json({ error: "DES key must be 24 characters long." });
  }

  const bytes = CryptoJS.TripleDES.decrypt(ciphertext, key);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  res.json({ plaintext });
});

// DES file encryption
app.post("/encrypt-file/des", upload.single("file"), (req, res) => {
  try {
    const key = req.body.key;
    if (!req.file || !key || key.length !== 24) {
      return res
        .status(400)
        .send("Invalid file or DES key (must be 24 characters)");
    }

    const base64 = req.file.buffer.toString("base64");
    const encrypted = CryptoJS.TripleDES.encrypt(base64, key).toString();
    res.send(encrypted);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to encrypt file");
  }
});

// DES file decryption
app.post("/decrypt-file/des", upload.single("file"), (req, res) => {
  try {
    const key = req.body.key;
    if (!req.file || !key || key.length !== 24) {
      return res
        .status(400)
        .send("Invalid file or DES key (must be 24 characters)");
    }

    const encryptedText = req.file.buffer.toString("utf8");
    const decryptedBase64 = CryptoJS.TripleDES.decrypt(
      encryptedText,
      key
    ).toString(CryptoJS.enc.Utf8);
    const buffer = Buffer.from(decryptedBase64, "base64");

    res.setHeader("Content-Disposition", "attachment; filename=decrypted_file");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to decrypt file");
  }
});

/* --------------------- Caesar Routes --------------------- */

function caesarEncrypt(text, shift) {
  return text
    .split("")
    .map((char) => {
      if (!char.match(/[a-zA-Z]/)) return char;
      const base = char === char.toUpperCase() ? 65 : 97;
      return String.fromCharCode(
        ((char.charCodeAt(0) - base + shift) % 26) + base
      );
    })
    .join("");
}

function caesarDecrypt(text, shift) {
  return caesarEncrypt(text, 26 - shift);
}

app.post("/encrypt/caesar", (req, res) => {
  const { plaintext, shift } = req.body;
  const shiftValue = parseInt(shift);
  if (!plaintext || isNaN(shiftValue)) {
    return res.status(400).json({ error: "Caesar key must be a number" });
  }
  const ciphertext = caesarEncrypt(plaintext, shiftValue);
  res.json({ ciphertext });
});

app.post("/decrypt/caesar", (req, res) => {
  const { ciphertext, shift } = req.body;
  const shiftValue = parseInt(shift);
  if (!ciphertext || isNaN(shiftValue)) {
    return res.status(400).json({ error: "Caesar key must be a number" });
  }
  const plaintext = caesarDecrypt(ciphertext, shiftValue);
  res.json({ plaintext });
});

// Start server
app.listen(port, () => {
  console.log(`🔐 Server is running at http://localhost:${port}`);
});
