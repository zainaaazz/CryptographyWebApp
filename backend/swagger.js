const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cryptography API',
      version: '1.0.0',
      description: 'API for encrypting and decrypting text and files using AES, DES, Caesar, Vernam, and Vigenere ciphers.'
    },
    servers: [
      {
        url: 'http://localhost:5000'
      }
    ]
  },
  apis: ['./server.js'], // <-- This points to your server.js where you document endpoints
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = swaggerDocs;
