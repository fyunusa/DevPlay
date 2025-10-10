/* filepath: /Users/fyunusa/Documents/Devplay/modules/codebattles/battles.js */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentMode = null;
    let currentChallengeIndex = 0;
    let currentChallenges = [];
    let userScore = 0;
    let userLevel = 1;
    let selectedAnswer = null;
    
    // DOM Elements
    const battleModes = document.querySelectorAll('.battle-mode');
    const challengeContainer = document.querySelector('.challenge-container');
    const battleModesContainer = document.querySelector('.battle-modes');
    const challengeTitle = document.getElementById('challenge-title');
    const challengeDescription = document.getElementById('challenge-description');
    const challengeCode = document.getElementById('challenge-code');
    const optionsContainer = document.getElementById('options-container');
    const backToModesBtn = document.getElementById('back-to-modes');
    const submitAnswerBtn = document.getElementById('submit-answer');
    const nextChallengeBtn = document.getElementById('next-challenge');
    const hintBtn = document.getElementById('hint-btn');
    const hintTooltip = document.getElementById('hint-tooltip');
    const hintText = document.getElementById('hint-text');
    const closeHintBtn = document.getElementById('close-hint');
    const resultModal = document.getElementById('result-modal');
    const resultTitle = document.getElementById('result-title');
    const resultBody = document.getElementById('result-body');
    const closeResultBtn = document.getElementById('close-result');
    const continueBtn = document.getElementById('continue-btn');
    const shareResultBtn = document.getElementById('share-result');
    const playerLevelValue = document.querySelector('.level-value');
    const playerScoreValue = document.querySelector('.score-value');
    const leaderboard = document.getElementById('leaderboard');
    
    // Magic cursor effect
    document.addEventListener("mousemove", (e) => {
        const magicCursor = document.querySelector(".magic-cursor");
        if (magicCursor) {
            magicCursor.style.left = e.clientX + "px";
            magicCursor.style.top = e.clientY + "px";
        }
    });
    
    // Initialize highlight.js
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
    
    // Load challenges data
    async function loadChallenges(mode) {
        try {
            const response = await fetch(`data/${mode}.json`);
            const data = await response.json();
            return data.challenges;
        } catch (error) {
            console.error("Error loading challenges:", error);
        }
    }
    
    // Load leaderboard data
    function loadLeaderboard() {
        // Mock leaderboard data
        const mockLeaderboard = [
            { name: 'CodeNinja', title: 'Bug Slayer', score: 850 },
            { name: 'AlgoQueen', title: 'Sort Master', score: 720 },
            { name: 'DevWarrior', title: 'Logic Wizard', score: 695 },
            { name: 'ByteWrangler', title: 'Syntax Expert', score: 630 },
            { name: 'LoopMaster', title: 'Recursion Guru', score: 580 }
        ];
        
        // Clear existing content
        leaderboard.innerHTML = '';
        
        // Generate leaderboard items
        mockLeaderboard.forEach((player, index) => {
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = 'leaderboard-item';
            leaderboardItem.innerHTML = `
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${player.name}</div>
                    <div class="leaderboard-title">${player.title}</div>
                </div>
                <div class="leaderboard-score">${player.score} pts</div>
            `;
            leaderboard.appendChild(leaderboardItem);
        });
    }
    
    // Display challenge
    function displayChallenge(challenge) {
        challengeTitle.textContent = challenge.title;
        challengeDescription.textContent = challenge.description;
        challengeCode.textContent = challenge.code;
        hljs.highlightElement(challengeCode);
        
        // Generate options
        optionsContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        challenge.options.forEach((option, index) => {
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
    
    // Start a battle mode
    async function startBattleMode(mode) {
        // Load challenges for the selected mode
        currentMode = mode;
        currentChallenges = await loadChallenges(mode);
        currentChallengeIndex = 0;
        selectedAnswer = null;
        
        // Hide battle modes and show challenge container
        battleModesContainer.classList.add('hidden');
        challengeContainer.classList.remove('hidden');
        
        // Display first challenge
        displayChallenge(currentChallenges[currentChallengeIndex]);
        
        // Update UI elements
        nextChallengeBtn.classList.add('hidden');
        submitAnswerBtn.classList.remove('hidden');
    }
    
    // Add confetti effect for correct answers
    function showConfetti() {
        const colors = ['#FF6B6B', '#6C63FF', '#FFD166', '#06D6A0'];
        
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
        
        const currentChallenge = currentChallenges[currentChallengeIndex];
        const isCorrect = currentChallenge.options[selectedAnswer].correct;
        
        if (isCorrect) {
            // Update score
            userScore += 100;
            playerScoreValue.textContent = userScore;
            
            // Level up every 300 points
            if (userScore % 300 === 0) {
                userLevel++;
                playerLevelValue.textContent = userLevel;
                showLevelUpAnimation();
            }
            
            // Show confetti for correct answer
            showConfetti();
            
            // Show success message
            resultTitle.textContent = 'Correct! 🎉';
            resultBody.innerHTML = `
                <div class="result-success">
                    <i class="fas fa-check-circle" style="color: var(--success); font-size: 48px; margin-bottom: 15px;"></i>
                    <p>Great job! You've earned 100 points!</p>
                    <div class="earned-badge">
                        <div class="badge-icon"><i class="fas fa-${getBadgeIcon(currentMode)}"></i></div>
                        <div class="badge-text">Badge earned: ${getBadgeTitle(currentMode, currentChallengeIndex)}</div>
                    </div>
                </div>
            `;
        } else {
            // Show failure message
            resultTitle.textContent = 'Not Quite Right 😕';
            resultBody.innerHTML = `
                <div class="result-failure">
                    <i class="fas fa-times-circle" style="color: var(--danger); font-size: 48px; margin-bottom: 15px;"></i>
                    <p>The correct answer was:</p>
                    <div class="correct-answer">${currentChallenge.options.find(opt => opt.correct).text}</div>
                    <p>Don't worry, keep practicing!</p>
                </div>
            `;
        }
        
        // Show result modal
        resultModal.classList.remove('hidden');
        
        // Hide submit button and show next button
        submitAnswerBtn.classList.add('hidden');
        nextChallengeBtn.classList.remove('hidden');
    }
    
    // Get badge icon based on mode
    function getBadgeIcon(mode) {
        switch (mode) {
            case 'bug-boss': return 'bug';
            case 'algorithm-arena': return 'sort';
            case 'syntax-showdown': return 'code';
            default: return 'award';
        }
    }
    
    // Get badge title based on mode and challenge index
    function getBadgeTitle(mode, index) {
        const titles = {
            'bug-boss': ['Bug Squasher', 'Debug Maestro', 'Error Eliminator'],
            'algorithm-arena': ['Algorithm Apprentice', 'Sort Sorcerer', 'Data Structure Sage'],
            'syntax-showdown': ['Syntax Scholar', 'Code Linguist', 'Language Laureate']
        };
        
        return titles[mode][index] || 'Code Warrior';
    }
    
    // Show level up animation
    function showLevelUpAnimation() {
        // Create level up notification
        const levelUpNotification = document.createElement('div');
        levelUpNotification.className = 'level-up-notification';
        levelUpNotification.innerHTML = `
            <i class="fas fa-arrow-up"></i>
            <span>Level Up! You are now level ${userLevel}</span>
        `;
        document.body.appendChild(levelUpNotification);
        
        // Add styles if not present
        if (!document.getElementById('level-up-style')) {
            const style = document.createElement('style');
            style.id = 'level-up-style';
            style.innerHTML = `
                .level-up-notification {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--success);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 50px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-family: 'Press Start 2P', cursive;
                    font-size: 0.9rem;
                    animation: level-up-in 0.5s ease-out forwards, level-up-out 0.5s ease-in forwards 3s;
                }
                
                @keyframes level-up-in {
                    from { transform: translate(-50%, -50px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                
                @keyframes level-up-out {
                    from { transform: translate(-50%, 0); opacity: 1; }
                    to { transform: translate(-50%, -50px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove after animation
        setTimeout(() => {
            levelUpNotification.remove();
        }, 3500);
    }
    
    // Go to next challenge
    function nextChallenge() {
        currentChallengeIndex++;
        
        // If we've gone through all challenges, return to battle modes
        if (currentChallengeIndex >= currentChallenges.length) {
            resultModal.classList.add('hidden');
            challengeContainer.classList.add('hidden');
            battleModesContainer.classList.remove('hidden');
            
            // Show completion message
            setTimeout(() => {
                alert(`You've completed all ${currentMode.replace('-', ' ')} challenges! Choose another battle mode to continue.`);
            }, 300);
            
            return;
        }
        
        // Display next challenge
        selectedAnswer = null;
        displayChallenge(currentChallenges[currentChallengeIndex]);
        
        // Update UI elements
        nextChallengeBtn.classList.add('hidden');
        submitAnswerBtn.classList.remove('hidden');
        
        // Hide result modal
        resultModal.classList.add('hidden');
    }
    
    // Share result
    function shareResult() {
        const shareText = `I just earned the "${getBadgeTitle(currentMode, currentChallengeIndex)}" badge in Code Battles on DevPlay Hub! My score: ${userScore} points. Can you beat it?`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Code Battle Achievement!',
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
    
    // Show hint
    function showHint() {
        const currentChallenge = currentChallenges[currentChallengeIndex];
        hintText.textContent = currentChallenge.hint || 'No hint available for this challenge.';
        hintTooltip.classList.remove('hidden');
    }
    
    // Event Listeners
    battleModes.forEach(mode => {
        mode.addEventListener('click', () => {
            startBattleMode(mode.dataset.mode);
        });
    });
    
    backToModesBtn.addEventListener('click', () => {
        challengeContainer.classList.add('hidden');
        battleModesContainer.classList.remove('hidden');
    });
    
    submitAnswerBtn.addEventListener('click', checkAnswer);
    nextChallengeBtn.addEventListener('click', nextChallenge);
    hintBtn.addEventListener('click', showHint);
    closeHintBtn.addEventListener('click', () => hintTooltip.classList.add('hidden'));
    closeResultBtn.addEventListener('click', () => resultModal.classList.add('hidden'));
    continueBtn.addEventListener('click', nextChallenge);
    shareResultBtn.addEventListener('click', shareResult);
    
    // Initialize leaderboard
    loadLeaderboard();
    
    // Add button hover effects
    const buttons = document.querySelectorAll('.btn, .battle-mode');
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
});