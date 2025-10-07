document.addEventListener('DOMContentLoaded', function() {

    // Modified stack click handler to check if click is on favorite button
    document.querySelector('ul.card-stacks').addEventListener('click', function(e) {
        // Check if the click target or any of its parents is a favorite button
        let target = e.target;
        while (target && target !== this) {
            if (target.classList && (target.classList.contains('favorite-btn') || target.parentElement.classList.contains('favorite-btn'))) {
                // Don't toggle transition if clicking on favorite button
                return;
            }
            target = target.parentElement;
        }
        
        // Only toggle if not clicking on favorite button
        this.classList.toggle('transition');
    });

    const gigglesContainer = document.getElementsByClassName('card-stacks')[0];
    const randomBtn = document.getElementById('random-btn');
    const hrBtn = document.getElementById('hr-btn');
    const pmBtn = document.getElementById('pm-btn');
    const frontendBtn = document.getElementById('frontend-btn');
    const methodsBtn = document.getElementById('methods-btn');
    const functionsBtn = document.getElementById('functions-btn');
    const awsBtn = document.getElementById('aws-btn');
    const azureBtn = document.getElementById('azure-btn');
    const googleBtn = document.getElementById('google-btn');
    const digitalOceanBtn = document.getElementById('digital-ocean-btn');
    
    // Favorites functionality
    let favorites = JSON.parse(localStorage.getItem('codeGigglesFavorites')) || [];

    
    let stack1, stack2, stack3, stack4;

    const createStacks = () => {
        stack1 = document.createElement('ul');
        stack1.classList.add('cards-down');

        stack2 = document.createElement('ul');
        stack2.classList.add('cards-down');

        stack3 = document.createElement('ul');
        stack3.classList.add('cards-down');

        stack4 = document.createElement('ul');
        stack4.classList.add('cards-down');

        document.getElementsByClassName('stack-1')[0].appendChild(stack1);
        document.getElementsByClassName('stack-2')[0].appendChild(stack2);
        document.getElementsByClassName('stack-3')[0].appendChild(stack3);
        document.getElementsByClassName('stack-4')[0].appendChild(stack4);
    };
    
    const loadGiggles = (category) => {
        fetch('giggles.json')
            .then(response => response.json())
            .then(data => {
            // data = gigglesData
            const giggles = category ? data[category] : data.random;
            // Store current category for use in favorite IDs
            const currentCategory = category || 'random';
            // console.log(giggles.length)
            
            // Ensure stacks are created if they don't exist
            if (!stack1 || !stack2 || !stack3 || !stack4) {
                createStacks();
            }

            // Clear existing content in each stack
            stack1.innerHTML = '';
            stack2.innerHTML = '';
            stack3.innerHTML = '';
            stack4.innerHTML = '';

            // Counter for each stack
            let stack1Counter = 1;
            let stack2Counter = 1;
            let stack3Counter = 1;
            let stack4Counter = 1;

            // Distribute giggles into stacks
            giggles.forEach((giggle, index) => {
                const stackIndex = index % 4; // Modulo to distribute among four stacks
                const card = document.createElement('li');
                card.classList.add('card');
                
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
                card.setAttribute('data-id', uniqueId);
                
                // Check if this giggle is in favorites
                const isFavorite = favorites.includes(uniqueId);
                
                const cardContent = document.createElement('div');
                cardContent.classList.add('card-content');
                cardContent.innerHTML = `
                    <div class="content">
                        <div class="giggle-header">
                            <h3>${giggle.question}</h3>
                            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${uniqueId}">
                                <i class="fa${isFavorite ? 's' : 'r'} fa-heart"></i>
                            </button>
                        </div>
                        <p>${giggle.answer}</p>
                        <pre><code>${giggle.example}</code></pre>
                    </div>
                `;
            
                const scrollContainer = document.createElement('div');
                scrollContainer.classList.add('scroll-container');
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
        .catch(error => console.error('Error loading giggles:', error));
    };

    randomBtn.addEventListener('click', () => loadGiggles('random'));
    hrBtn.addEventListener('click', () => loadGiggles('HR'));
    pmBtn.addEventListener('click', () => loadGiggles('PM'));
    frontendBtn.addEventListener('click', () => loadGiggles('frontend'));
    methodsBtn.addEventListener('click', () => loadGiggles('methods'));
    functionsBtn.addEventListener('click', () => loadGiggles('functions'));
    awsBtn.addEventListener('click', () => loadGiggles('aws'));
    azureBtn.addEventListener('click', () => loadGiggles('azure'));
    googleBtn.addEventListener('click', () => loadGiggles('googleCloud'));
    digitalOceanBtn.addEventListener('click', () => loadGiggles('digitalOcean'));


    // Load random jokes by default
    loadGiggles('random');
    
    // Auto-open the stack after a small delay to let content load
    setTimeout(() => {
        document.querySelector('ul.card-stacks').classList.add('transition');
    }, 500);
    
    // Handle favorite button clicks
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.classList.contains('favorite-btn') || e.target.parentElement.classList.contains('favorite-btn'))) {
            // Both stop propagation and prevent default behavior
            e.stopPropagation();
            e.preventDefault();
            
            const btn = e.target.classList.contains('favorite-btn') ? e.target : e.target.parentElement;
            const giggleId = btn.getAttribute('data-id');
            
            // Toggle favorite status - using the unique category-specific ID
            if (favorites.includes(giggleId)) {
                // Remove from favorites
                favorites = favorites.filter(id => id !== giggleId);
                btn.classList.remove('active');
                btn.querySelector('i').classList.remove('fas');
                btn.querySelector('i').classList.add('far');
            } else {
                // Add to favorites
                favorites.push(giggleId);
                btn.classList.add('active');
                btn.querySelector('i').classList.remove('far');
                btn.querySelector('i').classList.add('fas');
            }
            
            // Save to localStorage
            localStorage.setItem('codeGigglesFavorites', JSON.stringify(favorites));
        }
    });
});