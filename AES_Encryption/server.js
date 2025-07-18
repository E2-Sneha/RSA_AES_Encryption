// server.js
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
require('dotenv').config();

const upload = multer();
const app = express();
app.use(bodyParser.json());

const key = Buffer.from(process.env.AES_SECRET_KEY, 'hex');
console.log("Key Length:", key.length);

// Mock DB
const mockDB = [];

app.post('/send-data',upload.none(), (req, res) => {
    try {
        const { encryptedData, iv, tag } = req.body;
        const decrypted = decrypt(encryptedData, iv, tag);
        const decryptedJSON = JSON.parse(decrypted);
        console.log("Decrypted:", decryptedJSON);

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

// view mock DB
app.get('/mockdb', (req, res) => {
    res.json(mockDB);
});

app.put('/update/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index < 0 || index >= mockDB.length) {
        return res.status(404).json({ error: 'Invalid index' });
    }

    try {
        const { encryptedData, iv, tag } = req.body;
        const decrypted = decrypt(encryptedData, iv, tag);

        mockDB[index] = {
            raw: decrypted,
            encrypted: encryptedData,
            timestamp: new Date()
        };
        console.log("Updated item at index", index, ":", mockDB[index]);

        res.json({ message: "Data updated successfully", data: mockDB[index] });
    } catch (err) {
        res.status(400).json({ error: 'Update failed', details: err.message });
    }
});

app.delete('/delete/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index < 0 || index >= mockDB.length) {
        return res.status(404).json({ error: 'Invalid index' });
    }

    const removed = mockDB.splice(index, 1);
    console.log("Deleted entry:", removed);

    res.json({ message: "Data deleted successfully", deleted: removed });
});



function decrypt(encryptedData, ivHex, tagHex) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
