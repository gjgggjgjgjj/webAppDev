const listIdeas = document.getElementById('listIdeas')
const ideaForm = document.getElementById('ideaForm');
const ideaInput = document.getElementById('ideaInput');

//this fetches our messages 
async function fetchIdeas() {
      try {
            const response = await fetch('/messages');
            if (!response.ok) throw new Error('Failed to fetch ideas');

            const ideas = await response.json();

            // Clear existing items in listIdeas
            listIdeas.innerHTML = '';


            //loops over the things in the json file
            //this should print all the ideas in order
            ideas.reverse().forEach(ideaText => {
                  const card = document.createElement('div');
                  card.className = 'idea-card';
                  card.textContent = ideaText;
                  listIdeas.appendChild(card);
            });
      } catch (err) {
            console.error('Error:', err);
      }
}
if (ideaForm) {
    ideaForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // thanks chat for this so it doesn't refresh the whole page

        const text = ideaInput.value.trim();
        if (!text) return;

        try {
            const response = await fetch('/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea: text })
            });

            if (response.status === 201) {
                ideaInput.value = ''; // Reset form input
                await fetchIdeas();   // Subsequent GET request to refresh display!
            }
        } catch (err) {
            console.error('Error submitting idea:', err);
        }
    });
}

//running our fetch for the 
fetchIdeas();



