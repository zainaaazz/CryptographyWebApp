import { useState } from 'react';
import emojiRegex from 'emoji-regex';

const emojiMap = {
  A: "😀", B: "😂", C: "😍", D: "😎", E: "😭", F: "😡", G: "😱", H: "😴",
  I: "😇", J: "😈", K: "🤓", L: "🧐", M: "🤯", N: "🤩", O: "🥳", P: "😵",
  Q: "😷", R: "🤠", S: "😺", T: "😻", U: "😼", V: "🙀", W: "😿", X: "😹",
  Y: "🙈", Z: "🙉", a: "🙊", b: "👶", c: "👧", d: "👦", e: "🧒", f: "👩",
  g: "👨", h: "👵", i: "👴", j: "👲", k: "🧔", l: "👳", m: "👮", n: "👷",
  o: "💂", p: "🕵️", q: "👩‍⚕️", r: "👨‍⚕️", s: "👩‍🏫", t: "👨‍🏫", u: "👩‍🍳",
  v: "👨‍🍳", w: "👩‍🔧", x: "👨‍🔧", y: "👩‍🏭", z: "👨‍🏭", 0: "💯", 1: "🔢",
  2: "🔠", 3: "🔣", 4: "🔤", 5: "🅰️", 6: "🆎", 7: "🅱️", 8: "🆑", 9: "🆒",
  '+': "🆓", '/': "🆔", '=': "🆕"
};

const reverseEmojiMap = Object.fromEntries(
  Object.entries(emojiMap).map(([char, emoji]) => [emoji, char])
);

function encodeToEmoji(base64) {
  return base64.split('').map(char => emojiMap[char] || char).join('');
}

function decodeFromEmoji(emojiText) {
  const regex = emojiRegex();
  const decoded = [];
  let match;
  while ((match = regex.exec(emojiText)) !== null) {
    const emoji = match[0];
    decoded.push(reverseEmojiMap[emoji] || '?');
  }
  return decoded.join('');
}

export default function CustomPage2() {
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [error, setError] = useState('');

  const encryptText = () => {
    try {
      const base64 = btoa(plaintext);
      const emojiCipher = encodeToEmoji(base64);
      setCiphertext(emojiCipher);
      setError('');
    } catch {
      setError('Text encryption failed.');
    }
  };

  const decryptText = () => {
    try {
      const base64 = decodeFromEmoji(ciphertext);
      const decoded = atob(base64);
      setDecryptedText(decoded);
      setError('');
    } catch {
      setError('Text decryption failed.');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-light text-center">EC - Emojicode Cipher</h1>
      <p className="text-secondary text-center">
        This cipher converts Base64 into emojis. The emoji-to-character map is the key.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-4">
        <div className="col-md-6 border-end">
          <h4 className="text-success">Encrypt</h4>
          <textarea
            className="form-control mb-2"
            placeholder="Plaintext"
            value={plaintext}
            onChange={e => setPlaintext(e.target.value)}
          />
          <button className="btn btn-success" onClick={encryptText}>Encrypt</button>
          <p className="mt-3"><strong>Ciphertext:</strong> <code>{ciphertext}</code></p>
        </div>

        <div className="col-md-6">
          <h4 className="text-warning">Decrypt</h4>
          <textarea
            className="form-control mb-2"
            placeholder="Emoji Ciphertext"
            value={ciphertext}
            onChange={e => setCiphertext(e.target.value)}
          />
          <button className="btn btn-warning" onClick={decryptText}>Decrypt</button>
          <p className="mt-3"><strong>Decrypted:</strong> <code>{decryptedText}</code></p>
        </div>
      </div>
    </div>
  );
}
