document.addEventListener('DOMContentLoaded', function() {
  // Add confetti effect when clicking a category button
  function createConfetti() {
    const confettiCount = 60;
    const container = document.createElement("div");
    container.className = "confetti-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.style.position = "absolute";
      confetti.style.top = "-10px";

      // Random colors
      const colors = ["#FF5FA2", "#6C63FF", "#FFC700", "#26C485", "#FF5E5B"];
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];

      // Random size
      const size = Math.random() * 10 + 5;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;

      // Random position
      confetti.style.left = `${Math.random() * 100}vw`;

      // Random rotation and animation
      const animDuration = Math.random() * 3 + 2;
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

      // Animation with keyframes
      confetti.animate(
        [
          { transform: "translateY(0) rotate(0deg)", opacity: 1 },
          {
            transform: `translateY(${window.innerHeight}px) rotate(${
              Math.random() * 720
            }deg)`,
            opacity: 0,
          },
        ],
        {
          duration: animDuration * 1000,
          easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
        }
      );

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

  // Add magic cursor effect
  document.addEventListener("mousemove", (e) => {
    const magicCursor = document.querySelector(".magic-cursor");
    if (magicCursor) {
      magicCursor.style.left = e.clientX + "px";
      magicCursor.style.top = e.clientY + "px";
    }
  });

  // Modified stack click handler to check if click is on favorite button
  document
    .querySelector("ul.card-stacks")
    .addEventListener("click", function (e) {
      // Check if the click target or any of its parents is a favorite button
      let target = e.target;
      while (target && target !== this) {
        if (
          target.classList &&
          (target.classList.contains("favorite-btn") ||
            target.parentElement.classList.contains("favorite-btn"))
        ) {
          // Don't toggle transition if clicking on favorite button
          return;
        }
        target = target.parentElement;
      }

      // Add click sound effect
      const clickSound = new Audio(
        "data:audio/wav;base64,UklGRpQGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABMSVNUfAAAAElORk9JQ09QHwAAAENvcHlyaWdodCCpIDIwMDMgYnkgVGVycmVuY2UgTW9udGdvbWVyeQAASVNGVCwAAABTb3VuZCBFZmZlY3QgZm9yIHBvcCBidXR0b24gb3IgdGFwIHNjcmVlbgAAZGF0YU4GAAD//wUAsADd/7EAsAD5/7sAqQDk/8AA0QEAA88ApwC4/9gA6QDQ/8oA2ADGANwAyQDXAMsA1gDBAL4AmwDIAOUA6gDiANIAwAC+AK4AqgCsAL0AygDFALMAowCRAI4AjwCIAIIAewB1AHQAdQB3AHUAcwBpAGcAVgBcAFoAYgBWAFwAYABdAGQAYgBsAG4AaQBuAG8AZwBmAGkAawBqAGsAcABuAHAAbQBsAGwAcgB4AHgAdgB2AHkAfAB7AHkAeQB+AIIAggCBAH4AfQCDAIUAhgCGAIUAhgCGAIgAigCKAIsAjQCOAI8AjwCRAJMAkwCUAJQAlQCYAJkAmQCbAJ0AngCeAJ4AnwCgAKMApQCnAKgAqACnAKYApgCnAKkAqQCqAKoAqQCrAK4AsQCyALIAsQCyALMAtQC3ALgAuQC5ALoAugC8AL0AvQC+AL8AwADCAMIAwwDEAMUAxgDGAMcAyADJAMsAzADMAMwAzQDPAM8A0ADQANAA0QDRANIA0gDTANMA1ADVANcA1wDYANgA2QDZANoA2wDcAN0A3QDeAN4A3wDgAOAA4QDiAOMA5ADkAOUA5QDmAOYA5wDoAOgA6QDpAOoA6wDrAOwA7ADtAO0A7gDvAO8A8ADwAPEA8gDyAPMA8wD0APQA9QD1APYA9wD3APgA+AD4APkA+QD6APsA+wD8APwA/QD9AP4A/gD/AP8AAAEAAQABAAEBAgEDAQMBAwEEAQQBBQEFAQUBBgEGAQcBBwEIAQgBCQEJAQkBCgEKAQoBCwELAQwBDAEMAQ0BDQENAQ4BDgEOAQ8BDwEQARABEAEQAREBEQESARIBEgETARMBEwEUARQBFAEUARUBFQEVARYBFgEWARcBFwEXARcBGAEYARgBGQEZARkBGQEaARoBGgEaARsBGwEbARsBHAEcARwBHAEdAR0BHQEdAR4BHgEeAR4BHgEfAR8BHwEfAR8BIAEgASABIAEgASEBIQEhASEBIQEhASIBIgEiASIBIgEjASMBIwEjASMBIwEkASQBJAEkASQBJAElASUBJQElASUBJQElASYBJgEmASYBJgEmASYBJwEnAScBJwEnAScBJwEnASgBKAEoASgBKAEoASgBKAEpASkBKQEpASkBKQEpASkBKQEqASoBKgEqASoBKgEqASoBKgEqASsBKwErASsBKwErASsBKwErASsBKwEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLQEtAS0BLQEtAS0BLQEtAS0BLQEtAS0BLQEtAS0BLQEtAS0BLQEtAS0BLQEuAS4BLgEuAS4BLgEuAS4BLgEuAS4BLgEuAS4BLgEuAS4BLgEuAS4BLgEuAS4BLgEuAS0BLQEtAS0BLQEtAS0BLQEtAS0BLQEtAS0BLQEtAS0BLQEtAS0BLQEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBKwErASsBKwErASsBKwErASsBKwErASoBKgEqASoBKgEqASoBKgEqASoBKgEpASkBKQEpASkBKQEpASkBKQEoASgBKAEoASgBKAEoASgBJwEnAScBJwEnAScBJwEmASYBJgEmASYBJgEmASUBJQElASUBJQElASUBJAEkASQBJAEkASMBIwEjASMBIwEiASIBIgEiASIBIQEhASEBIQEhASABIAEgASABHwEfAR8BHgEeAR4BHQEdAR0BHAEcARwBGwEbARsBGgEaARoBGQEZARkBGAEYARcBFwEWARYBFgEVARUBFAEUARMBEwESARIBEQERARABEAEPAQ8BDgEOAQ0BDQEMARIAGgANAAwA8f8SAPz/FQD5/xQA9f8dAPP/FQAGAPz/FQDn/ysA5/8oAOH/KgDm/x0A+f8NAA=="
      );
      clickSound.volume = 0.3;
      clickSound.play();

      // Only toggle if not clicking on favorite button
      this.classList.toggle("transition");

      // Add visual feedback
      const ripple = document.createElement("div");
      ripple.style.position = "fixed";
      ripple.style.borderRadius = "50%";
      ripple.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
      ripple.style.width = "0";
      ripple.style.height = "0";
      ripple.style.top = e.clientY + "px";
      ripple.style.left = e.clientX + "px";
      ripple.style.transform = "translate(-50%, -50%)";
      ripple.style.pointerEvents = "none";
      document.body.appendChild(ripple);

      ripple.animate(
        [
          { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
          { transform: "translate(-50%, -50%) scale(100)", opacity: 0 },
        ],
        {
          duration: 800,
          easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
        }
      );

      setTimeout(() => ripple.remove(), 800);
    });

  const gigglesContainer = document.getElementsByClassName("card-stacks")[0];
  const randomBtn = document.getElementById("random-btn");
  const hrBtn = document.getElementById("hr-btn");
  const pmBtn = document.getElementById("pm-btn");
  const frontendBtn = document.getElementById("frontend-btn");
  const methodsBtn = document.getElementById("methods-btn");
  const functionsBtn = document.getElementById("functions-btn");
  const awsBtn = document.getElementById("aws-btn");
  const azureBtn = document.getElementById("azure-btn");
  const googleBtn = document.getElementById("google-btn");
  const digitalOceanBtn = document.getElementById("digital-ocean-btn");

  // Favorites functionality
  let favorites =
    JSON.parse(localStorage.getItem("codeGigglesFavorites")) || [];

  let stack1, stack2, stack3, stack4;

  const createStacks = () => {
    stack1 = document.createElement("ul");
    stack1.classList.add("cards-down");

    stack2 = document.createElement("ul");
    stack2.classList.add("cards-down");

    stack3 = document.createElement("ul");
    stack3.classList.add("cards-down");

    stack4 = document.createElement("ul");
    stack4.classList.add("cards-down");

    document.getElementsByClassName("stack-1")[0].appendChild(stack1);
    document.getElementsByClassName("stack-2")[0].appendChild(stack2);
    document.getElementsByClassName("stack-3")[0].appendChild(stack3);
    document.getElementsByClassName("stack-4")[0].appendChild(stack4);
  };

  const loadGiggles = (category) => {
    fetch("giggles.json")
      .then((response) => response.json())
      .then((data) => {
        // data = gigglesData
        const giggles = category ? data[category] : data.random;
        // Store current category for use in favorite IDs
        const currentCategory = category || "random";
        // console.log(giggles.length)

        // Ensure stacks are created if they don't exist
        if (!stack1 || !stack2 || !stack3 || !stack4) {
          createStacks();
        }

        // Clear existing content in each stack
        stack1.innerHTML = "";
        stack2.innerHTML = "";
        stack3.innerHTML = "";
        stack4.innerHTML = "";

        // Counter for each stack
        let stack1Counter = 1;
        let stack2Counter = 1;
        let stack3Counter = 1;
        let stack4Counter = 1;

        // Distribute giggles into stacks
        giggles.forEach((giggle, index) => {
          const stackIndex = index % 4; // Modulo to distribute among four stacks
          const card = document.createElement("li");
          card.classList.add("card");

          // Determine and add the appropriate card-N class
          let cardClass;
          if (stackIndex === 0) {
            cardClass = `card-${stack1Counter}`;
            stack1Counter++;
          } else if (stackIndex === 1) {
            cardClass = `card-${stack2Counter}`;
            stack2Counter++;
          } else if (stackIndex === 2) {
            cardClass = `card-${stack3Counter}`;
            stack3Counter++;
          } else if (stackIndex === 3) {
            cardClass = `card-${stack4Counter}`;
            stack4Counter++;
          }

          card.classList.add(cardClass);

          // Generate a unique ID that includes the category
          const uniqueId = giggle.id || `${currentCategory}-${index}`;
          card.setAttribute("data-id", uniqueId);

          // Check if this giggle is in favorites
          const isFavorite = favorites.includes(uniqueId);

          const cardContent = document.createElement("div");
          cardContent.classList.add("card-content");
          cardContent.innerHTML = `
                    <div class="content">
                        <div class="giggle-header">
                            <h3>${giggle.question}</h3>
                            <button class="favorite-btn ${
                              isFavorite ? "active" : ""
                            }" data-id="${uniqueId}">
                                <i class="fa${
                                  isFavorite ? "s" : "r"
                                } fa-heart"></i>
                            </button>
                        </div>
                        <p>${giggle.answer}</p>
                        <pre><code>${giggle.example}</code></pre>
                    </div>
                `;

          const scrollContainer = document.createElement("div");
          scrollContainer.classList.add("scroll-container");
          scrollContainer.appendChild(cardContent);

          card.appendChild(scrollContainer);

          // Append card to the appropriate stack
          if (stackIndex === 0) {
            stack1.appendChild(card);
          } else if (stackIndex === 1) {
            stack2.appendChild(card);
          } else if (stackIndex === 2) {
            stack3.appendChild(card);
          } else if (stackIndex === 3) {
            stack4.appendChild(card);
          }
        });
      })
      .catch((error) => console.error("Error loading giggles:", error));
  };

  // Function to add bounce animation to button when clicked
  function addButtonAnimation(btn) {
    btn.style.transform = "scale(1.1)";
    setTimeout(() => {
      btn.style.transform = "scale(1)";
    }, 200);
  }

  // Add playful messages for each category
  const categoryMessages = {
    random: [
      "Time for a surprise giggle!",
      "Random fun coming up!",
      "Let's see what we get!",
    ],
    HR: [
      "HR humor incoming!",
      "Manager approved jokes!",
      "Corporate laughs loading...",
    ],
    PM: [
      "Project Manager special!",
      "Sprint into some laughs!",
      "Agile humor delivery!",
    ],
    frontend: [
      "UI/UX humor ahead!",
      "CSS jokes that don't break!",
      "Frontend fun loading...",
    ],
    methods: [
      "Method madness!",
      "Object-oriented laughs!",
      "Function with these jokes!",
    ],
    functions: [
      "Callback humor!",
      "Return some laughs!",
      "Parameter passing giggles!",
    ],
    aws: [
      "Cloud-based comedy!",
      "S3 bucket of laughs!",
      "Elastic humor scaling up!",
    ],
    azure: [
      "Microsoft approved jokes!",
      "Azure devOops moments!",
      "Cloud comedy deployed!",
    ],
    googleCloud: [
      "Google-sized giggles!",
      "BigQuery of laughs!",
      "Firebase funny moments!",
    ],
    digitalOcean: [
      "Droplet of humor!",
      "Ocean of laughs!",
      "Floating container jokes!",
    ],
  };

  // Function to display a message briefly
  function showCategoryMessage(category) {
    const messages = categoryMessages[category];
    const message = messages[Math.floor(Math.random() * messages.length)];

    const messageEl = document.createElement("div");
    messageEl.className = "category-message";
    messageEl.textContent = message;
    messageEl.style.position = "fixed";
    messageEl.style.top = "50%";
    messageEl.style.left = "50%";
    messageEl.style.transform = "translate(-50%, -50%)";
    messageEl.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    messageEl.style.color = "white";
    messageEl.style.padding = "15px 30px";
    messageEl.style.borderRadius = "30px";
    messageEl.style.fontFamily = "'Bubblegum Sans', cursive";
    messageEl.style.fontSize = "24px";
    messageEl.style.zIndex = "1000";
    messageEl.style.opacity = "0";
    messageEl.style.transition = "opacity 0.3s ease";

    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.style.opacity = "1";
    }, 10);

    setTimeout(() => {
      messageEl.style.opacity = "0";
      setTimeout(() => messageEl.remove(), 300);
    }, 1500);
  }

  randomBtn.addEventListener("click", () => {
    addButtonAnimation(randomBtn);
    showCategoryMessage("random");
    loadGiggles("random");
  });

  hrBtn.addEventListener("click", () => {
    addButtonAnimation(hrBtn);
    showCategoryMessage("HR");
    loadGiggles("HR");
  });

  pmBtn.addEventListener("click", () => {
    addButtonAnimation(pmBtn);
    showCategoryMessage("PM");
    loadGiggles("PM");
  });

  frontendBtn.addEventListener("click", () => {
    addButtonAnimation(frontendBtn);
    showCategoryMessage("frontend");
    loadGiggles("frontend");
  });

  methodsBtn.addEventListener("click", () => {
    addButtonAnimation(methodsBtn);
    showCategoryMessage("methods");
    loadGiggles("methods");
  });

  functionsBtn.addEventListener("click", () => {
    addButtonAnimation(functionsBtn);
    showCategoryMessage("functions");
    loadGiggles("functions");
  });

  awsBtn.addEventListener("click", () => {
    addButtonAnimation(awsBtn);
    showCategoryMessage("aws");
    loadGiggles("aws");
  });

  azureBtn.addEventListener("click", () => {
    addButtonAnimation(azureBtn);
    showCategoryMessage("azure");
    loadGiggles("azure");
  });

  googleBtn.addEventListener("click", () => {
    addButtonAnimation(googleBtn);
    showCategoryMessage("googleCloud");
    loadGiggles("googleCloud");
  });

  digitalOceanBtn.addEventListener("click", () => {
    addButtonAnimation(digitalOceanBtn);
    showCategoryMessage("digitalOcean");
    loadGiggles("digitalOcean");
  });

  // Load random jokes by default
  loadGiggles("random");

  // Auto-open the stack after a small delay to let content load
  setTimeout(() => {
    document.querySelector("ul.card-stacks").classList.add("transition");
  }, 500);

  // Handle favorite button clicks with heart animation
  document.addEventListener("click", function (e) {
    if (
      e.target &&
      (e.target.classList.contains("favorite-btn") ||
        e.target.parentElement.classList.contains("favorite-btn"))
    ) {
      // Both stop propagation and prevent default behavior
      e.stopPropagation();
      e.preventDefault();

      const btn = e.target.classList.contains("favorite-btn")
        ? e.target
        : e.target.parentElement;
      const giggleId = btn.getAttribute("data-id");

      // Add heart animation
      function createHeartAnimation(btn) {
        const heart = document.createElement("i");
        heart.className = "fas fa-heart floating-heart";
        heart.style.position = "absolute";
        heart.style.fontSize = "20px";
        heart.style.color = "#e74c3c";
        heart.style.left = "50%";
        heart.style.top = "50%";
        heart.style.transform = "translate(-50%, -50%)";
        heart.style.pointerEvents = "none";
        heart.style.zIndex = "100";
        btn.appendChild(heart);

        heart.animate(
          [
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
            { transform: "translate(-50%, -200%) scale(1.5)", opacity: 0 },
          ],
          {
            duration: 1000,
            easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
          }
        );

        setTimeout(() => heart.remove(), 1000);
      }

      // Toggle favorite status - using the unique category-specific ID
      if (favorites.includes(giggleId)) {
        // Remove from favorites
        favorites = favorites.filter((id) => id !== giggleId);
        btn.classList.remove("active");
        btn.querySelector("i").classList.remove("fas");
        btn.querySelector("i").classList.add("far");
      } else {
        // Add to favorites
        favorites.push(giggleId);
        btn.classList.add("active");
        btn.querySelector("i").classList.remove("far");
        btn.querySelector("i").classList.add("fas");
        createHeartAnimation(btn);
      }

      // Save to localStorage
      localStorage.setItem("codeGigglesFavorites", JSON.stringify(favorites));
    }
  });

  // Add click event listener to buttons to create confetti
  const allButtons = document.querySelectorAll(".fun-btn");
  allButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      createConfetti();
    });
  });

  // Update the fun facts periodically
  const funFacts = [
    "The first computer bug was literally a bug - a moth found trapped in a computer in 1947!",
    "The average programmer creates 70 bugs per 1000 lines of code.",
    "The term 'debugging' originated when Grace Hopper found a moth in a relay of a Harvard Mark II computer.",
    "JavaScript was created in just 10 days by Brendan Eich in 1995.",
    "There are about 700 programming languages in the world!",
    "The first computer programmer was a woman - Ada Lovelace.",
    "The 'rubber duck debugging' technique involves explaining your code line-by-line to a rubber duck.",
    "A programmer wrote 'quack' comments in code, leading to a rubber duck being the unofficial mascot of debugging.",
  ];

  function updateFunFact() {
    const factElement = document.querySelector(".fun-fact p");
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

    factElement.style.opacity = 0;
    setTimeout(() => {
      factElement.textContent = randomFact;
      factElement.style.opacity = 1;
    }, 500);
  }

  // Initial fact update and set interval
  setTimeout(updateFunFact, 3000);
  setInterval(updateFunFact, 20000);
});