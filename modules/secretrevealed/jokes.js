// Confetti effect function
function createConfetti() {
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti-container";
  document.body.appendChild(confettiContainer);

  const colors = ["#FE0061", "#FFEB3B", "#7D3AC1", "#4CAF50", "#00BCD4"];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
    confetti.style.animationDelay = Math.random() * 5 + "s";
    confettiContainer.appendChild(confetti);
  }

  setTimeout(() => {
    confettiContainer.remove();
  }, 8000);
}

// Fun meter functionality
function updateFunMeter(value) {
  const funMeter = document.querySelector(".fun-meter-fill");
  if (funMeter) {
    funMeter.style.width = Math.min(100, Math.max(0, value)) + "%";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const jokesContainer = document.getElementById("jokes-container");
  const randomBtn = document.getElementById("random-btn");
  const engineersBtn = document.getElementById("engineers-btn");
  const lawBtn = document.getElementById("law-btn");
  const healthBtn = document.getElementById("health-btn");
  const funny_situations = document.getElementById("funny-situations-btn");
  const girlfriend = document.getElementById("girlfriend-btn");
  const days_of_the_week = document.getElementById("days-of-the-Week-btn");
  const procastination = document.getElementById("procrastination-btn");
  const cooking = document.getElementById("cooking-btn");
  const technology = document.getElementById("technology-btn");

  // Add magic cursor effect
  document.addEventListener("mousemove", (e) => {
    const magicCursor = document.querySelector(".magic-cursor");
    if (magicCursor) {
      magicCursor.style.left = e.clientX + "px";
      magicCursor.style.top = e.clientY + "px";
    }
  });

  // Favorites functionality
  let favorites =
    JSON.parse(localStorage.getItem("secretsRevealedFavorites")) || [];

  // Set initial fun meter
  updateFunMeter(40);

  const loadJokes = (category) => {
    fetch("jokes.json")
      .then((response) => response.json())
      .then((data) => {
        const jokes = category ? data[category] : data.random;
        jokesContainer.innerHTML = "";
        jokes.forEach((joke) => {
          const box = document.createElement("div");
          box.classList.add("box");

          const body = document.createElement("div");
          body.classList.add("body");

          const imgContainer = document.createElement("div");
          imgContainer.classList.add("imgContainer");

          const jokeHeader = document.createElement("div");
          jokeHeader.classList.add("joke-header");

          const h3 = document.createElement("h3");
          h3.classList.add("text-white", "fs-5");
          h3.textContent = joke.question;

          // Create favorite button
          const jokeId = joke.id || jokes.indexOf(joke).toString();
          const isFavorite = favorites.includes(jokeId);
          const favBtn = document.createElement("button");
          favBtn.classList.add("favorite-btn");
          if (isFavorite) favBtn.classList.add("active");
          favBtn.setAttribute("data-id", jokeId);

          const icon = document.createElement("i");
          icon.classList.add(isFavorite ? "fas" : "far", "fa-heart");
          favBtn.appendChild(icon);

          jokeHeader.appendChild(h3);
          jokeHeader.appendChild(favBtn);

          imgContainer.appendChild(jokeHeader);

          const content = document.createElement("div");
          content.classList.add(
            "content",
            "d-flex",
            "flex-column",
            "align-items-center",
            "justify-content-center"
          );

          const contentDiv = document.createElement("div");
          contentDiv.style.transform = "translateZ(100px)";
          contentDiv.style.background =
            "linear-gradient(45deg, #FE0061,#FFEB3B)";
          contentDiv.style.padding = "20px";

          const p = document.createElement("p");
          p.classList.add("fs-6", "text-white");
          p.textContent = joke.answer;

          contentDiv.appendChild(p);
          content.appendChild(contentDiv);

          body.appendChild(imgContainer);
          body.appendChild(content);
          box.appendChild(body);
          jokesContainer.appendChild(box);
        });
      })
      .catch((error) => console.error("Error loading jokes:", error));
  };

  randomBtn.addEventListener("click", () => loadJokes("random"));
  engineersBtn.addEventListener("click", () => loadJokes("engineer"));
  lawBtn.addEventListener("click", () => loadJokes("law"));
  healthBtn.addEventListener("click", () => loadJokes("health"));
  funny_situations.addEventListener("click", () =>
    loadJokes("funny_situations")
  );
  girlfriend.addEventListener("click", () => loadJokes("Girlfriend"));
  days_of_the_week.addEventListener("click", () =>
    loadJokes("Days_of_the_Week")
  );
  procastination.addEventListener("click", () => loadJokes("Procrastination"));
  cooking.addEventListener("click", () => loadJokes("Cooking"));
  technology.addEventListener("click", () => loadJokes("Technology"));

  // Load random jokes by default
  loadJokes("random");

  // Add button animations and sound effects
  const categoryButtons = document.querySelectorAll(".category-btn");
  categoryButtons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      btn.classList.add("pulse-animation");
    });

    btn.addEventListener("mouseleave", () => {
      btn.classList.remove("pulse-animation");
    });

    btn.addEventListener("click", () => {
      // Button click animation
      btn.classList.add("button-clicked");
      setTimeout(() => {
        btn.classList.remove("button-clicked");
      }, 300);

      // Update fun meter randomly
      updateFunMeter(Math.floor(Math.random() * 60) + 40);
    });
  });

  // Enhanced card flip effect
  jokesContainer.addEventListener(
    "mouseenter",
    (e) => {
      const box = e.target.closest(".box");
      if (box) {
        box.style.transform = "scale(1.03)";
        box.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
      }
    },
    true
  );

  jokesContainer.addEventListener(
    "mouseleave",
    (e) => {
      const box = e.target.closest(".box");
      if (box) {
        box.style.transform = "scale(1)";
        box.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
      }
    },
    true
  );

  // Handle favorite button clicks with enhanced effects
  document.addEventListener("click", function (e) {
    if (
      e.target &&
      (e.target.classList.contains("favorite-btn") ||
        e.target.parentElement.classList.contains("favorite-btn"))
    ) {
      const btn = e.target.classList.contains("favorite-btn")
        ? e.target
        : e.target.parentElement;
      const jokeId = btn.getAttribute("data-id");

      // Toggle favorite status
      if (favorites.includes(jokeId)) {
        // Remove from favorites
        favorites = favorites.filter((id) => id !== jokeId);
        btn.classList.remove("active");
        btn.querySelector("i").classList.remove("fas");
        btn.querySelector("i").classList.add("far");
      } else {
        // Add to favorites
        favorites.push(jokeId);
        btn.classList.add("active");
        btn.querySelector("i").classList.remove("far");
        btn.querySelector("i").classList.add("fas");

        // Trigger confetti for adding favorites
        createConfetti();

        // Increase fun meter
        const currentWidth =
          parseInt(document.querySelector(".fun-meter-fill").style.width) || 40;
        updateFunMeter(currentWidth + 5);
      }

      // Save to localStorage
      localStorage.setItem(
        "secretsRevealedFavorites",
        JSON.stringify(favorites)
      );

      // Add heart pop animation
      const heart = document.createElement("div");
      heart.className = "heart-pop";
      heart.innerHTML = "❤️";
      heart.style.left = e.clientX - 10 + "px";
      heart.style.top = e.clientY - 10 + "px";
      document.body.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 1000);
    }
  });

  // Add special Easter egg
  let clickCount = 0;
  const easterEggMessage = document.createElement("div");
  easterEggMessage.className = "easter-egg-message";
  easterEggMessage.textContent = "🎉 You found the secret joke! 🎉";
  easterEggMessage.style.display = "none";
  document.body.appendChild(easterEggMessage);

  document.querySelector(".header h1").addEventListener("click", () => {
    clickCount++;
    if (clickCount >= 5) {
      easterEggMessage.style.display = "block";
      createConfetti();
      updateFunMeter(100);

      setTimeout(() => {
        const secretJoke = {
          question: "Why did the developer go broke?",
          answer: "Because they lost their domain in the cloud!",
        };

        const box = document.createElement("div");
        box.classList.add("box", "secret-box");

        const body = document.createElement("div");
        body.classList.add("body");

        const imgContainer = document.createElement("div");
        imgContainer.classList.add("imgContainer");
        imgContainer.innerHTML =
          '<div class="joke-header"><h3 class="text-white fs-5">🔒 ' +
          secretJoke.question +
          "</h3></div>";

        const content = document.createElement("div");
        content.classList.add(
          "content",
          "d-flex",
          "flex-column",
          "align-items-center",
          "justify-content-center"
        );

        const contentDiv = document.createElement("div");
        contentDiv.style.transform = "translateZ(100px)";
        contentDiv.style.background = "linear-gradient(45deg, gold, #FE0061)";
        contentDiv.style.padding = "20px";

        const p = document.createElement("p");
        p.classList.add("fs-6", "text-white");
        p.textContent = secretJoke.answer;

        contentDiv.appendChild(p);
        content.appendChild(contentDiv);

        body.appendChild(imgContainer);
        body.appendChild(content);
        box.appendChild(body);

        // Insert at the beginning of the container
        jokesContainer.insertBefore(box, jokesContainer.firstChild);

        // Hide message after a while
        setTimeout(() => {
          easterEggMessage.style.display = "none";
        }, 3000);
      }, 1000);
    }
  });
});
