const crypto = require('crypto');
require('dotenv').config();

const key = Buffer.from(process.env.AES_SECRET_KEY, 'hex');
console.log("Key Length:", key.length);
console.log("Key:", key);
const iv = crypto.randomBytes(12);
console.log("IV Length:", iv);

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
    };
}

// Simulating sending data
const message = "Secret password 123";
const encryptedPayload = encrypt(message);
console.log("Send this to server:", JSON.stringify(encryptedPayload,null, 2));
