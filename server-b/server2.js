const express = require('express');
const fs = require("fs");
const server = express();
const PORT = 8000;
const cors = require('cors');
const path = require('path');
const API_server_a_URL = 'http://localhost:3000';

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

// POST new adoption application
server.post('/adoptions', async (req, res) => {
    const newApplication = req.body;
    
    // read existing adoption applications
    const existingAdoptions = readAdoptionData();
    
    const animalId = newApplication.animalId;

    // check with server A if animal is already reserved
    try {
        const animalStatusResponse = await fetch(`${API_server_a_URL}/animals/${animalId}`);
        
        if (!animalStatusResponse.ok) { // if response not ok, return error
            return res.status(404).json({ error: 'Animal not found in server A' });
        }
        
        const animalData = await animalStatusResponse.json();
        
        // check if the animal is already reserved
        if (animalData.status === 'Varattu') {
            return res.status(409).json({ 
                error: 'Eläin on jo varattu', 
            });
        }
    } catch (error) {
        console.error("Error cheking server A status:", error);
        return res.status(500).json({ error: 'Server error when trying to check status' });
    }

    // update animal status in server A to 'Varattu'
    const updateResponse = await fetch(`${API_server_a_URL}/animals/${newApplication.animalId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Varattu' }) // send new status
    });

    // create new ID for application
    newApplication.applicationId = Date.now().toString();
    newApplication.status = 'Varattu';
    
    // add new application to table
    existingAdoptions.push(newApplication);
    
    // write updated applications back to file adoptiondata.json
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