const express = require('express');
const fs = require("fs");
const server = express();
const PORT = 8000;
const cors = require('cors');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'adoptiondata.json');

server.use(express.json());
server.use(cors());

// read adoptiondata and parse it
function readAdoptionData() {
    try {
        const dataString = fs.readFileSync(DATA_FILE, 'utf8');
        // convert string to js object
        const parsedData = JSON.parse(dataString);

        if (Array.isArray(parsedData)) {
            return parsedData;
        } else {
            console.warn("adoptiondata.json doesn't contain an array");
            return []; // return empty array
        }
    } catch (error) {
        return "error reading adoption data";
    }
}

// convert js object to string and writes it to adoptiondata.json
// needed to save new adoptions to json file
function writeAdoptionData(data) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(DATA_FILE, jsonData, 'utf8');
  } catch (error) {
    console.error("Error writing adoption data:", error);
    }
}

// get existing adoption applications
server.get('/adoptions', (req, res) => {
    const adoptionData = readAdoptionData();
    res.json(adoptionData);
});

server.post('/adoptions', (req, res) => {
    const newApplication = req.body;
    
    // read existing adoption applications
    const existingAdoptions = readAdoptionData();
    
    // create new ID
    newApplication.applicationId = Date.now().toString();
    newApplication.status = 'Pending';
    
    // add new application to table
    existingAdoptions.push(newApplication);
    
    // write updated applications back to file
    writeAdoptionData(existingAdoptions);

    // send response back to frontend
    res.status(201).json({ 
        message: 'Hakemus vastaanotettu', 
        applicationId: newApplication.applicationId 
    });
});

server.listen(PORT, () => {
  console.log(`Server B running on port ${PORT}`);
  console.log(`Try server at http://localhost:${PORT}/adoptions`);
});