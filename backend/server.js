const express = require("express");
const cors = require("cors");
const multer = require("multer");
const CryptoJS = require("crypto-js");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const upload = multer();

/* ---------------- AES ---------------- */

app.post("/encrypt/aes", (req, res) => {
  const { plaintext, key } = req.body;
  if (!plaintext || key.length !== 16)
    return res.status(400).json({ error: "AES key must be 16 characters." });
  const ciphertext = CryptoJS.AES.encrypt(plaintext, key).toString();
  res.json({ ciphertext });
});

app.post("/decrypt/aes", (req, res) => {
  const { ciphertext, key } = req.body;
  if (!ciphertext || key.length !== 16)
    return res.status(400).json({ error: "AES key must be 16 characters." });
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  res.json({ plaintext });
});

app.post("/encrypt-file/aes", upload.single("file"), (req, res) => {
  const file = req.file;
  const key = req.body.key;
  if (!file || key.length !== 16)
    return res.status(400).send("Invalid file or AES key");
  try {
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.lib.WordArray.create(file.buffer),
      key
    ).toString();
    res.send(Buffer.from(encrypted));
  } catch {
    res.status(500).send("Encryption failed");
  }
});

app.post("/decrypt-file/aes", upload.single("file"), (req, res) => {
  const file = req.file;
  const key = req.body.key;
  if (!file || key.length !== 16)
    return res.status(400).send("Invalid file or AES key");
  try {
    const decrypted = CryptoJS.AES.decrypt(file.buffer.toString(), key);
    const result = Buffer.from(decrypted.toString(CryptoJS.enc.Utf8), "utf8");
    res.send(result);
  } catch {
    res.status(500).send("Decryption failed");
  }
});

/* ---------------- DES ---------------- */

app.post("/encrypt/des", (req, res) => {
  const { plaintext, key } = req.body;
  if (!plaintext || key.length !== 24)
    return res.status(400).json({ error: "DES key must be 24 characters." });
  const ciphertext = CryptoJS.TripleDES.encrypt(plaintext, key).toString();
  res.json({ ciphertext });
});

app.post("/decrypt/des", (req, res) => {
  const { ciphertext, key } = req.body;
  if (!ciphertext || key.length !== 24)
    return res.status(400).json({ error: "DES key must be 24 characters." });
  const bytes = CryptoJS.TripleDES.decrypt(ciphertext, key);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  res.json({ plaintext });
});

app.post("/encrypt-file/des", upload.single("file"), (req, res) => {
  const file = req.file;
  const key = req.body.key;
  if (!file || key.length !== 24)
    return res.status(400).send("Invalid file or DES key");
  try {
    const encrypted = CryptoJS.TripleDES.encrypt(
      CryptoJS.lib.WordArray.create(file.buffer),
      key
    ).toString();
    res.send(Buffer.from(encrypted));
  } catch {
    res.status(500).send("Encryption failed");
  }
});

app.post("/decrypt-file/des", upload.single("file"), (req, res) => {
  const file = req.file;
  const key = req.body.key;
  if (!file || key.length !== 24)
    return res.status(400).send("Invalid file or DES key");
  try {
    const decrypted = CryptoJS.TripleDES.decrypt(file.buffer.toString(), key);
    const result = Buffer.from(decrypted.toString(CryptoJS.enc.Utf8), "utf8");
    res.send(result);
  } catch {
    res.status(500).send("Decryption failed");
  }
});

/* ---------------- Caesar ---------------- */

const caesarShift = (text, shift, decrypt = false) => {
  if (decrypt) shift = (26 - shift) % 26;
  return text.replace(/[a-z]/gi, (char) => {
    const base = char <= "Z" ? 65 : 97;
    return String.fromCharCode(
      ((char.charCodeAt(0) - base + shift) % 26) + base
    );
  });
};

app.post("/encrypt/caesar", (req, res) => {
  const { plaintext, shift } = req.body;
  const shiftValue = parseInt(shift);
  if (!plaintext || isNaN(shift))
    return res.status(400).json({ error: "Invalid Caesar key" });
  res.json({ ciphertext: caesarShift(plaintext, shift) });
});

app.post("/decrypt/caesar", (req, res) => {
  const { ciphertext, shift } = req.body;
  const shiftValue = parseInt(shift);
  if (!ciphertext || isNaN(shift))
    return res.status(400).json({ error: "Invalid Caesar key" });
  res.json({ plaintext: caesarShift(ciphertext, shift, true) });
});

/* ---------------- Vernam ---------------- */

function xorStrings(a, b) {
  return a
    .split("")
    .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ b.charCodeAt(i)))
    .join("");
}

app.post("/encrypt/vernam", (req, res) => {
  const { plaintext, key } = req.body;
  if (!plaintext || !key || plaintext.length !== key.length)
    return res.status(400).json({ error: "Key must match plaintext length" });
  const ciphertext = xorStrings(plaintext, key);
  res.json({ ciphertext: Buffer.from(ciphertext).toString("base64") });
});

app.post("/decrypt/vernam", (req, res) => {
  const { ciphertext, key } = req.body;
  if (!ciphertext || !key)
    return res.status(400).json({ error: "Missing ciphertext or key" });

  const decoded = Buffer.from(ciphertext, "base64").toString();
  if (decoded.length !== key.length)
    return res.status(400).json({ error: "Key must match ciphertext length" });

  const plaintext = xorStrings(decoded, key);
  res.json({ plaintext });
});

app.post("/encrypt-file/vernam", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;
  if (!file || !key || key.length !== file.buffer.length)
    return res.status(400).send("Key length must match file size");

  const encrypted = Buffer.alloc(file.buffer.length);
  for (let i = 0; i < file.buffer.length; i++) {
    encrypted[i] = file.buffer[i] ^ key.charCodeAt(i);
  }
  res.send(encrypted);
});

app.post("/decrypt-file/vernam", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;
  if (!file || !key || key.length !== file.buffer.length)
    return res.status(400).send("Key length must match file size");

  const decrypted = Buffer.alloc(file.buffer.length);
  for (let i = 0; i < file.buffer.length; i++) {
    decrypted[i] = file.buffer[i] ^ key.charCodeAt(i);
  }
  res.send(decrypted);
});

/* ---------------- Vigenère ---------------- */

function vigenere(text, key, decrypt = false) {
  const keyLen = key.length;
  return text
    .split("")
    .map((char, i) => {
      if (!char.match(/[a-zA-Z]/)) return char;
      const base = char <= "Z" ? 65 : 97;
      const k = key[i % keyLen].toLowerCase().charCodeAt(0) - 97;
      const shift = decrypt ? 26 - k : k;
      return String.fromCharCode(
        ((char.charCodeAt(0) - base + shift) % 26) + base
      );
    })
    .join("");
}

app.post("/encrypt/vigenere", (req, res) => {
  const { plaintext, key } = req.body;
  if (!plaintext || !key)
    return res.status(400).json({ error: "Missing data" });
  res.json({ ciphertext: vigenere(plaintext, key, false) });
});

app.post("/decrypt/vigenere", (req, res) => {
  const { ciphertext, key } = req.body;
  if (!ciphertext || !key)
    return res.status(400).json({ error: "Missing data" });
  res.json({ plaintext: vigenere(ciphertext, key, true) });
});

app.post("/encrypt-file/vigenere", upload.single("file"), (req, res) => {
  const file = req.file;
  const key = req.body.key;
  if (!file || !key) return res.status(400).send("Missing file or key");
  
  // Convert buffer to array of bytes
  const inputBytes = Array.from(file.buffer);
  const outputBytes = inputBytes.map((byte, i) => {
    const k = key[i % key.length].toLowerCase().charCodeAt(0) - 97;
    return (byte + k) % 256;
  });
  
  const output = Buffer.from(outputBytes);
  res.setHeader('Content-Type', file.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename="encrypted_${file.originalname}"`);
  res.send(output);
});

app.post("/decrypt-file/vigenere", upload.single("file"), (req, res) => {
  const file = req.file;
  const key = req.body.key;
  if (!file || !key) return res.status(400).send("Missing file or key");
  
  // Convert buffer to array of bytes
  const inputBytes = Array.from(file.buffer);
  const outputBytes = inputBytes.map((byte, i) => {
    const k = key[i % key.length].toLowerCase().charCodeAt(0) - 97;
    return (byte - k + 256) % 256;
  });
  
  const output = Buffer.from(outputBytes);
  res.setHeader('Content-Type', file.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename="decrypted_${file.originalname}"`);
  res.send(output);
});

/* ---------------- Server Start ---------------- */

app.listen(port, () => {
  console.log(`🔐 Server is running at http://localhost:${port}`);
});
