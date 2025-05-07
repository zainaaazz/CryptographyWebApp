const express = require("express");
const cors = require("cors");
const multer = require("multer");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const swaggerDocs = require("./swagger");

const app = express();
const port = 5000;

app.use(
  cors({
    exposedHeaders: ["Content-Disposition"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    fieldSize: 100 * 1024 * 1024, // 100MB max field size
  },
});

/* ---------------- AES ---------------- */

/**
 * @swagger
 * tags:
 *   name: AES
 *   description: AES encryption and decryption
 */

/**
 * @swagger
 * /encrypt/aes:
 *   post:
 *     summary: Encrypt plaintext using AES
 *     tags: [AES]
 *     description: Encrypts a plaintext string using AES encryption with a 16-character key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plaintext:
 *                 type: string
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns AES-encrypted ciphertext
 */

app.post("/encrypt/aes", (req, res) => {
  const { plaintext, key } = req.body;
  if (!plaintext || key.length !== 16)
    return res.status(400).json({ error: "AES key must be 16 characters." });

  const ciphertext = CryptoJS.AES.encrypt(plaintext, key).toString();
  res.json({ ciphertext });
});

/**
 * @swagger
 * /decrypt/aes:
 *   post:
 *     summary: Decrypt AES ciphertext
 *     tags: [AES]
 *     description: Decrypts AES ciphertext using the provided 16-character key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ciphertext:
 *                 type: string
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns decrypted plaintext
 */

app.post("/decrypt/aes", (req, res) => {
  const { ciphertext, key } = req.body;
  if (!ciphertext || key.length !== 16)
    return res.status(400).json({ error: "AES key must be 16 characters." });

  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  res.json({ plaintext });
});

/**
 * @swagger
 * /encrypt-file/aes:
 *   post:
 *     summary: Encrypt file using AES
 *     tags: [AES]
 *     description: Encrypts an uploaded file using AES encryption.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns encrypted file
 */

app.post("/encrypt-file/aes", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;
  if (!file || key.length !== 16)
    return res.status(400).send("Invalid file or AES key");

  const cipher = crypto.createCipheriv("aes-128-ecb", Buffer.from(key), null);
  const encrypted = Buffer.concat([cipher.update(file.buffer), cipher.final()]);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=encrypted_${file.originalname}`
  );
  res.setHeader("Content-Type", "application/octet-stream");
  res.send(encrypted);
});

/**
 * @swagger
 * /decrypt-file/aes:
 *   post:
 *     summary: Decrypt file encrypted with AES
 *     tags: [AES]
 *     description: Decrypts an AES-encrypted uploaded file.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns decrypted file
 */

app.post("/decrypt-file/aes", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;
  if (!file || key.length !== 16)
    return res.status(400).send("Invalid file or AES key");

  const decipher = crypto.createDecipheriv(
    "aes-128-ecb",
    Buffer.from(key),
    null
  );
  const decrypted = Buffer.concat([
    decipher.update(file.buffer),
    decipher.final(),
  ]);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=decrypted_${file.originalname}`
  );
  res.send(decrypted);
});

/* ---------------- DES (TripleDES) ---------------- */

/**
 * @swagger
 * tags:
 *   name: DES
 *   description: DES (TripleDES) encryption and decryption
 */

/**
 * @swagger
 * /encrypt/des:
 *   post:
 *     summary: Encrypt plaintext using DES (TripleDES)
 *     tags: [DES]
 *     description: Encrypts plaintext with a 24-character key using TripleDES encryption.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plaintext:
 *                 type: string
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns DES-encrypted ciphertext
 */

app.post("/encrypt/des", (req, res) => {
  const { plaintext, key } = req.body;
  if (!plaintext || key.length !== 24)
    return res.status(400).json({ error: "DES key must be 24 characters." });

  const ciphertext = CryptoJS.TripleDES.encrypt(plaintext, key).toString();
  res.json({ ciphertext });
});

/**
 * @swagger
 * /decrypt/des:
 *   post:
 *     summary: Decrypt DES ciphertext
 *     tags: [DES]
 *     description: Decrypts TripleDES ciphertext using the provided 24-character key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ciphertext:
 *                 type: string
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns decrypted plaintext
 */

app.post("/decrypt/des", (req, res) => {
  const { ciphertext, key } = req.body;
  if (!ciphertext || key.length !== 24)
    return res.status(400).json({ error: "DES key must be 24 characters." });

  const bytes = CryptoJS.TripleDES.decrypt(ciphertext, key);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  res.json({ plaintext });
});

/**
 * @swagger
 * /encrypt-file/des:
 *   post:
 *     summary: Encrypt file using DES
 *     tags: [DES]
 *     description: Encrypts an uploaded file using TripleDES encryption.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns encrypted file
 */

app.post("/encrypt-file/des", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;
  if (!file || key.length !== 24)
    return res.status(400).send("Invalid file or DES key");

  const cipher = crypto.createCipheriv("des-ede3", Buffer.from(key), null);

  const encrypted = Buffer.concat([cipher.update(file.buffer), cipher.final()]);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=encrypted_${file.originalname}`
  );
  res.send(encrypted);
});

/**
 * @swagger
 * /decrypt-file/des:
 *   post:
 *     summary: Decrypt file encrypted with DES
 *     tags: [DES]
 *     description: Decrypts a TripleDES-encrypted file.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns decrypted file
 */

app.post("/decrypt-file/des", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;
  if (!file || key.length !== 24)
    return res.status(400).send("Invalid file or DES key");

  const decipher = crypto.createDecipheriv("des-ede3", Buffer.from(key), null);
  const decrypted = Buffer.concat([
    decipher.update(file.buffer),
    decipher.final(),
  ]);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=decrypted_${file.originalname}`
  );
  res.send(decrypted);
});

/* ---------------- Vernam ---------------- */

/**
 * @swagger
 * tags:
 *   name: Vernam
 *   description: Vernam (XOR) encryption and decryption
 */

function xorBuffer(buffer, keyBuffer) {
  const result = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    result[i] = buffer[i] ^ keyBuffer[i];
  }
  return result;
}

/**
 * @swagger
 * /encrypt/vernam:
 *   post:
 *     summary: Encrypt plaintext using Vernam cipher
 *     tags: [Vernam]
 *     description: Encrypts plaintext using bitwise XOR with a key of the same length.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plaintext:
 *                 type: string
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns base64-encoded ciphertext
 */


/**
 * @swagger
 * /decrypt/vernam:
 *   post:
 *     summary: Decrypt Vernam ciphertext
 *     tags: [Vernam]
 *     description: Decrypts a Vernam-encrypted base64 ciphertext using XOR with the key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ciphertext:
 *                 type: string
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns decrypted plaintext
 */


/**
 * @swagger
 * /encrypt-file/vernam:
 *   post:
 *     summary: Encrypt file using Vernam cipher
 *     tags: [Vernam]
 *     description: Encrypts a file using Vernam XOR cipher. The key must match the file size.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns encrypted file
 */

app.post("/encrypt-file/vernam", upload.single("file"), (req, res) => {
  const fileBuffer = req.file.buffer; //Retrieves the raw binary content of the uploaded file.
  const key = Buffer.from(req.body.key, "latin1");

  if (key.length !== fileBuffer.length) {
    return res.status(400).send("Key must be the same length as the file.");
  }

  const encryptedBuffer = Buffer.alloc(fileBuffer.length);
  for (let i = 0; i < fileBuffer.length; i++) {
    encryptedBuffer[i] = fileBuffer[i] ^ key[i];
  }

  const originalName =
    req.file.originalname.split(".").slice(0, -1).join(".") || "file";
  const extension = req.file.originalname.split(".").pop();
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${originalName} - VernamEncrypted.${extension}"`
  );

  res.setHeader("Content-Type", "application/octet-stream");
  res.send(encryptedBuffer);
});

/**
 * @swagger
 * /decrypt-file/vernam:
 *   post:
 *     summary: Decrypt file encrypted with Vernam cipher
 *     tags: [Vernam]
 *     description: Decrypts a Vernam-encrypted file using the XOR method.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns decrypted file
 */

//VERNAM DECRYPT FILE
app.post("/decrypt-file/vernam", upload.single("file"), (req, res) => {
  const encryptedBuffer = req.file.buffer; //Retrieves the raw binary content of the uploaded encrypted file.
  const key = Buffer.from(req.body.key, "latin1"); //converts key into byte buffer using latin1

  if (key.length !== encryptedBuffer.length) {
    return res.status(400).send("Key must be the same length as the file.");
  }

  const decryptedBuffer = Buffer.alloc(encryptedBuffer.length);
  for (let i = 0; i < encryptedBuffer.length; i++) {
    decryptedBuffer[i] = encryptedBuffer[i] ^ key[i];
  }

  const originalName =
    req.file.originalname.split(".").slice(0, -1).join(".") || "file";
  const extension = req.file.originalname.split(".").pop();
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${originalName} - VernamDecrypted.${extension}"`
  );

  res.setHeader("Content-Type", "application/octet-stream");
  res.send(decryptedBuffer);
});

//VERNAM GENERATE KEY
app.post("/generate-vernam-key", (req, res) => {
  console.log("Body received:", req.body);

  const { fileSize } = req.body;

  if (!fileSize || isNaN(fileSize)) {
    return res.status(400).send("Invalid file size");
  }

  const size = parseInt(fileSize);

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
  let key = "";

  for (let i = 0; i < size; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  res.send(key);
});

/* ---------------- Vigenere ---------------- */

/**
 * @swagger
 * tags:
 *   name: Vigenere
 *   description: Vigenere encryption and decryption
 */

function vigenereBuffer(buffer, key, decrypt = false) {
  const output = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    const k = key[i % key.length].toLowerCase().charCodeAt(0) - 97;
    output[i] = decrypt ? (buffer[i] - k + 256) % 256 : (buffer[i] + k) % 256;
  }
  return output;
}

/**
 * @swagger
 * /encrypt/vigenere:
 *   post:
 *     summary: Encrypt plaintext using Vigenère cipher
 *     tags: [Vigenere]
 *     description: Encrypts plaintext using Vigenère cipher with alphabetic shifting based on a key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plaintext:
 *                 type: string
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns Vigenère-encrypted ciphertext
 */

app.post("/encrypt/vigenere", (req, res) => {
  const { plaintext, key } = req.body;
  if (!plaintext || !key)
    return res.status(400).json({ error: "Missing data." });

  const ciphertext = vigenereBuffer(
    Buffer.from(plaintext),
    key,
    false
  ).toString("base64");
  res.json({ ciphertext });
});

/**
 * @swagger
 * /decrypt/vigenere:
 *   post:
 *     summary: Decrypt Vigenère ciphertext
 *     tags: [Vigenere]
 *     description: Decrypts a Vigenère-encrypted ciphertext using the key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ciphertext:
 *                 type: string
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns decrypted plaintext
 */

app.post("/decrypt/vigenere", (req, res) => {
  const { ciphertext, key } = req.body;
  if (!ciphertext || !key)
    return res.status(400).json({ error: "Missing data." });

  const decoded = Buffer.from(ciphertext, "base64");
  const plaintext = vigenereBuffer(decoded, key, true).toString();
  res.json({ plaintext });
});

/**
 * @swagger
 * /encrypt-file/vigenere:
 *   post:
 *     summary: Encrypt file using Vigenère cipher
 *     tags: [Vigenere]
 *     description: Encrypts uploaded text file using Vigenère cipher based on a key.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns encrypted file
 */

//VIGENERE ENCRYPT FILE
app.post("/encrypt-file/vigenere", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;
  if (!file || !key) return res.status(400).send("Missing file or key.");

  const encrypted = vigenereBuffer(file.buffer, key, false);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=encrypted_${file.originalname}`
  );
  res.send(encrypted);
});

/**
 * @swagger
 * /decrypt-file/vigenere:
 *   post:
 *     summary: Decrypt file encrypted with Vigenère cipher
 *     tags: [Vigenere]
 *     description: Decrypts Vigenère-encrypted uploaded text files.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns decrypted file
 */

//VIGENERE DECRYPT FILE
app.post("/decrypt-file/vigenere", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;
  if (!file || !key) return res.status(400).send("Missing file or key.");

  const decrypted = vigenereBuffer(file.buffer, key, true);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=decrypted_${file.originalname}`
  );
  res.send(decrypted);
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

/**
 * @swagger
 * tags:
 *   name: Ceasar
 *   description: Ceasar encryption and decryption
 */

/**
 * @swagger
 * /encrypt/caesar:
 *   post:
 *     summary: Encrypt plaintext using Caesar cipher
 *     tags: [Ceasar]
 *     description: Encrypts plaintext by shifting letters based on a numeric key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plaintext:
 *                 type: string
 *               key:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Returns Caesar-encrypted ciphertext
 */

app.post("/encrypt/caesar", (req, res) => {
  const { plaintext, shift } = req.body;
  const shiftValue = parseInt(shift);
  if (!plaintext || isNaN(shift))
    return res.status(400).json({ error: "Invalid Caesar key" });
  res.json({ ciphertext: caesarShift(plaintext, shift) });
});

/**
 * @swagger
 * /decrypt/caesar:
 *   post:
 *     summary: Decrypt Caesar ciphertext
 *     tags: [Ceasar]
 *     description: Decrypts Caesar cipher using a numeric shift value.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ciphertext:
 *                 type: string
 *               key:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Returns decrypted plaintext
 */

app.post("/decrypt/caesar", (req, res) => {
  const { ciphertext, shift } = req.body;
  const shiftValue = parseInt(shift);
  if (!ciphertext || isNaN(shift))
    return res.status(400).json({ error: "Invalid Caesar key" });
  res.json({ plaintext: caesarShift(ciphertext, shift, true) });
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=decrypted_${file.originalname}`
  );
  res.send(decrypted);
});


//handles both encryption and decryption of file buffers using XOR, transposition logic, and noise injection.
function mutateBuffer(buffer, key, decrypt = false) {
  const mutated = [];
  const interval = (key.length % 50) + 50; //Calculates how often to insert noise characters.
  //Ensures a noise character is added every 50–99 bytes, depending on key length.
  const noiseChar = 42;

  console.log(`🔧 Mode: ${decrypt ? "Decrypt" : "Encrypt"}`);
  console.log(`📄 Buffer length: ${buffer.length}`);
  console.log(`🔑 Key length: ${key.length}`);
  console.log(`📐 Noise interval: ${interval}`);

  if (!decrypt) {
    for (let i = 0; i < buffer.length; i++) { //loops through every byte in file buffer
      const byte = buffer[i] ^ key.charCodeAt(i % key.length); 
      //XOR encryption betw byte and corr char in the key (repeating the key if needed).

      mutated.push(byte);//stores encrypted byte in array.
      if ((i + 1) % interval === 0) mutated.push(noiseChar); //insert noise after every interval
    }
  } else {//runs when decrypt = true
    let skip = 0;
    for (let i = 0; i < buffer.length; i++) { 
      if ((i + 1) % (interval + 1) === 0) continue;
      const byte = buffer[i] ^ key.charCodeAt(skip % key.length);
      mutated.push(byte);
      skip++;
    }
  }

  console.log(`✅ Final mutated length: ${mutated.length}`);
  return Buffer.from(mutated);
}

app.post("/encrypt/custom", (req, res) => {
  const { plaintext, key } = req.body;
  if (!plaintext || !key) return res.status(400).send("Missing data.");

  // Step 1: Substitution using XOR with each key character
  let substituted = '';
  for (let i = 0; i < plaintext.length; i++) {
    const charCode = plaintext.charCodeAt(i);
    const keyChar = key[i % key.length];
    const xorChar = String.fromCharCode(charCode ^ keyChar.charCodeAt(0));
    substituted += xorChar;
  }

  // Step 2: Transposition (reverse string)
  let transposed = substituted.split("").reverse().join("");

  // Step 3: Noise insertion AFTER transposition
  const noiseInterval = (key.length % 3) + 2; //noise interval depends on the length of the key. 
  // largest possible value from (key.length % 3) is 2 - noise interval will always be 2, 3, or 4
  let noisy = '';
  for (let i = 0; i < transposed.length; i++) {
    noisy += transposed[i];
    if ((i + 1) % noiseInterval === 0) {
      noisy += '*'; 
    }
  }
  // Base64 encode final output
  res.json({ ciphertext: Buffer.from(noisy).toString("base64") });
});


app.post("/decrypt/custom", (req, res) => {
  const { ciphertext, key } = req.body;
  if (!ciphertext || !key) return res.status(400).send("Missing data.");

  try {
    // Step 1: Base64 decode
    let decoded = Buffer.from(ciphertext, "base64").toString();

    // Step 2: Remove noise
    let denoised = decoded.replace(/\*/g, "");

    // Step 3: Reverse transposition
    let transposed = denoised.split("").reverse().join("");

    // Step 4: XOR with key characters
    let original = '';
    for (let i = 0; i < transposed.length; i++) {
      const xorChar = String.fromCharCode(
        transposed.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
      original += xorChar;
    }

    res.json({ plaintext: original });
  } catch (err) {
    res.status(400).send("Decryption failed.");
  }
});

app.post("/encrypt-file/custom", upload.single("file"), (req, res) => {
  const file = req.file;
  const key = req.body.key;
  if (!file || !key) {
    console.error("❌ Missing file or key");
    return res.status(400).send("Missing file or key.");
  }

  console.log(`🚀 Encrypting file: ${file.originalname} (${file.size} bytes)`);

  try {
    const encrypted = mutateBuffer(file.buffer, key, false); //false = encryption
    res.set({
      "Content-Disposition": `attachment; filename="encrypted_${file.originalname}"`,
      "Content-Type": "application/octet-stream",
    });

    res.send(encrypted);
  } catch (err) {
    console.error("❌ Encryption error:", err);
    res.status(500).send("Encryption failed.");
  }
});

app.post("/decrypt-file/custom", upload.single("file"), (req, res) => {
  const file = req.file;
  const key = req.body.key;
  if (!file || !key) {
    console.error("❌ Missing file or key");
    return res.status(400).send("Missing file or key.");
  }

  console.log(`🔓 Decrypting file: ${file.originalname} (${file.size} bytes)`);

  try {
    const decrypted = mutateBuffer(file.buffer, key, true); //true = decryption

    res.set({ //Sets HTTP response headers
      "Content-Disposition": `attachment; filename="decrypted_${file.originalname}"`, //"Content-Disposition": tells the browser to download the response as a file.
      "Content-Type": "application/octet-stream",
    });

    res.send(decrypted);
  } catch (err) {
    console.error("❌ Decryption error:", err);
    res.status(500).send("Decryption failed.");
  }
});

/* ---------------- Transposition Cipher ---------------- */

/**
 * @swagger
 * tags:
 *   name: Transposition
 *   description: Transposition cipher encryption and decryption
 */

/**
 * @swagger
 * /encrypt/transposition:
 *   post:
 *     summary: Encrypt plaintext using Transposition Cipher
 *     tags: [Transposition]
 *     description: Encrypts a plaintext string using Transposition Cipher with a numeric key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plaintext:
 *                 type: string
 *               key:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Returns transposition-encrypted ciphertext
 */

function validateKey(key) {
  if (typeof key !== "string") return false;
  const letters = key.replace(/[^a-zA-Z]/g, "");
  const unique = new Set(letters.toUpperCase().split(""));
  return letters.length >= 2 && unique.size >= 2;
}

// Columnar Transposition Cipher implementation
function transposeText(text, key, decrypt = false) {
  try {
    if (!text || !key) {
      throw new Error("Missing text or key");
    }

    console.log("Input text:", text);
    console.log("Input key:", key);

    // Replace spaces with underscores for consistent handling
    const processedText = text.replace(/\s+/g, "_");
    console.log("Processed text:", processedText);

    const keyChars = key.toUpperCase().split("");
    const keyLength = keyChars.length;
    console.log("Key length:", keyLength);

    if (keyLength < 2) {
      throw new Error("Keyword must have at least 2 unique characters");
    }

    // Create a mapping of characters to their order
    const charOrder = {};
    const uniqueChars = [...new Set(keyChars)].sort();
    uniqueChars.forEach((char, index) => {
      charOrder[char] = index;
    });

    // Create column order based on the key
    const columnOrder = keyChars.map((char) => charOrder[char]);
    console.log("Column order:", columnOrder);

    if (!decrypt) {
      // Encryption
      const numRows = Math.ceil(processedText.length / keyLength);
      console.log("Number of rows:", numRows);

      const paddedText = processedText.padEnd(numRows * keyLength, "_");
      console.log("Padded text:", paddedText);

      // Create the matrix
      const matrix = [];
      for (let i = 0; i < numRows; i++) {
        const row = paddedText.slice(i * keyLength, (i + 1) * keyLength);
        matrix.push(row);
        console.log(`Row ${i}:`, row);
      }

      // Read columns in order
      let ciphertext = "";
      for (let order = 0; order < keyLength; order++) {
        const colIndex = columnOrder.indexOf(order);
        console.log(`Reading column ${colIndex} (order ${order})`);
        for (let row = 0; row < numRows; row++) {
          const char = matrix[row][colIndex];
          ciphertext += char;
          console.log(`  Row ${row}: ${char}`);
        }
      }
      console.log("Generated ciphertext:", ciphertext);
      return ciphertext;
    } else {
      // Decryption
      const numRows = Math.ceil(processedText.length / keyLength);
      console.log("Number of rows:", numRows);

      // Calculate column lengths
      const colLens = Array(keyLength).fill(
        Math.floor(processedText.length / keyLength)
      );
      const extraChars = processedText.length % keyLength;

      // Distribute extra characters to columns
      for (let i = 0; i < extraChars; i++) {
        const colIndex = columnOrder.indexOf(i);
        if (colIndex !== -1) {
          colLens[colIndex]++;
        }
      }
      console.log("Column lengths:", colLens);

      // Fill columns
      const cols = [];
      let pos = 0;
      for (let order = 0; order < keyLength; order++) {
        const colIndex = columnOrder.indexOf(order);
        const len = colLens[colIndex];
        const columnContent = processedText.slice(pos, pos + len);
        cols[colIndex] = columnContent.split("");
        console.log(`Column ${colIndex} (order ${order}):`, columnContent);
        pos += len;
      }

      // Reconstruct the matrix
      let plaintext = "";
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < keyLength; col++) {
          if (cols[col] && cols[col][row]) {
            plaintext += cols[col][row];
          }
        }
      }
      console.log("Generated plaintext:", plaintext);
      return plaintext.replace(/_/g, " ");
    }
  } catch (error) {
    console.error("Transposition cipher error:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

app.post("/encrypt/transposition", (req, res) => {
  console.log("Encryption request received:", req.body);
  const { plaintext, key } = req.body;

  if (!plaintext || !key) {
    console.log("Missing input:", { plaintext, key });
    return res.status(400).json({
      error: "Missing plaintext or key",
    });
  }

  if (!validateKey(key)) {
    console.log("Invalid key:", key);
    return res.status(400).json({
      error:
        "Invalid key. Key must be a string with at least 2 unique alphabetic characters.",
    });
  }

  try {
    const ciphertext = transposeText(plaintext, key);
    console.log("Encryption successful");
    res.json({ ciphertext });
  } catch (error) {
    console.error("Encryption error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error:
        error.message ||
        "Failed to encrypt text. Please check your input and try again.",
    });
  }
});

app.post("/decrypt/transposition", (req, res) => {
  const { ciphertext, key } = req.body;

  if (!ciphertext || !key) {
    return res.status(400).json({
      error: "Missing ciphertext or key",
    });
  }

  if (!validateKey(key)) {
    return res.status(400).json({
      error:
        "Invalid key. Key must be a string with at least 2 unique alphabetic characters.",
    });
  }

  try {
    const plaintext = transposeText(ciphertext, key, true);
    res.json({ plaintext });
  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({
      error:
        error.message ||
        "Failed to decrypt text. Please check your input and try again.",
    });
  }
});

/**
 * @swagger
 * /encrypt-file/transposition:
 *   post:
 *     summary: Encrypt file using Transposition Cipher
 *     tags: [Transposition]
 *     description: Encrypts an uploaded file using Transposition Cipher with a keyword.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns encrypted file
 */
app.post("/encrypt-file/transposition", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;

  if (!file || !key) {
    console.error("Missing file or key:", { file: !!file, key: !!key });
    return res.status(400).send("Missing file or key");
  }

  if (!validateKey(key)) {
    console.error("Invalid key:", key);
    return res
      .status(400)
      .send(
        "Invalid key. Key must be a string with at least 2 unique alphabetic characters."
      );
  }

  try {
    console.log("Processing file:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    // Check if the file is a text file
    const isTextFile =
      file.mimetype.startsWith("text/") ||
      file.mimetype === "application/json" ||
      file.mimetype === "application/xml";

    if (isTextFile) {
      // Handle text files
      const fileContent = file.buffer.toString("utf8");
      const encryptedContent = transposeText(fileContent, key);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=encrypted_${file.originalname}`
      );
      res.setHeader("Content-Type", "text/plain");
      res.send(Buffer.from(encryptedContent));
    } else {
      // Handle binary files
      const buffer = file.buffer;
      const keyLength = key.length;

      // Process the buffer in chunks that are multiples of the key length
      const chunkSize = Math.ceil(buffer.length / keyLength) * keyLength;
      const paddedBuffer = Buffer.alloc(chunkSize);
      buffer.copy(paddedBuffer);

      // Create a matrix for transposition
      const numRows = Math.ceil(chunkSize / keyLength);
      const matrix = Array(numRows)
        .fill()
        .map(() => Array(keyLength).fill(0));

      // Fill the matrix row by row
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < keyLength; col++) {
          const index = row * keyLength + col;
          if (index < buffer.length) {
            matrix[row][col] = buffer[index];
          }
        }
      }

      // Create column order based on the key
      const keyChars = key.toUpperCase().split("");
      const charOrder = {};
      const uniqueChars = [...new Set(keyChars)].sort();
      uniqueChars.forEach((char, index) => {
        charOrder[char] = index;
      });
      const columnOrder = keyChars.map((char) => charOrder[char]);

      // Create encrypted buffer
      const encryptedBuffer = Buffer.alloc(chunkSize);
      let pos = 0;

      // Read columns in order
      for (let order = 0; order < keyLength; order++) {
        const colIndex = columnOrder.indexOf(order);
        for (let row = 0; row < numRows; row++) {
          encryptedBuffer[pos++] = matrix[row][colIndex];
        }
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=encrypted_${file.originalname}`
      );
      res.setHeader(
        "Content-Type",
        file.mimetype || "application/octet-stream"
      );
      res.send(encryptedBuffer);
    }
  } catch (error) {
    console.error("File encryption error:", error);
    res
      .status(500)
      .send("Failed to encrypt file. Please check your input and try again.");
  }
});

/**
 * @swagger
 * /decrypt-file/transposition:
 *   post:
 *     summary: Decrypt file encrypted with Transposition Cipher
 *     tags: [Transposition]
 *     description: Decrypts a Transposition-encrypted file using the keyword.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns decrypted file
 */
app.post("/decrypt-file/transposition", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;

  if (!file || !key) {
    console.error("Missing file or key:", { file: !!file, key: !!key });
    return res.status(400).send("Missing file or key");
  }

  if (!validateKey(key)) {
    console.error("Invalid key:", key);
    return res
      .status(400)
      .send(
        "Invalid key. Key must be a string with at least 2 unique alphabetic characters."
      );
  }

  try {
    console.log("Processing file:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    // Check if the file is a text file
    const isTextFile =
      file.mimetype.startsWith("text/") ||
      file.mimetype === "application/json" ||
      file.mimetype === "application/xml";

    if (isTextFile) {
      // Handle text files
      const fileContent = file.buffer.toString("utf8");
      const decryptedContent = transposeText(fileContent, key, true);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=decrypted_${file.originalname}`
      );
      res.setHeader("Content-Type", "text/plain");
      res.send(Buffer.from(decryptedContent));
    } else {
      // Handle binary files
      const buffer = file.buffer;
      const keyLength = key.length;

      // Create column order based on the key
      const keyChars = key.toUpperCase().split("");
      const charOrder = {};
      const uniqueChars = [...new Set(keyChars)].sort();
      uniqueChars.forEach((char, index) => {
        charOrder[char] = index;
      });
      const columnOrder = keyChars.map((char) => charOrder[char]);

      // Calculate column lengths
      const numRows = Math.ceil(buffer.length / keyLength);
      const colLens = Array(keyLength).fill(
        Math.floor(buffer.length / keyLength)
      );
      const extraChars = buffer.length % keyLength;

      // Distribute extra characters to columns
      for (let i = 0; i < extraChars; i++) {
        const colIndex = columnOrder.indexOf(i);
        if (colIndex !== -1) {
          colLens[colIndex]++;
        }
      }

      // Fill columns
      const cols = Array(keyLength)
        .fill()
        .map(() => []);
      let pos = 0;

      for (let order = 0; order < keyLength; order++) {
        const colIndex = columnOrder.indexOf(order);
        const len = colLens[colIndex];
        for (let i = 0; i < len; i++) {
          cols[colIndex].push(buffer[pos++]);
        }
      }

      // Reconstruct the original buffer
      const decryptedBuffer = Buffer.alloc(buffer.length);
      pos = 0;

      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < keyLength; col++) {
          if (cols[col][row] !== undefined) {
            decryptedBuffer[pos++] = cols[col][row];
          }
        }
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=decrypted_${file.originalname}`
      );
      res.setHeader(
        "Content-Type",
        file.mimetype || "application/octet-stream"
      );
      res.send(decryptedBuffer);
    }
  } catch (error) {
    console.error("File decryption error:", error);
    res
      .status(500)
      .send("Failed to decrypt file. Please check your input and try again.");
  }
});

// Swagger docs
swaggerDocs(app);

// Start server
app.listen(port, () => {
  console.log(`🔐 Server running at http://localhost:${port}`);
});
