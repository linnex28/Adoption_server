const API_base_url = 'http://localhost:3000';
const API_adopt_url = 'http://localhost:8000/adoptions';

// container for animal cards (in index.html)
const animalList = document.getElementById('animal-list');

// front page (index.html) -create animal cards
function createAnimalCards(animalsData) {
    const displayAnimals = animalsData.slice();

    displayAnimals.forEach(animal => {
            const card = document.createElement('div');
            card.className = 'animal-card';

            const image = document.createElement('img');
            image.src = animal.imageUrl || 'favicon.ico'; // placeholder image if original  isn't available
            image.alt = `Kuva eläimestä, jonka rotu on: ${animal.breed}`;

            const name = document.createElement('h3');
            name.textContent = animal.name;

            const info = document.createElement('p');
            info.textContent = `Breed: ${animal.breed}, Age: ${animal.age} years`;

            const button = document.createElement('a');
            // pressing button links to detail page of said animal:
            button.href = `details.html?id=${animal.id}`;
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
        const response = await fetch(`${API_base_url}/animals`);
        if (!response.ok) {
            return "API request failed";
        }
        const animals = await response.json();
        createAnimalCards(animals);
        
    } catch (error) {
        console.error('Error fetching animals:', error);
    }
}

// details page (details.html) -get animal details
async function getAnimalDetails() {
    // get animal id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const animalId = urlParams.get('id');
    // container for animal ddetails
    const container = document.getElementById('animal-details-container');

    if (!animalId || !container) {
        // check if we are at details.html
        if (container) {
             container.innerHTML = '<h2>Virhe: Eläimen ID puuttuu tai HTML-kontaineria ei löydy.</h2>';
        }
        return;
    }

    try {
        // fetch animal info from server A
        const response = await fetch(`${API_base_url}/animals/${animalId}`);
        
        if (!response.ok) {
            container.innerHTML = `<h2>eläintä id:llä ${animalId} ei löytynyt.</h2>`;
            return;
        }
        
        const animal = await response.json();

        container.innerHTML = `
            <div class="details-card">
                <h2>${animal.name} (${animal.type})</h2>
                <div class="details-img-wrap">
                    <img src="${animal.imageUrl || 'favicon.ico'}" alt="Kuva ${animal.name}">
                </div>
                <p><strong>Ikä:</strong> ${animal.age} vuotta</p>
                <p><strong>Rotu:</strong> ${animal.breed}</p>
                <p><strong>Kuvaus:</strong> ${animal.description || 'Kuvaus puuttuu.'}</p>
                <p><strong>Tila:</strong> ${animal.status}</p>
            </div>
        `;
    
        // put animal id into form container
        document.getElementById('animal-id-input').value = animalId;

    } catch (error) {
        console.error('error fetching animal details:', error);
    }
}

function setupAdoptionForm() {
    const form = document.getElementById('adoption-form');
    const formMessage = document.getElementById('form-message');
    const submitButton = document.getElementById('submit-button');
    if (!form) return; // if not in details.html, exit
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // prevent page reloading

        formMessage.textContent = 'Lähetetään hakemusta...';
        submitButton.disabled = true;

        // get data from form
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // status for server B
        data.statusChangeRequested = "Pending"; 

        try {
            // send data to server B as POST req
            const response = await fetch(ADOPTIONS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // sent successfully
                formMessage.textContent = `Hakemus lähetetty onnistuneesti! ID: ${result.applicationId}. Otamme sinuun yhteyttä pian.`;
                form.reset(); // reset form
                
                // reload animal details to reflect changes
                loadAnimalDetails();

            } else {
                // sending was not successful
                formMessage.textContent = `Virhe hakemuksen lähetyksessä: ${result.error || response.statusText}`;
            }

        } catch (error) {
            console.error("Lomakkeen lähetys epäonnistui:", error);
            formMessage.textContent = 'Hakemuksen lähetyksessä tapahtui odottamaton virhe.';

        } finally {
            submitButton.disabled = false;
        }
    });
}

// function to check which page we are on and execute needed functions
function initializePage() {
    // check: if url has id= we are at details.html
    if (window.location.search.includes('id=')) {
        getAnimalDetails();
        setupAdoptionForm();
    } else {
        // if not, we are at index.html
        fetchAnimals();
    }
}

// excecute when page loads
initializePage();