document.addEventListener("DOMContentLoaded", function () {
  // Add confetti effect when page loads
  createConfetti();

  // Add floating bubbles to the background
  createFloatingBubbles();

  // Ensure social links work
  document.querySelectorAll(".social-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      window.open(href, "_blank");
      e.preventDefault(); // Prevent default link behavior
    });
  });

  // Add magic cursor effect
  document.addEventListener("mousemove", (e) => {
    const magicCursor = document.querySelector(".magic-cursor");
    if (magicCursor) {
      magicCursor.style.left = e.clientX + "px";
      magicCursor.style.top = e.clientY + "px";
    }
  });

  // Toggle between All Modules and Favorites
  const allModulesTab = document.getElementById("all-modules-tab");
  const favoritesTab = document.getElementById("favorites-tab");
  const allModulesSection = document.getElementById("all-modules-section");
  const favoritesSection = document.getElementById("favorites-section");

  // Load favorites from localStorage
  let favorites = JSON.parse(localStorage.getItem("devplayFavorites")) || [];

  // Add bounce effect to page header
  const header = document.querySelector(".header-container h1");
  if (header) {
    header.classList.add("bounce-animation");
  }

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

  // Add hover effect to module cards
  const moduleCards = document.querySelectorAll(".module-card");
  moduleCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.classList.add("wobble");
      setTimeout(() => {
        card.classList.remove("wobble");
      }, 1000);
    });

    // Add click animation for the card buttons
    const cardBtn = card.querySelector(".module-btn");
    if (cardBtn) {
      cardBtn.addEventListener("click", (e) => {
        createClickRipple(e);
      });
    }
  });
});

// Create confetti effect
function createConfetti() {
  const confettiCount = 100;
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    // Random colors
    const colors = [
      "#f94144",
      "#f3722c",
      "#f8961e",
      "#f9c74f",
      "#90be6d",
      "#43aa8b",
      "#577590",
    ];
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    // Random size
    const size = Math.random() * 10 + 5;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;

    // Random position
    confetti.style.left = `${Math.random() * 100}vw`;

    // Random rotation and animation duration
    const animDuration = Math.random() * 3 + 2;
    confetti.style.animationDuration = `${animDuration}s`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

    container.appendChild(confetti);

    // Remove confetti after animation
    setTimeout(() => {
      confetti.remove();
    }, animDuration * 1000);
  }

  // Clean up container after all confetti are gone
  setTimeout(() => {
    container.remove();
  }, 5000);
}

// Create floating bubbles background
function createFloatingBubbles() {
  const bubbleCount = 15;
  const container = document.createElement("div");
  container.className = "bubbles-container";
  document.body.appendChild(container);

  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement("div");
    bubble.className = "floating-bubble";

    // Random size
    const size = Math.random() * 100 + 50;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    // Random position
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.top = `${Math.random() * 100}vh`;

    // Random opacity
    bubble.style.opacity = Math.random() * 0.3;

    // Random animation duration
    bubble.style.animationDuration = `${Math.random() * 10 + 10}s`;

    container.appendChild(bubble);
  }
}

// Add ripple effect to buttons when clicked
function createClickRipple(event) {
  const button = event.currentTarget;

  const ripple = document.createElement("span");
  ripple.className = "ripple";

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

  button.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Add button hover effects
    const buttons = document.querySelectorAll('.module-btn', '.nav-item');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (document.querySelector('.magic-cursor')) {
                document.querySelector('.magic-cursor').style.width = '50px';
                document.querySelector('.magic-cursor').style.height = '50px';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (document.querySelector('.magic-cursor')) {
                document.querySelector('.magic-cursor').style.width = '30px';
                document.querySelector('.magic-cursor').style.height = '30px';
            }
        });
    });
