class SecurityChallengeGame {
  constructor() {
    this.currentLevel = 1;
    this.maxLevel = 10;
    this.score = 0;
    this.hintsLeft = 3;
    this.challenges = [];
    this.currentChallenge = null;
    this.foundVulnerabilities = [];
    this.codeEditor = document.getElementById('code-editor');
    this.originalCode = '';
    
    // Initialize the game
    this.init();
  }
  
  async init() {
    try {
      // Load game data
      this.challenges = await this.loadChallenges();
      
      // Setup code editor functionality
      this.setupEditor();
      
      // Set up the first level
      this.setupLevel(this.currentLevel);
      
      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize the game:', error);
      alert('Failed to load the game. Please try refreshing the page.');
    }
  }
  
  async loadChallenges() {
    const response = await fetch('../data/security-challenge.json');
    if (!response.ok) {
      throw new Error('Failed to load challenges');
    }
    return await response.json();
  }
  
  setupEditor() {
    // Add line numbers
    this.codeEditor.addEventListener('input', () => this.updateLineNumbers());
    this.codeEditor.addEventListener('scroll', () => {
      document.getElementById('line-numbers').scrollTop = this.codeEditor.scrollTop;
    });
    
    // Setup tab key behavior
    this.codeEditor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.codeEditor.selectionStart;
        const end = this.codeEditor.selectionEnd;
        
        // Insert tab character
        this.codeEditor.value = this.codeEditor.value.substring(0, start) + '  ' + this.codeEditor.value.substring(end);
        
        // Move cursor
        this.codeEditor.selectionStart = this.codeEditor.selectionEnd = start + 2;
      }
    });
  }
  
  updateLineNumbers() {
    const lines = this.codeEditor.value.split('\n');
    const lineNumbersContainer = document.getElementById('line-numbers');
    lineNumbersContainer.innerHTML = '';
    
    for (let i = 0; i < lines.length; i++) {
      const lineNumber = document.createElement('div');
      lineNumber.className = 'line-number';
      lineNumber.textContent = i + 1;
      lineNumbersContainer.appendChild(lineNumber);
    }
  }
  
  setupLevel(level) {
    // Get current challenge
    this.currentChallenge = this.challenges.find(c => c.level === level);
    if (!this.currentChallenge) {
      this.endGame(true);
      return;
    }
    
    // Reset game state
    this.foundVulnerabilities = [];
    
    // Update UI
    document.getElementById('current-level').textContent = level;
    document.getElementById('scenario-title').textContent = this.currentChallenge.title;
    document.getElementById('scenario-description').textContent = this.currentChallenge.description;
    document.getElementById('current-file').textContent = this.currentChallenge.filename;
    document.getElementById('vulnerabilities-found').textContent = '0';
    document.getElementById('total-vulnerabilities').textContent = this.currentChallenge.vulnerabilities.length;
    document.getElementById('vulnerability-list').innerHTML = '<p class="placeholder">Click "Check for Vulnerabilities" to analyze the code.</p>';
    
    // Highlight relevant categories
    const categories = this.currentChallenge.vulnerabilities.map(v => v.category);
    document.querySelectorAll('.category-pill').forEach(pill => {
      const category = pill.getAttribute('data-category');
      if (categories.includes(category)) {
        pill.classList.add('relevant');
      } else {
        pill.classList.remove('relevant');
      }
    });
    
    // Load code into editor
    this.codeEditor.value = this.currentChallenge.code;
    this.originalCode = this.currentChallenge.code;
    this.updateLineNumbers();
    
    // Clear vulnerability markers
    document.getElementById('vulnerability-markers').innerHTML = '';
  }
  
  setupEventListeners() {
    // Check vulnerabilities button
    document.getElementById('check-vulnerabilities').addEventListener('click', () => {
      this.checkVulnerabilities();
    });
    
    // Submit solution button
    document.getElementById('submit-solution').addEventListener('click', () => {
      this.submitSolution();
    });
    
    // Hint button
    document.getElementById('hint-btn').addEventListener('click', () => {
      this.showHint();
    });
    
    // Reset code button
    document.getElementById('reset-btn').addEventListener('click', () => {
      this.resetCode();
    });
    
    // Continue button in result modal
    document.getElementById('continue-btn').addEventListener('click', () => {
      document.getElementById('result-modal').style.display = 'none';
      
      // Check if we should advance to next level
      if (document.getElementById('result-title').textContent.includes('Great job')) {
        if (this.currentLevel < this.maxLevel) {
          this.currentLevel++;
          this.setupLevel(this.currentLevel);
        } else {
          this.endGame(true);
        }
      }
    });
    
    // Close buttons for modals
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
      });
    });
    
    // Category pill clicks
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        if (pill.classList.contains('relevant')) {
          this.showCategoryInfo(pill.getAttribute('data-category'));
        }
      });
    });
  }
  
  checkVulnerabilities() {
    const currentCode = this.codeEditor.value;
    const foundVulnerabilities = [];
    const markers = document.getElementById('vulnerability-markers');
    markers.innerHTML = '';
    
    // Check each vulnerability
    this.currentChallenge.vulnerabilities.forEach(vulnerability => {
      if (currentCode.includes(vulnerability.code)) {
        foundVulnerabilities.push(vulnerability);
        
        // Find the line number for this vulnerability
        const codeLines = currentCode.split('\n');
        let lineNumber = -1;
        for (let i = 0; i < codeLines.length; i++) {
          if (codeLines[i].includes(vulnerability.code)) {
            lineNumber = i;
            break;
          }
        }
        
        // Add marker if we found the line
        if (lineNumber >= 0) {
          const marker = document.createElement('div');
          marker.className = 'vuln-marker';
          marker.style.top = `${lineNumber * 20 + 10}px`; // Adjust based on line height
          marker.setAttribute('data-vuln-id', vulnerability.id);
          marker.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
          marker.title = vulnerability.name;
          markers.appendChild(marker);
          
          // Add click event to highlight the vulnerability
          marker.addEventListener('click', () => {
            this.highlightVulnerability(vulnerability);
          });
        }
      }
    });
    
    // Update the found vulnerabilities count
    this.foundVulnerabilities = foundVulnerabilities;
    document.getElementById('vulnerabilities-found').textContent = foundVulnerabilities.length;
    
    // Update the vulnerability list
    this.updateVulnerabilityList(foundVulnerabilities);
  }
  
  highlightVulnerability(vulnerability) {
    // Find the textarea position of the vulnerability
    const code = this.codeEditor.value;
    const startIndex = code.indexOf(vulnerability.code);
    if (startIndex >= 0) {
      const endIndex = startIndex + vulnerability.code.length;
      
      // Set selection in textarea
      this.codeEditor.focus();
      this.codeEditor.setSelectionRange(startIndex, endIndex);
      
      // Scroll to the vulnerability if needed
      const lineHeight = 20; // Adjust based on your CSS
      const lines = code.substring(0, startIndex).split('\n').length - 1;
      this.codeEditor.scrollTop = lines * lineHeight;
    }
  }
  
  updateVulnerabilityList(vulnerabilities) {
    const listContainer = document.getElementById('vulnerability-list');
    listContainer.innerHTML = '';
    
    if (vulnerabilities.length === 0) {
      const noVulnMsg = document.createElement('p');
      noVulnMsg.className = 'no-vulnerabilities';
      noVulnMsg.innerHTML = '<i class="fas fa-check-circle"></i> No vulnerabilities detected!';
      listContainer.appendChild(noVulnMsg);
      return;
    }
    
    // Create list of found vulnerabilities
    vulnerabilities.forEach(vuln => {
      const vulnItem = document.createElement('div');
      vulnItem.className = 'vulnerability-item';
      vulnItem.setAttribute('data-vuln-id', vuln.id);
      vulnItem.innerHTML = `
        <div class="vuln-header">
          <span class="vuln-name">${vuln.name}</span>
          <span class="vuln-category ${vuln.category}">${vuln.category}</span>
        </div>
        <div class="vuln-description">${vuln.description}</div>
      `;
      
      // Add click event to highlight the vulnerability
      vulnItem.addEventListener('click', () => {
        this.highlightVulnerability(vuln);
      });
      
      listContainer.appendChild(vulnItem);
    });
  }
  
  submitSolution() {
    // Re-check vulnerabilities first
    this.checkVulnerabilities();
    
    const currentCode = this.codeEditor.value;
    const allFixed = this.currentChallenge.vulnerabilities.every(vuln => !currentCode.includes(vuln.code));
    
    // Check if all vulnerabilities are fixed
    if (allFixed) {
      // Check if the solution contains all the required fixes
      const containsAllFixes = this.currentChallenge.solutions.every(solution => 
        currentCode.includes(solution.code)
      );
      
      if (containsAllFixes) {
        this.handleSuccess();
      } else {
        this.handlePartialSuccess();
      }
    } else {
      this.handleFailure();
    }
  }
  
  handleSuccess() {
    // Calculate score
    const vulnCount = this.currentChallenge.vulnerabilities.length;
    const levelScore = this.currentLevel * 100 + vulnCount * 50;
    this.score += levelScore;
    document.getElementById('score').textContent = this.score;
    
    // Show success message
    const resultModal = document.getElementById('result-modal');
    document.getElementById('result-title').textContent = 'Great job! All vulnerabilities fixed';
    document.getElementById('result-body').innerHTML = `
      <div class="success-message">
        <i class="fas fa-shield-check"></i>
        <p>You've successfully fixed all the security vulnerabilities!</p>
        <p>Points earned: ${levelScore}</p>
      </div>
      <div class="solutions-overview">
        <h3>Security Improvements:</h3>
        <ul>
          ${this.currentChallenge.solutions.map(solution => 
            `<li><span class="solution-name">${solution.name}:</span> ${solution.description}</li>`
          ).join('')}
        </ul>
      </div>
    `;
    
    resultModal.style.display = 'block';
  }
  
  handlePartialSuccess() {
    // Show partial success message
    const resultModal = document.getElementById('result-modal');
    document.getElementById('result-title').textContent = 'Almost there!';
    document.getElementById('result-body').innerHTML = `
      <div class="partial-success">
        <p>You've removed all the vulnerabilities, but your implementation may not be optimal.</p>
        <p>Check if you've implemented the best security practices.</p>
      </div>
      <div class="solutions-hints">
        <h3>Suggested Security Measures:</h3>
        <ul>
          ${this.currentChallenge.solutions.map(solution => 
            `<li>${solution.hint}</li>`
          ).join('')}
        </ul>
      </div>
    `;
    
    resultModal.style.display = 'block';
  }
  
  handleFailure() {
    // Show failure message
    const resultModal = document.getElementById('result-modal');
    document.getElementById('result-title').textContent = 'Security vulnerabilities remain';
    document.getElementById('result-body').innerHTML = `
      <div class="failure-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Your code still contains security vulnerabilities.</p>
        <p>Found: ${this.foundVulnerabilities.length}/${this.currentChallenge.vulnerabilities.length} vulnerabilities</p>
      </div>
      <p>Fix all identified issues and try again.</p>
    `;
    
    resultModal.style.display = 'block';
  }
  
  showHint() {
    if (this.hintsLeft <= 0) {
      alert('You have no hints left!');
      return;
    }
    
    this.hintsLeft--;
    document.getElementById('hints-left').textContent = this.hintsLeft;
    
    // Show a hint for an unfixed vulnerability
    const currentCode = this.codeEditor.value;
    const unfixedVulns = this.currentChallenge.vulnerabilities.filter(vuln => 
      currentCode.includes(vuln.code)
    );
    
    if (unfixedVulns.length > 0) {
      const vuln = unfixedVulns[0];
      document.getElementById('hint-text').innerHTML = `
        <p><strong>${vuln.name} vulnerability detected:</strong></p>
        <p>${vuln.hint}</p>
        <div class="code-snippet">
          <pre>${this.highlightVulnerableCode(vuln.code)}</pre>
        </div>
        <p>Try using: <code>${vuln.solution}</code></p>
      `;
    } else {
      // All vulnerabilities fixed, but maybe not optimally
      document.getElementById('hint-text').innerHTML = `
        <p><strong>Looking for optimization:</strong></p>
        <p>You've fixed the obvious vulnerabilities, but check if you've implemented these best practices:</p>
        <ul>
          ${this.currentChallenge.solutions.map(solution => 
            `<li>${solution.hint}</li>`
          ).join('')}
        </ul>
      `;
    }
    
    document.getElementById('hint-modal').style.display = 'block';
  }
  
  highlightVulnerableCode(code) {
    return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  
  resetCode() {
    if (confirm('Are you sure you want to reset the code? All your changes will be lost.')) {
      this.codeEditor.value = this.originalCode;
      this.updateLineNumbers();
      document.getElementById('vulnerability-markers').innerHTML = '';
      document.getElementById('vulnerability-list').innerHTML = '<p class="placeholder">Click "Check for Vulnerabilities" to analyze the code.</p>';
    }
  }
  
  showCategoryInfo(category) {
    // Show info about a specific vulnerability category
    const categoryInfo = {
      'sql-injection': {
        title: 'SQL Injection',
        description: 'SQL injection is a code injection technique that might destroy your database. Its one of the most common web hacking techniques.',
        example: "Example vulnerability: <code>$query = \"SELECT * FROM users WHERE username='$username'\";</code>",
        fix: "Use prepared statements: <code>$stmt = $conn->prepare('SELECT * FROM users WHERE username=?');</code>"
      },
      'xss': {
        title: 'Cross-Site Scripting (XSS)',
        description: 'XSS allows attackers to inject client-side scripts into web pages viewed by other users.',
        example: "Example vulnerability: <code>echo \"Welcome, \" . $_GET['name'];</code>",
        fix: "Use htmlspecialchars: <code>echo \"Welcome, \" . htmlspecialchars($_GET['name']);</code>"
      },
      'csrf': {
        title: 'Cross-Site Request Forgery (CSRF)',
        description: 'CSRF forces a logged-on victims browser to send a forged HTTP request to a vulnerable web application.',
        example: "Vulnerable form without CSRF token",
        fix: "Add and validate CSRF tokens in forms"
      },
      'auth': {
        title: 'Authentication Issues',
        description: 'Problems with how user authentication is handled, including weak password storage.',
        example: "Example vulnerability: <code>$password = md5($_POST['password']);</code>",
        fix: "Use password_hash: <code>$password = password_hash($_POST['password'], PASSWORD_DEFAULT);</code>"
      },
      'input': {
        title: 'Input Validation',
        description: 'Failure to validate user inputs can lead to various security issues.',
        example: "Example vulnerability: Using user input without validation",
        fix: "Validate and sanitize all user inputs before processing"
      }
    };
    
    const info = categoryInfo[category];
    if (info) {
      document.getElementById('hint-text').innerHTML = `
        <h3>${info.title}</h3>
        <p>${info.description}</p>
        <div class="category-example">
          <p><strong>Vulnerability:</strong></p>
          <p>${info.example}</p>
          <p><strong>Fix:</strong></p>
          <p>${info.fix}</p>
        </div>
      `;
      document.getElementById('hint-modal').style.display = 'block';
    }
  }
  
  endGame(success) {
    // Clear any intervals
    
    if (success) {
      // Player completed all levels
      document.getElementById('result-title').textContent = 'Congratulations!';
      document.getElementById('result-body').innerHTML = `
        <p>You've completed all levels of the PHP Security Challenge!</p>
        <p>Final score: ${this.score}</p>
        <div class="achievement">
          <i class="fas fa-shield-alt"></i>
          <span>PHP Security Expert</span>
        </div>
      `;
    } else {
      // Game ended for some other reason
      document.getElementById('result-title').textContent = 'Game Over';
      document.getElementById('result-body').innerHTML = `
        <p>Final score: ${this.score}</p>
      `;
    }
    
    // Replace continue button with restart button
    const continueBtn = document.getElementById('continue-btn');
    continueBtn.textContent = 'Play Again';
    continueBtn.onclick = () => window.location.reload();
    
    document.getElementById('result-modal').style.display = 'block';
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new SecurityChallengeGame();
});