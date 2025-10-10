document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentGame = null;
    let currentQuestionIndex = 0;
    let currentQuestions = [];
    let userScore = 0;
    let selectedAnswer = null;
    let birthdayPerson = {
        name: '',
        department: ''
    };
    
    // DOM Elements
    const gameCards = document.querySelectorAll('.game-card');
    const gameArea = document.getElementById('game-area');
    const gameSelectionArea = document.getElementById('game-selection-area');
    const gameTitle = document.getElementById('game-title');
    const gameDescription = document.getElementById('game-description');
    const questionText = document.getElementById('question-text');
    const imageContainer = document.getElementById('image-container');
    const questionImage = document.getElementById('question-image');
    const optionsContainer = document.getElementById('options-container');
    const backToGamesBtn = document.getElementById('back-to-games');
    const submitAnswerBtn = document.getElementById('submit-answer');
    const nextQuestionBtn = document.getElementById('next-question');
    const playerScore = document.getElementById('player-score');
    
    // Birthday Person Elements
    const toggleBirthdayPersonBtn = document.getElementById('toggle-birthday-person');
    const birthdayPersonForm = document.getElementById('birthday-person-form');
    const birthdayPersonDisplay = document.getElementById('birthday-person-display');
    const celebrantNameInput = document.getElementById('celebrant-name');
    const celebrantDepartmentSelect = document.getElementById('celebrant-department');
    const saveBirthdayPersonBtn = document.getElementById('save-birthday-person');
    const cancelBirthdayPersonBtn = document.getElementById('cancel-birthday-person');
    const displayName = document.getElementById('display-name');
    const displayDepartment = document.getElementById('display-department');
    const editBirthdayPersonBtn = document.getElementById('edit-birthday-person');
    
    // Result Elements
    const resultModal = document.getElementById('result-modal');
    const resultTitle = document.getElementById('result-title');
    const resultBody = document.getElementById('result-body');
    const closeResultBtn = document.getElementById('close-result');
    const continueBtn = document.getElementById('continue-btn');
    const shareResultBtn = document.getElementById('share-result');
    
    // Birthday Card Elements
    const birthdayCardSection = document.getElementById('birthday-card-section');
    const cardName = document.getElementById('card-name');
    const cardMessages = document.getElementById('card-messages');
    const newMessageInput = document.getElementById('new-message');
    const messageNameInput = document.getElementById('message-name');
    const addMessageBtn = document.getElementById('add-message-btn');
    
    // Celebration Screen Elements
    const celebrationScreen = document.getElementById('celebration-screen');
    const finalScore = document.getElementById('final-score');
    const viewCardBtn = document.getElementById('view-card-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    // Hint Elements
    const hintBtn = document.getElementById('hint-btn');
    const hintTooltip = document.getElementById('hint-tooltip');
    const hintText = document.getElementById('hint-text');
    const closeHintBtn = document.getElementById('close-hint');
    
    // Magic cursor effect
    document.addEventListener("mousemove", (e) => {
        const magicCursor = document.querySelector(".magic-cursor");
        if (magicCursor) {
            magicCursor.style.left = e.clientX + "px";
            magicCursor.style.top = e.clientY + "px";
        }
    });
    
    // Load game data
    async function loadGameData(game) {
        try {
            const response = await fetch(`data/${game}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load data for ${game}: ${response.statusText}`);
            }
            const data = await response.json();
            
            // Validate data format
            if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
                throw new Error(`Invalid data format for ${game}`);
            }
            
            return data;
        } catch (error) {
            console.error("Error loading game data:", error);
            console.warn("Falling back to mock data for", game);
            return getMockGameData(game);
        }
    }
    
    // Mock game data in case the JSON files don't exist yet
    function getMockGameData(game) {
        const mockData = {
            'team-trivia': {
                title: "Team Trivia",
                description: "Test your knowledge about colleagues and company culture!",
                questions: [
                    {
                        id: 'tt-1',
                        text: "Which department typically handles employee onboarding?",
                        options: [
                            { text: "Sales", correct: false },
                            { text: "Human Resources", correct: true },
                            { text: "Quality Assurance", correct: false },
                            { text: "Development", correct: false }
                        ],
                        hint: "Think about who you met on your first day!"
                    },
                    {
                        id: 'tt-2',
                        text: "What does 'EOD' commonly mean in office communications?",
                        options: [
                            { text: "End of Discussion", correct: false },
                            { text: "Every Other Day", correct: false },
                            { text: "End of Day", correct: true },
                            { text: "Early Office Departure", correct: false }
                        ],
                        hint: "It's about timing and deadlines."
                    },
                    {
                        id: 'tt-3',
                        text: "Which team would most likely be responsible for User Experience design?",
                        options: [
                            { text: "Quality Assurance", correct: false },
                            { text: "Sales", correct: false },
                            { text: "Design", correct: true },
                            { text: "Finance", correct: false }
                        ],
                        hint: "Think about who creates the visual elements and workflows."
                    }
                ]
            },
            'office-challenges': {
                title: "Office Challenges",
                description: "Fun scenarios from different departments!",
                questions: [
                    {
                        id: 'oc-1',
                        text: "A client wants to meet but your calendar is full. What's the most professional response?",
                        options: [
                            { text: "Ignore their request until tomorrow", correct: false },
                            { text: "Tell them you're too busy", correct: false },
                            { text: "Suggest alternative times or delegate", correct: true },
                            { text: "Cancel your other appointments", correct: false }
                        ],
                        hint: "Consider what maintains relationships while respecting your time."
                    },
                    {
                        id: 'oc-2',
                        text: "Your manager asks for a status update on a project you've fallen behind on. What's your best approach?",
                        options: [
                            { text: "Say everything is fine and work overtime", correct: false },
                            { text: "Be honest, explain challenges, and present a solution", correct: true },
                            { text: "Blame team members for the delay", correct: false },
                            { text: "Ask for an extension without explanation", correct: false }
                        ],
                        hint: "Think about transparency and problem-solving."
                    },
                    {
                        id: 'oc-3',
                        text: "The sales team has promised a feature that development says will take 6 months to build. What's the best approach?",
                        options: [
                            { text: "Tell the client it's impossible", correct: false },
                            { text: "Have sales and development discuss compromise solutions", correct: true },
                            { text: "Build a quick, buggy version of the feature", correct: false },
                            { text: "Ignore the problem until the deadline", correct: false }
                        ],
                        hint: "Communication between departments is key."
                    }
                ]
            },
            'birthday-games': {
                title: "Birthday Games",
                description: "Classic party games with an office twist!",
                questions: [
                    {
                        id: 'bg-1',
                        text: "In office charades, which of these would be the hardest to act out?",
                        options: [
                            { text: "Conference call", correct: false },
                            { text: "Quarterly budget review", correct: false },
                            { text: "Cloud computing", correct: true },
                            { text: "Coffee break", correct: false }
                        ],
                        hint: "Think about which concept is most abstract."
                    },
                    {
                        id: 'bg-2',
                        text: "What's the office-appropriate version of 'Pin the Tail on the Donkey'?",
                        options: [
                            { text: "Pin the Blame on the Intern", correct: false },
                            { text: "Pin the Logo on the Company", correct: true },
                            { text: "Pin the Post-it on the Monitor", correct: false },
                            { text: "Pin the Memo on the Manager", correct: false }
                        ],
                        hint: "Which option is most positive and workplace-friendly?"
                    },
                    {
                        id: 'bg-3',
                        text: "Which birthday treat is most likely to disappear first from the office kitchen?",
                        options: [
                            { text: "Fruit platter", correct: false },
                            { text: "Vegetable tray with hummus", correct: false },
                            { text: "Plain bagels", correct: false },
                            { text: "Chocolate cake", correct: true }
                        ],
                        hint: "Sweet treats tend to go quickly!"
                    }
                ]
            }
        };
        
        return mockData[game];
    }
    
    // Display question
    function displayQuestion(question) {
        questionText.textContent = question.text;
        
        // Handle question image if available
        if (question.image) {
            imageContainer.classList.remove('hidden');
            questionImage.src = question.image;
            questionImage.alt = question.text;
        } else {
            imageContainer.classList.add('hidden');
        }
        
        // Generate options
        optionsContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.setAttribute('data-index', index);
            optionElement.innerHTML = `
                <div class="option-letter">${letters[index]}</div>
                <div class="option-text">${option.text}</div>
            `;
            optionsContainer.appendChild(optionElement);
            
            // Add event listener to select option
            optionElement.addEventListener('click', function() {
                // Remove selected class from all options
                document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                this.classList.add('selected');
                // Update selected answer
                selectedAnswer = index;
            });
        });
    }
    
    // Start game
    async function startGame(game) {
        // Load game data
        currentGame = game;
        const gameData = await loadGameData(game);
        currentQuestions = gameData.questions;
        currentQuestionIndex = 0;
        selectedAnswer = null;
        
        // Update UI
        gameTitle.textContent = gameData.title;
        gameDescription.textContent = gameData.description;
        
        // Hide game selection and show game area
        gameSelectionArea.classList.add('hidden');
        gameArea.classList.remove('hidden');
        
        // Display first question
        displayQuestion(currentQuestions[currentQuestionIndex]);
        
        // Update UI elements
        nextQuestionBtn.classList.add('hidden');
        submitAnswerBtn.classList.remove('hidden');
    }
    
    // Add confetti effect for correct answers
    function showConfetti() {
        const colors = ['#FF6B6B', '#6C63FF', '#FFD166', '#06D6A0', '#118AB2'];
        
        // Create confetti elements
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            document.body.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
        
        // Add confetti styles if not already present
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.innerHTML = `
                .confetti {
                    position: fixed;
                    top: -10px;
                    width: 10px;
                    height: 10px;
                    z-index: 999;
                    animation: fall linear forwards;
                }
                
                @keyframes fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Check answer
    function checkAnswer() {
        if (selectedAnswer === null) {
            alert('Please select an answer first!');
            return;
        }
        
        const currentQuestion = currentQuestions[currentQuestionIndex];
        const isCorrect = currentQuestion.options[selectedAnswer].correct;
        
        if (isCorrect) {
            // Update score
            userScore += 100;
            playerScore.textContent = userScore;
            
            // Show confetti for correct answer
            showConfetti();
            
            // Show success message
            resultTitle.textContent = 'Correct! 🎉';
            resultBody.innerHTML = `
                <div class="result-success">
                    <i class="fas fa-check-circle" style="color: var(--success); font-size: 48px; margin-bottom: 15px;"></i>
                    <p>Great job! You've earned 100 points!</p>
                    <p>Keep it up!</p>
                </div>
            `;
        } else {
            // Show failure message
            resultTitle.textContent = 'Not Quite Right 😕';
            resultBody.innerHTML = `
                <div class="result-failure">
                    <i class="fas fa-times-circle" style="color: var(--danger); font-size: 48px; margin-bottom: 15px;"></i>
                    <p>The correct answer was:</p>
                    <div class="correct-answer">${currentQuestion.options.find(opt => opt.correct).text}</div>
                    <p>Don't worry, keep going!</p>
                </div>
            `;
        }
        
        // Show result modal
        resultModal.classList.remove('hidden');
        
        // Hide submit button and show next button
        submitAnswerBtn.classList.add('hidden');
        nextQuestionBtn.classList.remove('hidden');
    }
    
    // Go to next question
    function nextQuestion() {
        currentQuestionIndex++;
        
        // If we've gone through all questions, show completion screen
        if (currentQuestionIndex >= currentQuestions.length) {
            resultModal.classList.add('hidden');
            
            // Update celebration screen
            finalScore.textContent = userScore;
            
            // Show celebration screen
            gameArea.classList.add('hidden');
            celebrationScreen.classList.remove('hidden');
            
            return;
        }
        
        // Display next question
        selectedAnswer = null;
        displayQuestion(currentQuestions[currentQuestionIndex]);
        
        // Update UI elements
        nextQuestionBtn.classList.add('hidden');
        submitAnswerBtn.classList.remove('hidden');
        
        // Hide result modal
        resultModal.classList.add('hidden');
    }
    
    // Handle birthday person
    function toggleBirthdayPerson() {
        if (birthdayPersonForm.classList.contains('hidden') && birthdayPersonDisplay.classList.contains('hidden')) {
            // Show form
            birthdayPersonForm.classList.remove('hidden');
            toggleBirthdayPersonBtn.classList.add('hidden');
        } else {
            // Hide form and display, show button
            birthdayPersonForm.classList.add('hidden');
            birthdayPersonDisplay.classList.add('hidden');
            toggleBirthdayPersonBtn.classList.remove('hidden');
        }
    }
    
    function saveBirthdayPerson() {
        const name = celebrantNameInput.value.trim();
        const department = celebrantDepartmentSelect.value;
        
        if (!name) {
            alert('Please enter a name.');
            return;
        }
        
        // Save birthday person info
        birthdayPerson.name = name;
        birthdayPerson.department = department;
        
        // Update display
        displayName.textContent = name;
        displayDepartment.textContent = department || 'N/A';
        
        // Update card name
        cardName.textContent = name;
        
        // Hide form, show display
        birthdayPersonForm.classList.add('hidden');
        birthdayPersonDisplay.classList.remove('hidden');
    }
    
    // Share result
    function shareResult() {
        let shareText;
        
        if (birthdayPerson.name) {
            shareText = `I scored ${userScore} points in the Birthday Bash game for ${birthdayPerson.name} on DevPlay Hub! Come join the celebration!`;
        } else {
            shareText = `I scored ${userScore} points in the Birthday Bash game on DevPlay Hub! Can you beat my score?`;
        }
        
        if (navigator.share) {
            navigator.share({
                title: 'My Birthday Bash Score!',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.error('Error sharing:', err);
                fallbackShare(shareText);
            });
        } else {
            fallbackShare(shareText);
        }
    }
    
    // Fallback share method
    function fallbackShare(text) {
        // Create a textarea to copy the text
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Share text copied to clipboard!');
    }
    
    // Add message to birthday card
    function addMessage() {
        const message = newMessageInput.value.trim();
        const name = messageNameInput.value.trim();
        
        if (!message) {
            alert('Please enter a message.');
            return;
        }
        
        if (!name) {
            alert('Please enter your name.');
            return;
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item';
        messageElement.innerHTML = `
            <div class="message-text">${message}</div>
            <div class="message-author">- ${name}</div>
        `;
        
        // Add message to card
        cardMessages.appendChild(messageElement);
        
        // Clear inputs
        newMessageInput.value = '';
        messageNameInput.value = '';
    }
    
    // Show hint
    function showHint() {
        const currentQuestion = currentQuestions[currentQuestionIndex];
        hintText.textContent = currentQuestion.hint || 'No hint available for this question.';
        hintTooltip.classList.remove('hidden');
    }
    
    // View birthday card
    function viewBirthdayCard() {
        celebrationScreen.classList.add('hidden');
        birthdayCardSection.classList.remove('hidden');
    }
    
    // Restart game
    function restartGame() {
        userScore = 0;
        playerScore.textContent = userScore;
        
        celebrationScreen.classList.add('hidden');
        gameSelectionArea.classList.remove('hidden');
    }
    
    // Event Listeners
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            startGame(card.getAttribute('data-game'));
        });
    });
    
    backToGamesBtn.addEventListener('click', () => {
        gameArea.classList.add('hidden');
        gameSelectionArea.classList.remove('hidden');
    });
    
    submitAnswerBtn.addEventListener('click', checkAnswer);
    nextQuestionBtn.addEventListener('click', nextQuestion);
    
    toggleBirthdayPersonBtn.addEventListener('click', toggleBirthdayPerson);
    saveBirthdayPersonBtn.addEventListener('click', saveBirthdayPerson);
    cancelBirthdayPersonBtn.addEventListener('click', toggleBirthdayPerson);
    editBirthdayPersonBtn.addEventListener('click', () => {
        birthdayPersonDisplay.classList.add('hidden');
        birthdayPersonForm.classList.remove('hidden');
    });
    
    hintBtn.addEventListener('click', showHint);
        // Continue from where the file was cut off
    closeHintBtn.addEventListener('click', () => hintTooltip.classList.add('hidden'));
    closeResultBtn.addEventListener('click', () => resultModal.classList.add('hidden'));
    continueBtn.addEventListener('click', nextQuestion);
    shareResultBtn.addEventListener('click', shareResult);
    
    // Birthday card elements
    addMessageBtn.addEventListener('click', addMessage);
    viewCardBtn.addEventListener('click', viewBirthdayCard);
    restartBtn.addEventListener('click', restartGame);
    
    // Add a button to go back to game selection from the birthday card section
    const backFromCardBtn = document.createElement('button');
    backFromCardBtn.className = 'btn back-btn';
    backFromCardBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Games';
    backFromCardBtn.addEventListener('click', () => {
        birthdayCardSection.classList.add('hidden');
        gameSelectionArea.classList.remove('hidden');
    });
    birthdayCardSection.appendChild(backFromCardBtn);
    
    // Add extra fun - balloon animation
    function addBalloons() {
        const colors = ['#FF6B6B', '#6C63FF', '#FFD166', '#06D6A0', '#118AB2'];
        
        // Add balloon styles if not present
        if (!document.getElementById('balloon-style')) {
            const style = document.createElement('style');
            style.id = 'balloon-style';
            style.innerHTML = `
                .balloon {
                    position: fixed;
                    bottom: -100px;
                    width: 40px;
                    height: 50px;
                    border-radius: 50%;
                    z-index: 99;
                    animation: float-up-balloon 15s linear forwards;
                }
                
                .balloon:before {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 2px;
                    height: 25px;
                    background: #888;
                }
                
                @keyframes float-up-balloon {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-120vh) rotate(20deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create a few balloons
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const balloon = document.createElement('div');
                balloon.className = 'balloon';
                balloon.style.left = Math.random() * 90 + 5 + 'vw';
                balloon.style.animationDuration = (Math.random() * 5 + 15) + 's';
                balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                document.body.appendChild(balloon);
                
                // Remove after animation
                setTimeout(() => {
                    balloon.remove();
                }, 20000);
            }, i * 1000);
        }
    }
    
    // Add party effect
    function addPartyEffect() {
        // Show confetti
        showConfetti();
        
        // Show balloons
        addBalloons();
        
        // Play celebration sound if available
        try {
            const audio = new Audio('sounds/celebration.mp3');
            audio.volume = 0.3;
            audio.play();
        } catch (error) {
            console.warn("Celebration sound could not be played:", error);
        }
    }
    
    // Add celebration effect to completion screen
    celebrationScreen.addEventListener('animationend', () => {
        if (!celebrationScreen.classList.contains('hidden')) {
            addPartyEffect();
        }
    });
    
    // Add party mode toggle
    const partyModeBtn = document.createElement('button');
    partyModeBtn.className = 'party-mode-btn';
    partyModeBtn.innerHTML = '<i class="fas fa-birthday-cake"></i>';
    partyModeBtn.title = "Toggle Party Mode";
    document.body.appendChild(partyModeBtn);
    
    partyModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('party-mode');
        if (document.body.classList.contains('party-mode')) {
            addPartyEffect();
        }
    });
    
    // Add styles for party mode
    if (!document.getElementById('party-mode-style')) {
        const style = document.createElement('style');
        style.id = 'party-mode-style';
        style.innerHTML = `
            .party-mode {
                background: linear-gradient(45deg, #FF6B6B, #6C63FF, #FFD166, #06D6A0);
                background-size: 400% 400%;
                animation: gradient-shift 10s ease infinite;
            }
            
            @keyframes gradient-shift {
                0% {
                    background-position: 0% 50%;
                }
                50% {
                    background-position: 100% 50%;
                }
                100% {
                    background-position: 0% 50%;
                }
            }
            
            .party-mode-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--primary);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                border: none;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                cursor: pointer;
                z-index: 100;
                transition: all 0.3s ease;
            }
            
            .party-mode-btn:hover {
                transform: scale(1.1);
                background: var(--secondary);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Save birthday card messages to localStorage
    function saveCardMessages() {
        if (!birthdayPerson.name) return;
        
        const messages = [];
        document.querySelectorAll('.message-item').forEach(item => {
            const text = item.querySelector('.message-text').textContent;
            const author = item.querySelector('.message-author').textContent.replace('- ', '');
            messages.push({ text, author });
        });
        
        localStorage.setItem(`birthday-card-${birthdayPerson.name}`, JSON.stringify(messages));
    }
    
    // Load birthday card messages from localStorage
    function loadCardMessages() {
        if (!birthdayPerson.name) return;
        
        const savedMessages = localStorage.getItem(`birthday-card-${birthdayPerson.name}`);
        if (!savedMessages) return;
        
        try {
            const messages = JSON.parse(savedMessages);
            
            // Clear existing messages
            cardMessages.innerHTML = '';
            
            // Add saved messages
            messages.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.className = 'message-item';
                messageElement.innerHTML = `
                    <div class="message-text">${msg.text}</div>
                    <div class="message-author">- ${msg.author}</div>
                `;
                cardMessages.appendChild(messageElement);
            });
        } catch (error) {
            console.error("Error loading saved messages:", error);
        }
    }
    
    // Update save message function to save to localStorage
    const originalAddMessage = addMessage;
    addMessage = function() {
        originalAddMessage();
        saveCardMessages();
    };
    
    // Update save birthday person to load saved messages
    const originalSaveBirthdayPerson = saveBirthdayPerson;
    saveBirthdayPerson = function() {
        originalSaveBirthdayPerson();
        loadCardMessages();
    };
    
    // Add button hover effects
    const buttons = document.querySelectorAll('.btn, .game-card');
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
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});