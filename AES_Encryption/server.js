// server.js
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const key = Buffer.from(process.env.AES_SECRET_KEY, 'hex');
console.log("Key Length:", key.length);

// Mock DB
const mockDB = [];

app.post('/send-data', (req, res) => {
    try {
        const { encryptedData, iv, tag } = req.body;
        const decrypted = decrypt(encryptedData, iv, tag);
        console.log("Decrypted Data:", decrypted);

        // Store in mock DB
        mockDB.push({
            raw: decrypted,
            encrypted: encryptedData,
            timestamp: new Date()
        });
        console.log("Data stored in mock DB:", mockDB);

        res.json({ message: "Data received and decrypted!", data: decrypted });
    } catch (err) {
        res.status(400).json({ error: 'Decryption failed', details: err.message });
    }
});

// Optional: view mock DB
app.get('/mockdb', (req, res) => {
    res.json(mockDB);
});

function decrypt(encryptedData, ivHex, tagHex) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
