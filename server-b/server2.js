const express = require('express');
const fs = require("fs");
const server = express();
const PORT = 8000;
server.use(express.json());

const adoptionData = require('./adoptiondata.json');

// read adoptiondata and parse it
function readAdoptionData() {
    try {
        const data = fs.readFile(adoptionData, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return "error reading adoption data";
    }
}

// convert js object to string and writes it to adoptiondata.json
// needed to save new adoptions to json file
function writeAdoptionData(data) {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFile(adoptionData, jsonData, 'utf8');
}

server.get('/adoptions', (req, res) => {
  res.json(adoptionData);
});

server.listen(PORT, () => {
  console.log(`Server B running on port ${PORT}`);
  console.log(`Try server at http://localhost:${PORT}/adoptions`);
});