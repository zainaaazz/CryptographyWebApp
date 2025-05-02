const express = require("express");
const cors = require("cors");
const multer = require("multer");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const swaggerDocs = require("./swagger");

const app = express();
const port = 5000;

app.use(cors({
  exposedHeaders: ['Content-Disposition']
}));

app.use(express.json());
const upload = multer();


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

  res.setHeader("Content-Disposition", `attachment; filename=encrypted_${file.originalname}`);
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

  const decipher = crypto.createDecipheriv("aes-128-ecb", Buffer.from(key), null);
  const decrypted = Buffer.concat([decipher.update(file.buffer), decipher.final()]);

  res.setHeader("Content-Disposition", `attachment; filename=decrypted_${file.originalname}`);
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

  res.setHeader("Content-Disposition", `attachment; filename=encrypted_${file.originalname}`);
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
  const decrypted = Buffer.concat([decipher.update(file.buffer), decipher.final()]);

  res.setHeader("Content-Disposition", `attachment; filename=decrypted_${file.originalname}`);
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

app.post("/encrypt/vernam", (req, res) => {
  const { plaintext, key } = req.body;
  if (!plaintext || !key || plaintext.length !== key.length)
    return res.status(400).json({ error: "Key must match plaintext length." });

  const ciphertext = Buffer.from(xorBuffer(Buffer.from(plaintext), key)).toString("base64");
  res.json({ ciphertext });
});



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


app.post("/decrypt/vernam", (req, res) => {
  const { ciphertext, key } = req.body;
  if (!ciphertext || !key)
    return res.status(400).json({ error: "Missing ciphertext or key." });

  const decoded = Buffer.from(ciphertext, "base64");
  if (decoded.length !== key.length)
    return res.status(400).json({ error: "Key must match ciphertext length." });

  const plaintext = xorBuffer(decoded, key).toString();
  res.json({ plaintext });
});


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



app.post('/encrypt-file/vernam', upload.single('file'), (req, res) => {
  const fileBuffer = req.file.buffer;
  const key = Buffer.from(req.body.key, 'latin1');

  if (key.length !== fileBuffer.length) {
    return res.status(400).send('Key must be the same length as the file.');
  }

  const encryptedBuffer = Buffer.alloc(fileBuffer.length);
  for (let i = 0; i < fileBuffer.length; i++) {
    encryptedBuffer[i] = fileBuffer[i] ^ key[i];
  }

  const originalName = req.file.originalname.split('.').slice(0, -1).join('.') || 'file';
  const extension = req.file.originalname.split('.').pop();
  res.setHeader('Content-Disposition', `attachment; filename="${originalName} - VernamEncrypted.${extension}"`);
  
  res.setHeader('Content-Type', 'application/octet-stream');
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


app.post('/decrypt-file/vernam', upload.single('file'), (req, res) => {
  const encryptedBuffer = req.file.buffer;
  const key = Buffer.from(req.body.key, 'latin1');

  if (key.length !== encryptedBuffer.length) {
    return res.status(400).send('Key must be the same length as the file.');
  }

  const decryptedBuffer = Buffer.alloc(encryptedBuffer.length);
  for (let i = 0; i < encryptedBuffer.length; i++) {
    decryptedBuffer[i] = encryptedBuffer[i] ^ key[i];
  }

  const originalName = req.file.originalname.split('.').slice(0, -1).join('.') || 'file';
  const extension = req.file.originalname.split('.').pop();
  res.setHeader('Content-Disposition', `attachment; filename="${originalName} - VernamDecrypted.${extension}"`);

  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(decryptedBuffer);
});



app.post('/generate-vernam-key', (req, res) => {
  console.log('Body received:', req.body);
  
  const { fileSize } = req.body;
  
  if (!fileSize || isNaN(fileSize)) {
    return res.status(400).send('Invalid file size');
  }
  
  const size = parseInt(fileSize);
  
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
  let key = '';
  
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
    output[i] = decrypt
      ? (buffer[i] - k + 256) % 256
      : (buffer[i] + k) % 256;
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

  const ciphertext = vigenereBuffer(Buffer.from(plaintext), key, false).toString("base64");
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


app.post("/encrypt-file/vigenere", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;
  if (!file || !key)
    return res.status(400).send("Missing file or key.");

  const encrypted = vigenereBuffer(file.buffer, key, false);
  res.setHeader("Content-Disposition", `attachment; filename=encrypted_${file.originalname}`);
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


app.post("/decrypt-file/vigenere", upload.single("file"), (req, res) => {
  const { key } = req.body;
  const file = req.file;
  if (!file || !key)
    return res.status(400).send("Missing file or key.");

  const decrypted = vigenereBuffer(file.buffer, key, true);
  res.setHeader("Content-Disposition", `attachment; filename=decrypted_${file.originalname}`);
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
  res.setHeader("Content-Disposition", `attachment; filename=decrypted_${file.originalname}`);
  res.send(decrypted);
});

// Swagger docs
swaggerDocs(app);

// Start server
app.listen(port, () => {
  console.log(`🔐 Server running at http://localhost:${port}`);
});
