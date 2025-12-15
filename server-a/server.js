const express = require('express');
const fs = require("fs");
const path = require('path');
const cors = require('cors');
const server = express();
const PORT = 3000;

server.use(express.json());
server.use(cors());

const animalData = require('./data.json'); // (animal data created with the help of AI) duplicate ?
const ANIMALS_DATA_FILE = path.join(__dirname, 'data.json');

// read animal data from data.json file
function readAnimalData() {
    try {
        const data = fs.readFileSync(ANIMALS_DATA_FILE, 'utf8');
        return JSON.parse(data); // return data as js object
    } catch (error) {
        console.error("Error reading animal data:", error);
        return [];
    }
}

function writeAnimalData(data) {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(ANIMALS_DATA_FILE, jsonData, 'utf8');
        } catch (error) {
            console.error("Error writing updated data:", error);
    }
}

// write updated animal data to data.json file
// this is similar to POST /animals/:id/adopt
server.put('/animals/:id/status', (req, res) => {
    const animalId = req.params.id;
    const newStatus = req.body.status;

    const animals = readAnimalData();
    const animalIndex = animals.findIndex(a => a.id === animalId);

    if (animalIndex === -1) {
        return res.status(404).json({ error: 'animal not found to update' });
    }

    // find the animal and update its status
    animals[animalIndex].status = newStatus;
    
    // write updates to data,json
    writeAnimalData(animals);

    // respond
    res.json({ message: `Animal ${animalId} status updated to: ${newStatus}` });
});

// ssend all animals to frontend (index.html)
server.get('/animals', (req, res) => {
    const animals = readAnimalData();
    res.json(animals);
});

// send data to details.html
server.get('/animals/:id', (req, res) => {
    // search animal by id from data.json
    const animals = readAnimalData();
    const animalId = req.params.id;
    const animal = animals.find(a => a.id === animalId);
    
    if (animal) {
        res.json(animal);
    } else {
        res.status(404).json({ error: 'Eläintä ei löydy.' });
    }
});

// duplicate ??
server.get('/animals', (req, res) => {
  res.json(animalData);
});

// search animal by id
server.get('/animals/:id', (req, res) => {
    const animalId = req.params.id;
    const animals = fetchAnimals(); // read animal data

    // find animal by id
    const animal = animals.find(a => a.id === animalId); 

    if (animal) {
        res.json(animal); // return animal data if found
    } else {
        res.status(404).json({ error: 'Eläintä ei löydy tällä ID:llä.' });
    }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Try server at http://localhost:${PORT}/animals`);
});