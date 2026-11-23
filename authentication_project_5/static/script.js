document.addEventListener("DOMContentLoaded", () => {
    const authSection = document.getElementById("authSection");
    const protectedApp = document.getElementById("protectedApp");
    const userBar = document.getElementById("userBar");
    const welcomeMsg = document.getElementById("welcomeMsg");
    const authMessage = document.getElementById("authMessage");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const logoutBtn = document.getElementById("logoutBtn");

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

    function showLoggedInState(user) {
        authSection.style.display = "none";
        protectedApp.style.display = "block";
        userBar.style.display = "block";
        welcomeMsg.textContent = `Welcome, ${user.first_name}!`;
        authMessage.textContent = "";
        loadIdeas();
    }

    function showLoggedOutState() {
        authSection.style.display = "flex";
        protectedApp.style.display = "none";
        userBar.style.display = "none";
        listIdeas.innerHTML = "";
    }

    // Check if user already has an active session cookie
    async function checkAuth() {
        try {
            const res = await fetch("/api/sessions");
            if (res.ok) {
                const user = await res.json();
                showLoggedInState(user);
            } else {
                showLoggedOutState();
            }
        } catch (err) {
            console.error("Error checking session:", err);
            showLoggedOutState();
        }
    }

    // Handle Registration
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: document.getElementById("regFirst").value,
                    last_name: document.getElementById("regLast").value,
                    email: document.getElementById("regEmail").value,
                    password: document.getElementById("regPassword").value
                })
            });
            const data = await res.json();
            if (res.ok) {
                authMessage.style.color = "#9ae6b4";
                authMessage.textContent = "Registration successful! Please log in.";
                registerForm.reset();
            } else {
                authMessage.style.color = "#feb2b2";
                authMessage.textContent = data.error || "Registration failed.";
            }
        } catch (err) {
            console.error("Error registering:", err);
        }
    });

    // Handle Login
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: document.getElementById("loginEmail").value,
                    password: document.getElementById("loginPassword").value
                })
            });
            const data = await res.json();
            if (res.ok) {
                loginForm.reset();
                showLoggedInState(data);
            } else {
                authMessage.style.color = "#feb2b2";
                authMessage.textContent = data.error || "Invalid email or password.";
            }
        } catch (err) {
            console.error("Error logging in:", err);
        }
    });

    // Handle Logout
    logoutBtn.addEventListener("click", async () => {
        try {
            await fetch("/api/sessions", { method: "DELETE" });
            showLoggedOutState();
        } catch (err) {
            console.error("Error logging out:", err);
        }
    });

    // Render Ideas
    async function loadIdeas() {
        try {
            const res = await fetch("/api/ideas");
            if (res.status === 401) {
                showLoggedOutState();
                return;
            }
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
            } else if (res.status === 401) {
                showLoggedOutState();
            }
        } catch (err) {
            console.error("Error saving idea:", err);
        }
    });

    window.editIdea = async (id) => {
        try {
            const res = await fetch(`/api/ideas/${id}`);
            if (!res.ok) return;
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

    checkAuth();
});
