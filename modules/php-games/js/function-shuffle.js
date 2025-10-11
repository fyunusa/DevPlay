class FunctionShuffleGame {
  constructor() {
    this.currentLevel = 1;
    this.maxLevel = 10;
    this.score = 0;
    this.hintsLeft = 3;
    this.timeRemaining = 120; // 2 minutes in seconds
    this.timer = null;
    this.challenges = [];
    this.currentChallenge = null;
    this.placedFunctions = [];
    
    // DOM elements
    this.functionSequenceEl = document.getElementById('function-sequence');
    this.functionPaletteEl = document.getElementById('function-palette');
    this.problemTitleEl = document.getElementById('problem-title');
    this.problemDescriptionEl = document.getElementById('problem-description');
    this.currentLevelEl = document.getElementById('current-level');
    this.scoreEl = document.getElementById('score');
    this.timeRemainingEl = document.getElementById('time-remaining');
    this.hintsLeftEl = document.getElementById('hints-left');
    this.resultModalEl = document.getElementById('result-modal');
    this.hintModalEl = document.getElementById('hint-modal');
    this.hintTextEl = document.getElementById('hint-text');
    
    // Initialize the game
    this.init();
  }
  
  async init() {
    try {
      // Load game data
      this.challenges = await this.loadChallenges();
      
      // Set up the first level
      this.setupLevel(this.currentLevel);
      
      // Start the timer
      this.startTimer();
      
      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize the game:', error);
      alert('Failed to load the game. Please try refreshing the page.');
    }
  }
  
  async loadChallenges() {
    const response = await fetch('../data/function-shuffle.json');
    if (!response.ok) {
      throw new Error('Failed to load challenges');
    }
    return await response.json();
  }
  
  setupLevel(level) {
    // Reset the game area
    this.placedFunctions = [];
    this.functionSequenceEl.innerHTML = '';
    this.functionPaletteEl.innerHTML = '';
    
    // Get the current challenge
    this.currentChallenge = this.challenges.find(c => c.level === level);
    if (!this.currentChallenge) {
      this.endGame(true);
      return;
    }
    
    // Update UI with challenge info
    this.problemTitleEl.textContent = this.currentChallenge.title;
    this.problemDescriptionEl.textContent = this.currentChallenge.description;
    this.currentLevelEl.textContent = level;
    
    // Create function elements in random order
    const functions = [...this.currentChallenge.functions];
    functions.sort(() => Math.random() - 0.5);
    
    functions.forEach(func => {
      const functionEl = this.createFunctionElement(func);
      this.functionPaletteEl.appendChild(functionEl);
    });
    
    // Update the prefix and suffix code if needed
    if (this.currentChallenge.prefix) {
      document.getElementById('code-prefix').textContent = this.currentChallenge.prefix;
    }
    if (this.currentChallenge.suffix) {
      document.getElementById('code-suffix').textContent = this.currentChallenge.suffix;
    }
  }
  
  createFunctionElement(func) {
    const functionEl = document.createElement('div');
    functionEl.className = 'function-item';
    functionEl.setAttribute('data-id', func.id);
    
    const syntaxHighlight = this.formatPhpFunction(func.code);
    functionEl.innerHTML = `<pre>${syntaxHighlight}</pre>`;
    
    functionEl.draggable = true;
    
    // Add drag events
    functionEl.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', func.id);
      functionEl.classList.add('dragging');
    });
    
    functionEl.addEventListener('dragend', () => {
      functionEl.classList.remove('dragging');
    });
    
    return functionEl;
  }
  
  formatPhpFunction(code) {
    // Simple syntax highlighting for PHP code
    return code
      .replace(/function\s+([a-zA-Z0-9_]+)/g, 'function <span class="function-name">$1</span>')
      .replace(/(\$[a-zA-Z0-9_]+)/g, '<span class="variable">$1</span>')
      .replace(/(\/\/[^\n]*)/g, '<span class="comment">$1</span>')
      .replace(/('.*?'|".*?")/g, '<span class="string">$&</span>')
      .replace(/\b(return|if|else|foreach|while|for|try|catch)\b/g, '<span class="keyword">$1</span>');
  }
  
  setupEventListeners() {
    // Drag and drop for function sequence
    this.functionSequenceEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = this.getDragAfterElement(this.functionSequenceEl, e.clientY);
      const dragging = document.querySelector('.dragging');
      if (dragging) {
        if (afterElement) {
          this.functionSequenceEl.insertBefore(dragging, afterElement);
        } else {
          this.functionSequenceEl.appendChild(dragging);
        }
      }
    });
    
    this.functionSequenceEl.addEventListener('drop', (e) => {
      e.preventDefault();
      const functionId = e.dataTransfer.getData('text/plain');
      const functionEl = document.querySelector(`[data-id="${functionId}"]`);
      
      if (functionEl && functionEl.parentElement === this.functionPaletteEl) {
        this.moveToSequence(functionEl);
      }
      
      this.updatePlacedFunctions();
    });
    
    // Check solution button
    document.getElementById('check-solution').addEventListener('click', () => {
      this.checkSolution();
    });
    
    // Hint button
    document.getElementById('hint-btn').addEventListener('click', () => {
      this.showHint();
    });
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
      this.resetLevel();
    });
    
    // Continue button in result modal
    document.getElementById('continue-btn').addEventListener('click', () => {
      this.resultModalEl.style.display = 'none';
      if (this.currentLevel < this.maxLevel) {
        this.currentLevel++;
        this.setupLevel(this.currentLevel);
      } else {
        this.endGame(true);
      }
    });
    
    // Close buttons for modals
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
      });
    });
    
    // Double-click to move functions back to palette
    this.functionSequenceEl.addEventListener('dblclick', (e) => {
      const functionEl = e.target.closest('.function-item');
      if (functionEl) {
        this.moveToFunctionPalette(functionEl);
        this.updatePlacedFunctions();
      }
    });
  }
  
  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.function-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  moveToSequence(functionEl) {
    this.functionSequenceEl.appendChild(functionEl);
    functionEl.classList.add('in-sequence');
  }
  
  moveToFunctionPalette(functionEl) {
    this.functionPaletteEl.appendChild(functionEl);
    functionEl.classList.remove('in-sequence');
  }
  
  updatePlacedFunctions() {
    this.placedFunctions = Array.from(this.functionSequenceEl.querySelectorAll('.function-item'))
      .map(el => el.getAttribute('data-id'));
  }
  
  checkSolution() {
    this.updatePlacedFunctions();
    
    const solution = this.currentChallenge.solution;
    const isCorrect = this.arraysEqual(this.placedFunctions, solution);
    
    if (isCorrect) {
      this.handleCorrectSolution();
    } else {
      this.handleIncorrectSolution();
    }
  }
  
  arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  }
  
  handleCorrectSolution() {
    // Calculate score based on level, time remaining, and hints used
    const timeBonus = Math.floor(this.timeRemaining / 2);
    const levelScore = this.currentLevel * 100 + timeBonus;
    this.score += levelScore;
    this.scoreEl.textContent = this.score;
    
    // Display success message
    document.getElementById('result-title').textContent = 'Great job!';
    document.getElementById('result-body').innerHTML = `
      <p>You've solved the problem correctly!</p>
      <p>You earned ${levelScore} points.</p>
      <div class="code-result">
        <h3>Output:</h3>
        <pre>${this.currentChallenge.output}</pre>
      </div>
    `;
    
    this.resultModalEl.style.display = 'block';
  }
  
  handleIncorrectSolution() {
    // Display error message
    document.getElementById('result-title').textContent = 'Not quite right';
    document.getElementById('result-body').innerHTML = `
      <p>Your function sequence doesn't match the expected solution.</p>
      <p>Try again or use a hint if you're stuck.</p>
    `;
    
    this.resultModalEl.style.display = 'block';
  }
  
  showHint() {
    if (this.hintsLeft <= 0) {
      alert('You have no hints left!');
      return;
    }
    
    this.hintsLeft--;
    this.hintsLeftEl.textContent = this.hintsLeft;
    
    // Get a hint based on current progress
    let hint = 'Check your function order.';
    
    if (this.placedFunctions.length === 0) {
      hint = this.currentChallenge.hints.start;
    } else if (this.placedFunctions.length < this.currentChallenge.solution.length) {
      // Find the first correctly placed functions
      let correctCount = 0;
      for (let i = 0; i < this.placedFunctions.length; i++) {
        if (this.placedFunctions[i] === this.currentChallenge.solution[i]) {
          correctCount++;
        } else {
          break;
        }
      }
      
      if (correctCount === this.placedFunctions.length) {
        // All placed so far are correct, hint at next function
        const nextFunctionId = this.currentChallenge.solution[correctCount];
        const nextFunction = this.currentChallenge.functions.find(f => f.id === nextFunctionId);
        hint = `You're on the right track! Next, you should use a function that ${nextFunction.hint}.`;
      } else {
        // Error in sequence
        hint = `Check your sequence. The first ${correctCount} functions are correct.`;
      }
    } else {
      // All functions placed but in wrong order
      hint = this.currentChallenge.hints.general;
    }
    
    // Show hint in modal
    this.hintTextEl.textContent = hint;
    this.hintModalEl.style.display = 'block';
  }
  
  resetLevel() {
    this.setupLevel(this.currentLevel);
  }
  
  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeRemaining <= 0) {
        this.endGame(false);
        return;
      }
      
      this.timeRemaining--;
      
      // Update timer display
      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      this.timeRemainingEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }
  
  endGame(success) {
    // Clear timer
    clearInterval(this.timer);
    
    if (success) {
      // Player completed all levels
      document.getElementById('result-title').textContent = 'Congratulations!';
      document.getElementById('result-body').innerHTML = `
        <p>You've completed all levels of PHP Function Shuffle!</p>
        <p>Final score: ${this.score}</p>
        <div class="achievement">
          <i class="fas fa-trophy"></i>
          <span>PHP Function Master</span>
        </div>
      `;
    } else {
      // Time ran out
      document.getElementById('result-title').textContent = 'Time\'s up!';
      document.getElementById('result-body').innerHTML = `
        <p>You ran out of time.</p>
        <p>Final score: ${this.score}</p>
      `;
    }
    
    // Replace continue button with restart button
    const continueBtn = document.getElementById('continue-btn');
    continueBtn.textContent = 'Play Again';
    continueBtn.onclick = () => window.location.reload();
    
    this.resultModalEl.style.display = 'block';
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new FunctionShuffleGame();
});