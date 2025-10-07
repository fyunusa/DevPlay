document.addEventListener('DOMContentLoaded', () => {
    const jokesContainer = document.getElementById('jokes-container');
    const randomBtn = document.getElementById('random-btn');
    const engineersBtn = document.getElementById('engineers-btn');
    const lawBtn = document.getElementById('law-btn');
    const healthBtn = document.getElementById('health-btn');
    const funny_situations = document.getElementById('funny-situations-btn');
    const girlfriend = document.getElementById('girlfriend-btn');
    const days_of_the_week = document.getElementById('days-of-the-Week-btn');
    const procastination = document.getElementById('procrastination-btn');
    const cooking = document.getElementById('cooking-btn');
    const technology = document.getElementById('technology-btn');
    
    // Favorites functionality
    let favorites = JSON.parse(localStorage.getItem('secretsRevealedFavorites')) || [];
    
    
    const loadJokes = (category) => {
        fetch('jokes.json')
            .then(response => response.json())
            .then(data => {
                const jokes = category ? data[category] : data.random;
                jokesContainer.innerHTML = '';
                jokes.forEach(joke => {
                    const box = document.createElement('div');
                    box.classList.add('box');

                    const body = document.createElement('div');
                    body.classList.add('body');

                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('imgContainer');

                    const jokeHeader = document.createElement('div');
                    jokeHeader.classList.add('joke-header');
                    
                    const h3 = document.createElement('h3');
                    h3.classList.add('text-white', 'fs-5');
                    h3.textContent = joke.question;
                    
                    // Create favorite button
                    const jokeId = joke.id || jokes.indexOf(joke).toString();
                    const isFavorite = favorites.includes(jokeId);
                    const favBtn = document.createElement('button');
                    favBtn.classList.add('favorite-btn');
                    if (isFavorite) favBtn.classList.add('active');
                    favBtn.setAttribute('data-id', jokeId);
                    
                    const icon = document.createElement('i');
                    icon.classList.add(isFavorite ? 'fas' : 'far', 'fa-heart');
                    favBtn.appendChild(icon);
                    
                    jokeHeader.appendChild(h3);
                    jokeHeader.appendChild(favBtn);
                    
                    imgContainer.appendChild(jokeHeader);

                    const content = document.createElement('div');
                    content.classList.add('content', 'd-flex', 'flex-column', 'align-items-center', 'justify-content-center');

                    const contentDiv = document.createElement('div');
                    contentDiv.style.transform = 'translateZ(100px)';
                    contentDiv.style.background = 'linear-gradient(45deg, #FE0061,#FFEB3B)';
                    contentDiv.style.padding = '20px';

                    const p = document.createElement('p');
                    p.classList.add('fs-6', 'text-white');
                    p.textContent = joke.answer;

                    contentDiv.appendChild(p);
                    content.appendChild(contentDiv);
                    
                    body.appendChild(imgContainer);
                    body.appendChild(content);
                    box.appendChild(body);
                    jokesContainer.appendChild(box);
                });
            })
            .catch(error => console.error('Error loading jokes:', error));
    };

    randomBtn.addEventListener('click', () => loadJokes('random'));
    engineersBtn.addEventListener('click', () => loadJokes('engineer'));
    lawBtn.addEventListener('click', () => loadJokes('law'));
    healthBtn.addEventListener('click', () => loadJokes('health'));
    funny_situations.addEventListener('click', () => loadJokes('funny_situations'));
    girlfriend.addEventListener('click', () => loadJokes('Girlfriend'));
    days_of_the_week.addEventListener('click', () => loadJokes('Days_of_the_Week'));
    procastination.addEventListener('click', () => loadJokes('Procrastination'));
    cooking.addEventListener('click', () => loadJokes('Cooking'));
    technology.addEventListener('click', () => loadJokes('Technology'));
    

    // Load random jokes by default
    loadJokes('random');
    
    // Handle favorite button clicks
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.classList.contains('favorite-btn') || e.target.parentElement.classList.contains('favorite-btn'))) {
            const btn = e.target.classList.contains('favorite-btn') ? e.target : e.target.parentElement;
            const jokeId = btn.getAttribute('data-id');
            
            // Toggle favorite status
            if (favorites.includes(jokeId)) {
                // Remove from favorites
                favorites = favorites.filter(id => id !== jokeId);
                btn.classList.remove('active');
                btn.querySelector('i').classList.remove('fas');
                btn.querySelector('i').classList.add('far');
            } else {
                // Add to favorites
                favorites.push(jokeId);
                btn.classList.add('active');
                btn.querySelector('i').classList.remove('far');
                btn.querySelector('i').classList.add('fas');
            }
            
            // Save to localStorage
            localStorage.setItem('secretsRevealedFavorites', JSON.stringify(favorites));
        }
    });
});