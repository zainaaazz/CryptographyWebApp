const axios = require('axios');
const { AES } = require('crypto-js');

describe('AES Encryption', () => {
  const baseUrl = 'http://localhost:5000';
  const testKey = 'testkey1234567890';
  const testText = 'Hello, World!';

  test('should encrypt text successfully', async () => {
    const response = await axios.post(`${baseUrl}/encrypt/aes`, {
      plaintext: testText,
      key: testKey
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('ciphertext');
    expect(typeof response.data.ciphertext).toBe('string');
  });

  test('should decrypt text successfully', async () => {
    // First encrypt the text
    const encryptResponse = await axios.post(`${baseUrl}/encrypt/aes`, {
      plaintext: testText,
      key: testKey
    });

    // Then decrypt it
    const decryptResponse = await axios.post(`${baseUrl}/decrypt/aes`, {
      ciphertext: encryptResponse.data.ciphertext,
      key: testKey
    });

    expect(decryptResponse.status).toBe(200);
    expect(decryptResponse.data).toHaveProperty('plaintext');
    expect(decryptResponse.data.plaintext).toBe(testText);
  });

  test('should return error for invalid key length', async () => {
    try {
      await axios.post(`${baseUrl}/encrypt/aes`, {
        plaintext: testText,
        key: 'shortkey'
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty('error');
    }
  });
}); 