const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

// Load public key
const publicKey = fs.readFileSync(path.join(__dirname, 'KEY/public_key.pem'), 'utf8');

function encryptWithPublicKey(data) {
    const bufferData = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
        },
        bufferData
    );
    return encrypted.toString('base64');
}

// const plainText = "Sensitive Info like Password 122526526867287";
// const encryptedData = encryptWithPublicKey(plainText);


const newPlainText = "welcome";
const encryptedData = encryptWithPublicKey(newPlainText);

axios.post('http://localhost:3000/submit', { encryptedData })
    .then(res => console.log(res.data))
    .catch(err => console.error('Error sending to server:', err.response?.data || err));