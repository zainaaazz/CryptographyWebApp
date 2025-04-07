const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

/**
 * 🔐 AES ENCRYPTION
 * Uses AES-128-CBC with 16-byte key and IV of 16 null bytes.
 */
app.post('/encrypt-aes', (req, res) => {
  const { plaintext, key } = req.body;

  if (!key || key.length !== 16) {
    return res.status(400).json({ error: 'Key must be 16 characters for AES-128-CBC.' });
  }

  const iv = Buffer.alloc(16, 0); // Initialization vector of 16 null bytes
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  res.json({ ciphertext: encrypted });
});

/**
 * 🔐 DES ENCRYPTION
 * Uses Triple DES (3DES) with 24-byte key.
 */
app.post('/encrypt-des', (req, res) => {
  const { plaintext, key } = req.body;

  if (!key || key.length !== 24) {
    return res.status(400).json({ error: 'Key must be 24 characters for Triple DES (3DES).' });
  }

  try {
    const cipher = crypto.createCipheriv('des-ede3', Buffer.from(key), null);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    res.json({ ciphertext: encrypted });
  } catch (err) {
    res.status(500).json({ error: 'Encryption failed.', details: err.message });
  }
});

/**
 * 🔐 CAESAR ENCRYPTION
 * Simple shift-based cipher.
 */
app.post('/encrypt-caesar', (req, res) => {
  const { plaintext, shift } = req.body;

  if (shift === undefined || typeof shift !== 'number') {
    return res.status(400).json({ error: 'Shift must be a number.' });
  }

  const ciphertext = plaintext.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    }
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + shift) % 26) + 97);
    }
    return char;
  }).join('');

  res.json({ ciphertext });
});

// 🚀 Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
