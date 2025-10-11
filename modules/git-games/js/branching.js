class GitBranchingPuzzle {
  constructor() {
    this.level = 1;
    this.score = 0;
    this.branches = [];
    this.currentBranch = "main";
    this.targetState = {};
    this.moves = 0;
    
    // Initialize puzzle
    this.initPuzzle();
    this.bindEvents();
  }
  
  initPuzzle() {
    // Generate puzzle based on level
    const puzzleData = this.generatePuzzle(this.level);
    this.branches = puzzleData.branches;
    this.targetState = puzzleData.targetState;
    
    // Render initial state
    this.renderBranches();
    this.renderTargetState();
    
    // Update UI
    document.getElementById("branch-level").textContent = this.level;
    document.getElementById("branch-score").textContent = this.score;
  }
  
  bindEvents() {
    // Command buttons
    document.querySelectorAll(".git-cmd").forEach(btn => {
      btn.addEventListener("click", () => {
        const cmd = btn.getAttribute("data-cmd");
        document.getElementById("current-command").textContent = `git ${cmd} `;
      });
    });
    
    // Execute command
    document.getElementById("execute-cmd").addEventListener("click", () => {
      const fullCommand = document.getElementById("current-command").textContent;
      this.executeCommand(fullCommand);
    });
    
    // Reset puzzle
    document.getElementById("reset-puzzle").addEventListener("click", () => {
      this.initPuzzle();
    });
  }
  
  executeCommand(command) {
    // Parse and execute git command
    const [git, cmd, ...args] = command.trim().split(" ");
    
    switch(cmd) {
      case "merge":
        this.mergeCommand(args[0]);
        break;
      case "checkout":
        this.checkoutCommand(args[0]);
        break;
      case "branch":
        this.branchCommand(args[0]);
        break;
      case "rebase":
        this.rebaseCommand(args[0]);
        break;
      default:
        this.showError(`Unknown command: ${cmd}`);
    }
    
    // Update visualization
    this.renderBranches();
    
    // Check if puzzle is solved
    if (this.checkSolution()) {
      this.handleSuccess();
    }
    
    this.moves++;
  }
  
  // Command implementations
  mergeCommand(branchName) {
    // Implement merge logic here
    console.log(`Merging ${branchName} into ${this.currentBranch}`);
    
    // Find the branch to merge
    const targetBranch = this.branches.find(b => b.name === branchName);
    const currentBranch = this.branches.find(b => b.name === this.currentBranch);
    
    if (!targetBranch) {
      this.showError(`Branch ${branchName} does not exist`);
      return;
    }
    
    // Perform merge operation
    currentBranch.commits = [...currentBranch.commits, ...targetBranch.commits.filter(
      commit => !currentBranch.commits.some(c => c.id === commit.id)
    )];
    
    // Sort commits by timestamp
    currentBranch.commits.sort((a, b) => a.timestamp - b.timestamp);
    
    // Add merge commit
    currentBranch.commits.push({
      id: `merge-${Date.now()}`,
      message: `Merge branch ${branchName} into ${this.currentBranch}`,
      timestamp: Date.now()
    });
  }
  
  checkoutCommand(branchName) {
    // Implement checkout logic
    if (this.branches.some(b => b.name === branchName)) {
      this.currentBranch = branchName;
      console.log(`Switched to branch ${branchName}`);
    } else {
      this.showError(`Branch ${branchName} does not exist`);
    }
  }
  
  // Additional methods for game logic
  generatePuzzle(level) {
    // Generate puzzle based on level
    // This would create different branch structures and target states
    
    // Example level 1 puzzle
    if (level === 1) {
      return {
        branches: [
          {
            name: "main",
            commits: [
              { id: "c1", message: "Initial commit", timestamp: 1 },
              { id: "c2", message: "Add feature A", timestamp: 2 }
            ]
          },
          {
            name: "feature",
            commits: [
              { id: "c1", message: "Initial commit", timestamp: 1 },
              { id: "c3", message: "Add feature B", timestamp: 3 }
            ]
          }
        ],
        targetState: {
          branches: ["main"],
          commits: ["c1", "c2", "c3", "merge"]
        }
      };
    }
    
    // More complex puzzles for higher levels
    // ...
  }
  
  renderBranches() {
    const container = document.getElementById("branch-vis");
    container.innerHTML = "";
    
    // Create a visual representation of branches and commits
    // This would use SVG or Canvas to draw the branch graph
    
    // Placeholder for actual visualization code
    let html = `<div class="branch-graph">`;
    
    this.branches.forEach(branch => {
      const isActive = branch.name === this.currentBranch;
      html += `
        <div class="branch ${isActive ? 'active' : ''}">
          <div class="branch-name">${branch.name}</div>
          <div class="commit-line">
            ${branch.commits.map(commit => `
              <div class="commit" title="${commit.message}">
                <div class="commit-dot"></div>
                <div class="commit-id">${commit.id}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
  }
  
  renderTargetState() {
    // Similar to renderBranches, but shows the target state
    // This would be a simplified view of what the final repository should look like
  }
  
  checkSolution() {
    // Check if current state matches target state
    // Return true if puzzle is solved
    
    // Example implementation
    const mainBranch = this.branches.find(b => b.name === "main");
    if (!mainBranch) return false;
    
    const targetCommits = this.targetState.commits;
    const currentCommits = mainBranch.commits.map(c => c.id);
    
    // Check if all target commits are present
    return targetCommits.every(commitId => 
      currentCommits.includes(commitId) || 
      commitId === "merge" && currentCommits.some(id => id.startsWith("merge"))
    );
  }
  
  handleSuccess() {
    // Calculate score based on moves and level
    const baseScore = this.level * 100;
    const movesPenalty = Math.max(0, this.moves - 3) * 10;
    const levelScore = Math.max(0, baseScore - movesPenalty);
    
    this.score += levelScore;
    document.getElementById("branch-score").textContent = this.score;
    
    // Show success message
    alert(`Puzzle solved! You earned ${levelScore} points.`);
    
    // Advance to next level
    this.level++;
    this.moves = 0;
    this.initPuzzle();
  }
  
  showError(message) {
    // Display error message to user
    alert(`Error: ${message}`);
  }
}

// Initialize game
document.addEventListener("DOMContentLoaded", () => {
  const branchingPuzzle = new GitBranchingPuzzle();
});