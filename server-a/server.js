const express = require('express');
const fs = require("fs");
const path = require('path');
const cors = require('cors');
const server = express();
const PORT = 3000;

server.use(express.json());
server.use(cors());

const animalData = require('./data.json'); // (animal data created with the help of AI)
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

server.get('/animals', (req, res) => {
  res.json(animalData);
});

// search animal by id
server.get('/animals/:id', (req, res) => {
    const animalId = req.params.id;
    const animals = fetchAnimals(); // Funktio, joka lukee kaikki eläimet

    // Etsi vastaava eläin
    const animal = animals.find(a => a.id === animalId); 

    if (animal) {
        res.json(animal); // LÖYTYI: Palauta objekti
    } else {
        res.status(404).json({ error: 'Eläintä ei löydy tällä ID:llä.' }); // EI LÖYTYNYT
    }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Try server at http://localhost:${PORT}/animals`);
});