// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// Load private key
const privateKey = fs.readFileSync(
  path.join(__dirname, "KEY/private_key.pem"),
  "utf8"
);

// Mock DB
let mockDB = [];

function decryptWithPrivateKey(encryptedData) {
  const bufferEncrypted = Buffer.from(encryptedData, "base64");
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferEncrypted
  );
  return decrypted.toString("utf8");
}
// API to receive encrypted data and store
app.post("/submit", (req, res) => {
  const { encryptedData } = req.body;
  try {
    const decrypted = decryptWithPrivateKey(encryptedData);
    mockDB.push({ raw: decrypted, encrypted: encryptedData });
    console.log("Data stored in mock DB:", mockDB);
    res.json({ message: "Data received and decrypted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to decrypt data" });
  }
});

// API to update data
app.put("/update/:index", (req, res) => {
  const { encryptedData } = req.body;
  const index = parseInt(req.params.index);

  if (index < 0 || index >= mockDB.length) {
    return res.status(404).json({ error: "Invalid index" });
  }

  try {
    const decrypted = decryptWithPrivateKey(encryptedData);
    mockDB[index] = { raw: decrypted, encrypted: encryptedData };
    console.log("Updated mock DB:", mockDB);
    res.json({ message: "Data updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to decrypt data" });
  }
});

// API to delete data
app.delete("/delete/:index", (req, res) => {
  const index = parseInt(req.params.index);

  if (index < 0 || index >= mockDB.length) {
    return res.status(404).json({ error: "Invalid index" });
  }

  const deleted = mockDB.splice(index, 1);
  console.log("Deleted item:", deleted);
  res.json({ message: "Data deleted successfully!", deleted });
});

// API to view mock DB
app.get("/data", (req, res) => {
  res.json(mockDB);
});

app.listen(3000, () => console.log("Server running on port 3000"));
