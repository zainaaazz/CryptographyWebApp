const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// AES ENCRYPTION
app.post('/encrypt/aes', (req, res) => {
  const { plaintext } = req.body;
  const key = Buffer.from('1234567890abcdef'); // 16-byte static key
  const iv = Buffer.alloc(16, 0); // 16 null bytes
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  res.json({ ciphertext: encrypted });
});

// AES DECRYPTION
app.post('/decrypt/aes', (req, res) => {
  const { ciphertext } = req.body;
  const key = Buffer.from('1234567890abcdef'); // same static key
  const iv = Buffer.alloc(16, 0);
  try {
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    res.json({ plaintext: decrypted });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ciphertext.' });
  }
});

// DES ENCRYPTION
app.post('/encrypt/des', (req, res) => {
  const { plaintext } = req.body;
  const key = Buffer.from('123456789012345678901234'); // 24-byte key for Triple DES
  const cipher = crypto.createCipheriv('des-ede3', key, null);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  res.json({ ciphertext: encrypted });
});

// DES DECRYPTION
app.post('/decrypt/des', (req, res) => {
  const { ciphertext } = req.body;
  const key = Buffer.from('123456789012345678901234');
  try {
    const decipher = crypto.createDecipheriv('des-ede3', key, null);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    res.json({ plaintext: decrypted });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ciphertext.' });
  }
});

// CAESAR ENCRYPTION
app.post('/encrypt/caesar', (req, res) => {
  const { plaintext, shift } = req.body;
  const ciphertext = plaintext.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + shift) % 26) + 97);
    return char;
  }).join('');
  res.json({ ciphertext });
});

// CAESAR DECRYPTION
app.post('/decrypt/caesar', (req, res) => {
  const { ciphertext, shift } = req.body;
  const plaintext = ciphertext.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
    if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
    return char;
  }).join('');
  res.json({ plaintext });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`🔐 Server running at http://localhost:${PORT}`);
});
