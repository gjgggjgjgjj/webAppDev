document.addEventListener("DOMContentLoaded", () => {
    const ideaForm = document.getElementById("ideaForm");
    const ideaIdInput = document.getElementById("ideaId");
    const titleInput = document.getElementById("titleInput");
    const categoryInput = document.getElementById("categoryInput");
    const costInput = document.getElementById("costInput");
    const locationInput = document.getElementById("locationInput");
    const notesInput = document.getElementById("notesInput");
    
    const formTitle = document.getElementById("formTitle");
    const submitBtn = document.getElementById("submitBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const listIdeas = document.getElementById("listIdeas");

    // leRender for ideas
    async function loadIdeas() {
        try {
            const res = await fetch("/api/ideas");
            const ideas = await res.json();
            
            listIdeas.innerHTML = "";
            ideas.forEach(idea => {
                const card = document.createElement("div");
                card.className = "idea-card";
                card.innerHTML = `
                    <div>
                        <h3>${idea.title} <small>(${idea.category})</small></h3>
                        <p><strong>Cost:</strong> $${parseFloat(idea.estimated_cost).toFixed(2)} | <strong>Location:</strong> ${idea.location}</p>
                        <p>${idea.notes}</p>
                    </div>
                    <div class="card-actions">
                        <button class="edit-btn" onclick="editIdea(${idea.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteIdea(${idea.id})">Delete</button>
                    </div>
                `;
                listIdeas.appendChild(card);
            });
        } catch (err) {
            console.error("Error loading ideas:", err);
        }
    }

    ideaForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            title: titleInput.value,
            category: categoryInput.value,
            estimated_cost: parseFloat(costInput.value),
            location: locationInput.value,
            notes: notesInput.value
        };

        const id = ideaIdInput.value;
        const method = id ? "PUT" : "POST";
        const url = id ? `/api/ideas/${id}` : "/api/ideas";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                resetForm();
                loadIdeas();
            }
        } catch (err) {
            console.error("Error saving idea:", err);
        }
    });

    // update le form
    window.editIdea = async (id) => {
        try {
            const res = await fetch(`/api/ideas/${id}`);
            const idea = await res.json();

            ideaIdInput.value = idea.id;
            titleInput.value = idea.title;
            categoryInput.value = idea.category;
            costInput.value = idea.estimated_cost;
            locationInput.value = idea.location;
            notesInput.value = idea.notes;

            formTitle.textContent = "Edit Idea";
            submitBtn.textContent = "Update Idea";
            cancelBtn.style.display = "inline-block";
        } catch (err) {
            console.error("Error fetching single idea:", err);
        }
    };

    window.deleteIdea = async (id) => {
        if (confirm("Are you sure you want to delete this date night idea?")) {
            try {
                const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
                if (res.ok) loadIdeas();
            } catch (err) {
                console.error("Error deleting idea:", err);
            }
        }
    };

    function resetForm() {
        ideaForm.reset();
        ideaIdInput.value = "";
        formTitle.textContent = "Would you like to add an idea?";
        submitBtn.textContent = "Submit Idea";
        cancelBtn.style.display = "none";
    }

    cancelBtn.addEventListener("click", resetForm);

    loadIdeas();
});

