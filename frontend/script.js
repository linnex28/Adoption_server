const API_url = 'http://localhost:3000/animals';
// container for animal cards
const animalList = document.getElementById('animal-list');

function createAnimalCards(animalsData) {
    const displayAnimals = animalsData.slice();

    displayAnimals.forEach(animal => {
            const card = document.createElement('div');
            card.className = 'animal-card';

            const image = document.createElement('img');
            image.src = animal.imageUrl || 'favicon.ico'; // placeholder image if original  isn't available
            image.alt = `Image of an animal whose breed is: ${animal.breed}`;

            const name = document.createElement('h3');
            name.textContent = animal.name;

            const info = document.createElement('p');
            info.textContent = `Breed: ${animal.breed}, Age: ${animal.age} years`;

            const button = document.createElement('a');
            button.href = `animal.html?id=${animal.id}`;
            button.className = 'details-button';
            button.textContent = 'Katso lisää';

            card.appendChild(image);
            card.appendChild(name);
            card.appendChild(info);
            card.appendChild(button);
            animalList.appendChild(card);
        });
}

async function fetchAnimals() {
    try {
        const response = await fetch(`${API_url}`);
        if (!response.ok) {
            return "API request failed";
        }
        const animals = await response.json();

        createAnimalCards(animals);
        
    } catch (error) {
        console.error('Error fetching animals:', error);
    }
}

fetchAnimals();