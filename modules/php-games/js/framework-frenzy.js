class FrameworkFrenzyGame {
  constructor() {
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.score = 0;
    this.hintsLeft = 3;
    this.timeRemaining = 60; // 1 minute in seconds
    this.timer = null;
    this.frameworks = [];
    this.useCases = [];
    this.matches = {};
    this.draggedItem = null;
    
    // Initialize the game
    this.init();
  }
  
  async init() {
    try {
      // Load game data
      const data = await this.loadGameData();
      this.allFrameworks = data.frameworks;
      this.allUseCases = data.useCases;
      this.levels = data.levels;
      
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
  
  async loadGameData() {
    const response = await fetch('../data/frameworks.json');
    if (!response.ok) {
      throw new Error('Failed to load game data');
    }
    return await response.json();
  }
  
  setupLevel(level) {
    // Clear any existing timers
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    // Get level data
    const levelData = this.levels.find(l => l.level === level);
    if (!levelData) {
      this.endGame(true);
      return;
    }
    
    // Reset game state
    this.matches = {};
    document.getElementById('frameworks-list').innerHTML = '';
    document.getElementById('use-cases-list').innerHTML = '';
    document.getElementById('framework-details').innerHTML = '<h3>Framework Details</h3><p class="detail-prompt">Click on a framework to see details</p>';
    
    // Update UI
    document.getElementById('current-level').textContent = level;
    document.getElementById('level-title').textContent = levelData.title;
    document.getElementById('level-description').textContent = levelData.description;
    
    // Reset timer
    this.timeRemaining = levelData.timeLimit || 60;
    this.updateTimerDisplay();
    this.startTimer();
    
    // Get frameworks and use cases for this level
    this.frameworks = levelData.frameworkIds.map(id => this.allFrameworks.find(f => f.id === id));
    this.useCases = levelData.useCaseIds.map(id => this.allUseCases.find(u => u.id === id));
    
    // Create framework elements
    this.frameworks.forEach(framework => {
      const frameworkEl = document.createElement('div');
      frameworkEl.className = 'framework-item';
      frameworkEl.setAttribute('data-id', framework.id);
      frameworkEl.draggable = true;
      
      frameworkEl.innerHTML = `
        <div class="framework-logo">
          <i class="fab ${framework.icon || 'fa-php'}"></i>
        </div>
        <div class="framework-name">${framework.name}</div>
      `;
      
      // Setup drag events
      frameworkEl.addEventListener('dragstart', (e) => {
        this.draggedItem = framework.id;
        frameworkEl.classList.add('dragging');
        e.dataTransfer.setData('text/plain', framework.id);
      });
      
      frameworkEl.addEventListener('dragend', () => {
        frameworkEl.classList.remove('dragging');
        this.draggedItem = null;
      });
      
      // Show framework details on click
      frameworkEl.addEventListener('click', () => {
        this.showFrameworkDetails(framework);
      });
      
      document.getElementById('frameworks-list').appendChild(frameworkEl);
    });
    
    // Create use case elements
    this.useCases.forEach(useCase => {
      const useCaseEl = document.createElement('div');
      useCaseEl.className = 'use-case-item';
      useCaseEl.setAttribute('data-id', useCase.id);
      
      useCaseEl.innerHTML = `
        <div class="use-case-content">
          <h4>${useCase.name}</h4>
          <p>${useCase.description}</p>
        </div>
        <div class="drop-area" data-use-case-id="${useCase.id}">
          <span class="drop-placeholder">Drop framework here</span>
        </div>
      `;
      
      // Setup drop events
      const dropArea = useCaseEl.querySelector('.drop-area');
      
      dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
      });
      
      dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
      });
      
      dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        
        const frameworkId = e.dataTransfer.getData('text/plain');
        this.placeFramework(frameworkId, useCase.id, dropArea);
      });
      
      document.getElementById('use-cases-list').appendChild(useCaseEl);
    });
  }
  
      placeFramework(frameworkId, useCaseId, dropArea) {
    // Check if another framework is already here
    if (this.matches[useCaseId]) {
      // Return the previous framework to the list
      const previousFrameworkId = this.matches[useCaseId];
      const previousFramework = this.frameworks.find(f => f.id === previousFrameworkId);
      
      if (previousFramework) {
        const frameworkEl = document.querySelector(`.framework-item[data-id="${previousFrameworkId}"]`);
        if (frameworkEl) {
          document.getElementById('frameworks-list').appendChild(frameworkEl);
        }
      }
    }
    
    // Update matches
    this.matches[useCaseId] = frameworkId;
    
    // Clear any existing framework in the drop area
    dropArea.innerHTML = '';
    const frameworkEl = document.querySelector(`.framework-item[data-id="${frameworkId}"]`);
    
    if (frameworkEl) {
      const clone = frameworkEl.cloneNode(true);
      clone.classList.add('placed');
      clone.draggable = false;
      
      // Add a remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-framework';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.addEventListener('click', () => {
        // Return framework to the list
        document.getElementById('frameworks-list').appendChild(frameworkEl);
        
        // Clear the drop area
        dropArea.innerHTML = '<span class="drop-placeholder">Drop framework here</span>';
        
        // Remove from matches
        delete this.matches[useCaseId];
      });
      
      clone.appendChild(removeBtn);
      dropArea.appendChild(clone);
      
      // Remove the original from the list
      frameworkEl.remove();
    }
    
    // Check if all use cases have been matched
    this.checkAllMatched();
  }

  // Add the rest of the methods here...

} // This closes the FrameworkFrenzyGame class

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new FrameworkFrenzyGame();
});