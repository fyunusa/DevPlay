document.addEventListener("DOMContentLoaded", function () {
  // Toggle between All Modules and Favorites
  const allModulesTab = document.getElementById("all-modules-tab");
  const favoritesTab = document.getElementById("favorites-tab");
  const allModulesSection = document.getElementById("all-modules-section");
  const favoritesSection = document.getElementById("favorites-section");

  // Load favorites from localStorage
  let favorites = JSON.parse(localStorage.getItem("devplayFavorites")) || [];

  // Initialize favorite buttons
  const favoriteButtons = document.querySelectorAll(".favorite-btn");
  favoriteButtons.forEach((btn) => {
    const moduleId = btn.getAttribute("data-module");
    if (favorites.includes(moduleId)) {
      btn.classList.add("active");
      btn.querySelector("i").classList.remove("far");
      btn.querySelector("i").classList.add("fas");
    }

    // Add click event listener
    btn.addEventListener("click", function () {
      const moduleId = this.getAttribute("data-module");
      toggleFavorite(moduleId, this);
    });
  });

  // Toggle favorites
  function toggleFavorite(moduleId, btnElement) {
    if (favorites.includes(moduleId)) {
      // Remove from favorites
      favorites = favorites.filter((id) => id !== moduleId);
      btnElement.classList.remove("active");
      btnElement.querySelector("i").classList.remove("fas");
      btnElement.querySelector("i").classList.add("far");
    } else {
      // Add to favorites
      favorites.push(moduleId);
      btnElement.classList.add("active");
      btnElement.querySelector("i").classList.remove("far");
      btnElement.querySelector("i").classList.add("fas");
    }

    // Update localStorage
    localStorage.setItem("devplayFavorites", JSON.stringify(favorites));

    // Update favorites view if it's currently displayed
    if (favoritesSection.style.display === "block") {
      loadFavorites();
    }
  }

  // Display all modules view
  allModulesTab.addEventListener("click", function (e) {
    e.preventDefault();
    allModulesTab.classList.add("active");
    favoritesTab.classList.remove("active");
    allModulesSection.style.display = "block";
    favoritesSection.style.display = "none";
  });

  // Display favorites view
  favoritesTab.addEventListener("click", function (e) {
    e.preventDefault();
    favoritesTab.classList.add("active");
    allModulesTab.classList.remove("active");
    allModulesSection.style.display = "none";
    favoritesSection.style.display = "block";

    // Load favorites content
    loadFavorites();
  });

  // Load favorites content
  function loadFavorites() {
    const favoritesContainer = document.getElementById("favorites-container");
    const noFavoritesMessage = document.getElementById("no-favorites");

    // Clear previous content
    favoritesContainer.innerHTML = "";

    if (favorites.length === 0) {
      // No favorites
      favoritesContainer.appendChild(noFavoritesMessage);
    } else {
      // Hide no favorites message
      if (noFavoritesMessage) {
        noFavoritesMessage.style.display = "none";
      }

      // Define module data
      const moduleData = {
        codegiggles: {
          title: "Code Giggles",
          description:
            "Enjoy funny jokes and memes about programming, coding, and tech humor. Perfect for your daily dose of developer humor.",
          image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
          url: "modules/codegiggles/index.html",
          badge: "Popular",
        },
        secretrevealed: {
          title: "Secrets Revealed",
          description:
            "Discover hilarious jokes and secrets from various professions and situations. From engineers to lawyers, find out what makes them laugh.",
          image: "https://images.unsplash.com/photo-1531482615713-2afd69097998",
          url: "modules/secretrevealed/index.html",
          badge: "New",
        },
      };

      // Create card for each favorite
      favorites.forEach((moduleId) => {
        const module = moduleData[moduleId];
        if (module) {
          const col = document.createElement("div");
          col.className = "col-md-6 fade-in";

          col.innerHTML = `
                                <div class="module-card">
                                    ${
                                      module.badge
                                        ? `<span class="badge-new">${module.badge}</span>`
                                        : ""
                                    }
                                    <button class="favorite-btn active" data-module="${moduleId}">
                                        <i class="fas fa-heart"></i>
                                    </button>
                                    <div class="module-img">
                                        <img src="${module.image}" alt="${
            module.title
          }">
                                    </div>
                                    <div class="module-info">
                                        <h3 class="module-title">${
                                          module.title
                                        }</h3>
                                        <p class="module-description">${
                                          module.description
                                        }</p>
                                        <a href="${
                                          module.url
                                        }" class="module-btn">Explore <i class="fas fa-arrow-right ms-1"></i></a>
                                    </div>
                                </div>
                            `;

          favoritesContainer.appendChild(col);

          // Add event listener to new favorite button
          const newBtn = col.querySelector(".favorite-btn");
          newBtn.addEventListener("click", function () {
            const moduleId = this.getAttribute("data-module");
            toggleFavorite(moduleId, this);
          });
        }
      });
    }
  }

  // Search functionality
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const moduleCards = document.querySelectorAll(".module-card");

    moduleCards.forEach((card) => {
      const title = card
        .querySelector(".module-title")
        .textContent.toLowerCase();
      const description = card
        .querySelector(".module-description")
        .textContent.toLowerCase();

      if (title.includes(query) || description.includes(query)) {
        card.parentElement.style.display = "block";
      } else {
        card.parentElement.style.display = "none";
      }
    });
  });
});
