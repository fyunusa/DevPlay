class CommitHistoryTimeline {
  constructor() {
    this.level = 1;
    this.score = 0;
    this.commits = [];
    this.targetOrder = [];
    this.currentOrder = [];
    this.hintsUsed = 0;
    
    this.initGame();
    this.bindEvents();
  }
  
  initGame() {
    // Generate level data
    const levelData = this.generateLevel(this.level);
    this.commits = levelData.commits;
    this.targetOrder = levelData.targetOrder;
    
    // Shuffle commits for initial state
    this.currentOrder = [...this.commits]
      .map(commit => commit.id)
      .sort(() => Math.random() - 0.5);
    
    // Render the game
    this.renderTimeline();
    this.renderTargetTimeline();
    
    // Update UI
    document.getElementById("timeline-level").textContent = this.level;
    document.getElementById("timeline-score").textContent = this.score;
  }
  
  bindEvents() {
    // Check solution button
    document.getElementById("check-solution").addEventListener("click", () => {
      this.checkSolution();
    });
    
    // Reset button
    document.getElementById("reset-timeline").addEventListener("click", () => {
      this.resetTimeline();
    });
    
    // Show hint button
    document.getElementById("show-hint").addEventListener("click", () => {
      this.showHint();
    });
  }
  
  renderTimeline() {
    const container = document.getElementById("current-timeline");
    container.innerHTML = "";
    
    // Create draggable commits
    this.currentOrder.forEach((commitId, index) => {
      const commit = this.commits.find(c => c.id === commitId);
      const commitEl = document.createElement("div");
      commitEl.className = "commit-item";
      commitEl.setAttribute("data-id", commit.id);
      commitEl.draggable = true;
      
      commitEl.innerHTML = `
        <div class="commit-hash">${commit.id.substring(0, 7)}</div>
        <div class="commit-message">${commit.message}</div>
        <div class="commit-author">${commit.author}</div>
      `;
      
      // Add drag and drop event listeners
      commitEl.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", index);
        commitEl.classList.add("dragging");
      });
      
      commitEl.addEventListener("dragend", () => {
        commitEl.classList.remove("dragging");
      });
      
      commitEl.addEventListener("click", () => {
        this.showCommitDetails(commit);
      });
      
      container.appendChild(commitEl);
    });
    
    // Add drop zone functionality
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = this.getDragAfterElement(container, e.clientY);
      const draggable = document.querySelector(".dragging");
      
      if (afterElement) {
        container.insertBefore(draggable, afterElement);
      } else {
        container.appendChild(draggable);
      }
    });
    
    container.addEventListener("drop", (e) => {
      e.preventDefault();
      // Update current order
      this.currentOrder = Array.from(container.querySelectorAll(".commit-item"))
        .map(item => item.getAttribute("data-id"));
    });
  }
  
  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".commit-item:not(.dragging)")];
    
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
  
  renderTargetTimeline() {
    const container = document.getElementById("target-timeline");
    container.innerHTML = "";
    
    // Show target timeline with placeholder commits or hints
    this.targetOrder.forEach((commitId, index) => {
      const commitEl = document.createElement("div");
      commitEl.className = "target-commit";
      
      // For easier levels, show more information about target commits
      if (this.level <= 2) {
        const commit = this.commits.find(c => c.id === commitId);
        commitEl.innerHTML = `
          <div class="commit-hash">${commit.id.substring(0, 7)}</div>
          <div class="commit-message">${commit.message}</div>
        `;
      } else {
        // For harder levels, just show position indicators
        commitEl.innerHTML = `<div class="commit-placeholder">Commit ${index + 1}</div>`;
      }
      
      container.appendChild(commitEl);
    });
  }
  
  showCommitDetails(commit) {
    const detailsContainer = document.getElementById("commit-details");
    detailsContainer.innerHTML = `
      <div class="commit-detail-card">
        <div class="detail-row"><strong>ID:</strong> ${commit.id}</div>
        <div class="detail-row"><strong>Message:</strong> ${commit.message}</div>
        <div class="detail-row"><strong>Author:</strong> ${commit.author}</div>
        <div class="detail-row"><strong>Date:</strong> ${commit.date}</div>
        <div class="detail-row"><strong>Files changed:</strong> ${commit.files.join(", ")}</div>
        <div class="detail-row code-changes">
          <strong>Changes:</strong>
          <pre>${commit.diff}</pre>
        </div>
      </div>
    `;
  }
  
  checkSolution() {
    // Compare current order with target order
    const correct = this.currentOrder.every((commitId, index) => 
      commitId === this.targetOrder[index]
    );
    
    if (correct) {
      this.handleSuccess();
    } else {
      this.handleFailure();
    }
  }
  
  handleSuccess() {
    // Calculate score
    const baseScore = this.level * 100;
    const hintPenalty = this.hintsUsed * 20;
    const levelScore = Math.max(0, baseScore - hintPenalty);
    
    this.score += levelScore;
    document.getElementById("timeline-score").textContent = this.score;
    
    // Show success message
    alert(`Timeline corrected! You earned ${levelScore} points.`);
    
    // Advance to next level
    this.level++;
    this.hintsUsed = 0;
    this.initGame();
  }
  
  handleFailure() {
    // Show failure message
    alert("That's not quite right. Try again!");
  }
  
  showHint() {
    // Provide a hint about correct commit placement
    this.hintsUsed++;
    
    // Find the first incorrect commit
    const firstWrongIndex = this.currentOrder.findIndex(
      (commitId, index) => commitId !== this.targetOrder[index]
    );
    
    if (firstWrongIndex >= 0) {
      const correctCommit = this.targetOrder[firstWrongIndex];
      const commit = this.commits.find(c => c.id === correctCommit);
      
      alert(`Hint: The commit "${commit.message}" should be at position ${firstWrongIndex + 1}.`);
    } else {
      alert("Your timeline looks correct! Try submitting your solution.");
    }
  }
  
  resetTimeline() {
    // Reset the current timeline to a shuffled state
    this.currentOrder = [...this.commits]
      .map(commit => commit.id)
      .sort(() => Math.random() - 0.5);
    
    this.renderTimeline();
  }
  
  generateLevel(level) {
    // Generate commits and target order based on level
    
    if (level === 1) {
      // Simple level with descriptive commit messages
      const commits = [
        {
          id: "a1b2c3d",
          message: "Initial commit",
          author: "Developer",
          date: "2023-10-01",
          files: ["index.html", "style.css"],
          diff: "+ Initial project setup"
        },
        {
          id: "e4f5g6h",
          message: "Add user authentication",
          author: "Developer",
          date: "2023-10-02",
          files: ["auth.js"],
          diff: "+ Added login form\n+ Added authentication logic"
        },
        {
          id: "i7j8k9l",
          message: "Fix security vulnerability in auth",
          author: "Security Team",
          date: "2023-10-03",
          files: ["auth.js"],
          diff: "- Insecure password handling\n+ Secure password hashing"
        },
        {
          id: "m1n2o3p",
          message: "Add dashboard UI",
          author: "UI Designer",
          date: "2023-10-04",
          files: ["dashboard.js", "dashboard.css"],
          diff: "+ Dashboard components\n+ Dashboard styling"
        }
      ];
      
      // Logical order for level 1
      return {
        commits,
        targetOrder: ["a1b2c3d", "e4f5g6h", "i7j8k9l", "m1n2o3p"]
      };
    }
    
    // More complex levels...
    // ...
  }
}

// Initialize game
document.addEventListener("DOMContentLoaded", () => {
  const timelineGame = new CommitHistoryTimeline();
});