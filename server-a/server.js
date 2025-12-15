const express = require('express');
const fs = require("fs");
const cors = require('cors');
const server = express();
const PORT = 3000;
server.use(express.json());
server.use(cors());

const animalData = require('./data.json'); // (animal data created with the help of AI)

server.get('/animals', (req, res) => {
  res.json(animalData);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Try server at http://localhost:${PORT}/animals`);
});