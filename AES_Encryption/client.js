const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const dotenv = require('dotenv');
dotenv.config();

const key = Buffer.from(process.env.AES_SECRET_KEY, 'hex');

// AES Encrypt
function encrypt(text) {
    const iv = crypto.randomBytes(12); // 12 bytes for GCM
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

// Data to encrypt
const formDataObj = {
    name: "Sneha",
    email: "sneha@example.com",
    password: "aesSecret456"
};

const plainText = JSON.stringify(formDataObj);
console.log("Encrypting:", plainText);

const encryptedPayload = encrypt(plainText);

// Prepare form-data
const form = new FormData();
form.append('encryptedData', encryptedPayload.encryptedData);
form.append('iv', encryptedPayload.iv);
form.append('tag', encryptedPayload.tag);

// Send
axios.post('http://localhost:3000/send-data', form, {
    headers: form.getHeaders()
})
.then(res => console.log("Server response:", res.data))
.catch(err => console.error("Error:", err.response?.data || err));
