class GitEscapeRoom {
  constructor() {
    this.currentRoom = 1;
    this.score = 0;
    this.hintsRemaining = 3;
    this.inventory = [];
    this.commandHistory = [];
    this.historyIndex = -1;
    this.timeRemaining = 600; // 10 minutes in seconds
    this.timer = null;
    
    this.initGame();
    this.bindEvents();
    this.startTimer();
  }
  
  initGame() {
    // Set up the current room
    this.loadRoom(this.currentRoom);
    
    // Update UI
    document.getElementById("room-number").textContent = this.currentRoom;
    document.getElementById("escape-score").textContent = this.score;
    document.getElementById("hints-remaining").textContent = this.hintsRemaining;
    
    // Clear terminal
    this.writeToTerminal("System", `Loading room ${this.currentRoom}...`);
    this.writeToTerminal("System", this.getCurrentRoom().intro);
  }
  
  bindEvents() {
    // Terminal input
    const terminalInput = document.getElementById("terminal-input");
    terminalInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const command = terminalInput.value.trim();
        if (command) {
          this.processCommand(command);
          this.commandHistory.push(command);
          this.historyIndex = this.commandHistory.length;
          terminalInput.value = "";
        }
      } else if (e.key === "ArrowUp") {
        // Navigate command history
        if (this.historyIndex > 0) {
          this.historyIndex--;
          terminalInput.value = this.commandHistory[this.historyIndex];
        }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        // Navigate command history
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          terminalInput.value = this.commandHistory[this.historyIndex];
        } else if (this.historyIndex === this.commandHistory.length - 1) {
          this.historyIndex = this.commandHistory.length;
          terminalInput.value = "";
        }
        e.preventDefault();
      }
    });
    
    // Hint button
    document.getElementById("hint-button").addEventListener("click", () => {
      this.useHint();
    });
    
    // Give up button
    document.getElementById("give-up").addEventListener("click", () => {
      if (confirm("Are you sure you want to give up?")) {
        this.endGame("You gave up. Better luck next time!");
      }
    });
  }
  
  startTimer() {
    this.timer = setInterval(() => {
      this.timeRemaining--;
      
      // Update timer display
      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      document.getElementById("time-remaining").textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Check if time's up
      if (this.timeRemaining <= 0) {
        this.endGame("Time's up! You couldn't escape in time.");
      }
    }, 1000);
  }
  
  loadRoom(roomNumber) {
    // Update room description
    const room = this.getCurrentRoom();
    document.getElementById("room-description").innerHTML = `
      <h3>${room.name}</h3>
      <p>${room.description}</p>
      <div class="objectives">
        <h4>Objectives:</h4>
        <ul>
          ${room.objectives.map(obj => `<li>${obj}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  processCommand(command) {
    this.writeToTerminal("User", `$ ${command}`);
    
    // Parse the Git command
    const parts = command.split(' ');
    const baseCommand = parts[0].toLowerCase();
    
    // Handle non-git commands
    if (baseCommand === "help") {
      this.showHelp();
      return;
    } else if (baseCommand === "look") {
      this.lookAround();
      return;
    } else if (baseCommand === "inventory") {
      this.showInventory();
      return;
    }
    
    // Process Git commands
    if (baseCommand === "git") {
      const gitCommand = parts[1]?.toLowerCase();
      const args = parts.slice(2);
      
      this.processGitCommand(gitCommand, args);
    } else {
      this.writeToTerminal("System", `Command not recognized: ${baseCommand}. Try 'help' for available commands.`);
    }
  }
  
  processGitCommand(gitCommand, args) {
    const room = this.getCurrentRoom();
    
    // Check if this command helps solve the current puzzle
    const puzzle = room.puzzles.find(p => 
      p.solution.command === gitCommand && 
      this.argsMatch(p.solution.args, args)
    );
    
    if (puzzle && !puzzle.solved) {
      // Mark puzzle as solved
      puzzle.solved = true;
      
      // Give reward
      this.writeToTerminal("System", puzzle.successMessage);
      this.score += puzzle.points;
      document.getElementById("escape-score").textContent = this.score;
      
      // Add item to inventory if provided
      if (puzzle.reward) {
        this.inventory.push(puzzle.reward);
        this.writeToTerminal("System", `You obtained: ${puzzle.reward.name}`);
        this.updateInventory();
      }
      
      // Check if all puzzles are solved
      if (room.puzzles.every(p => p.solved)) {
        this.completeRoom();
      }
    } else {
      // Process standard Git commands based on room state
      switch(gitCommand) {
        case "status":
          this.gitStatus();
          break;
        case "log":
          this.gitLog();
          break;
        case "branch":
          this.gitBranch(args);
          break;
        case "checkout":
          this.gitCheckout(args);
          break;
        case "commit":
          this.gitCommit(args);
          break;
        case "merge":
          this.gitMerge(args);
          break;
        case "reset":
          this.gitReset(args);
          break;
        case "revert":
          this.gitRevert(args);
          break;
        default:
          this.writeToTerminal("System", `Git command not implemented: ${gitCommand}`);
      }
    }
  }
  
  // Git command implementations
  gitStatus() {
    const room = this.getCurrentRoom();
    this.writeToTerminal("Git", room.gitState.status);
  }
  
  gitLog() {
    const room = this.getCurrentRoom();
    room.gitState.log.forEach(entry => {
      this.writeToTerminal("Git", `commit ${entry.hash}`);
      this.writeToTerminal("Git", `Author: ${entry.author}`);
      this.writeToTerminal("Git", `Date: ${entry.date}`);
      this.writeToTerminal("Git", "");
      this.writeToTerminal("Git", `    ${entry.message}`);
      this.writeToTerminal("Git", "");
    });
  }
  
  gitBranch(args) {
    const room = this.getCurrentRoom();
    if (args.length === 0) {
      // List branches
      room.gitState.branches.forEach(branch => {
        const current = branch === room.gitState.currentBranch ? "* " : "  ";
        this.writeToTerminal("Git", `${current}${branch}`);
      });
    } else {
      // Create new branch logic would go here
      this.writeToTerminal("Git", `Created branch ${args[0]}`);
    }
  }
  
  // Other Git command implementations...
  
  completeRoom() {
    this.writeToTerminal("System", "Congratulations! You solved all the puzzles in this room!");
    
    // Check if this was the last room
    if (this.currentRoom >= this.rooms.length) {
      this.endGame("You've escaped! Congratulations!");
    } else {
      // Prepare for next room
      setTimeout(() => {
        this.currentRoom++;
        this.loadRoom(this.currentRoom);
        document.getElementById("room-number").textContent = this.currentRoom;
        
        this.writeToTerminal("System", `Moving to room ${this.currentRoom}...`);
        this.writeToTerminal("System", this.getCurrentRoom().intro);
        
        // Add time bonus
        this.timeRemaining += 120; // Add 2 minutes for next room
        this.updateTimer();
      }, 2000);
    }
  }
  
  useHint() {
    if (this.hintsRemaining > 0) {
      this.hintsRemaining--;
      document.getElementById("hints-remaining").textContent = this.hintsRemaining;
      
      // Find first unsolved puzzle and show hint
      const room = this.getCurrentRoom();
      const unsolved = room.puzzles.find(p => !p.solved);
      
      if (unsolved) {
        this.writeToTerminal("Hint", unsolved.hint);
      } else {
        this.writeToTerminal("Hint", "You've already solved all puzzles in this room!");
      }
    } else {
      this.writeToTerminal("System", "You have no hints remaining!");
    }
  }
  
  endGame(message) {
    clearInterval(this.timer);
    
    // Show end game message
    this.writeToTerminal("System", message);
    this.writeToTerminal("System", `Final score: ${this.score}`);
    
    // Disable input
    document.getElementById("terminal-input").disabled = true;
    document.getElementById("hint-button").disabled = true;
    document.getElementById("give-up").disabled = true;
    
    // Show replay button
    const replayBtn = document.createElement("button");
    replayBtn.textContent = "Play Again";
    replayBtn.className = "replay-button";
    replayBtn.addEventListener("click", () => {
      window.location.reload();
    });
    
    document.querySelector(".game-controls").appendChild(replayBtn);
  }
  
  // Helper methods
  getCurrentRoom() {
    return this.rooms[this.currentRoom - 1];
  }
  
  writeToTerminal(sender, message) {
    const output = document.getElementById("terminal-output");
    const line = document.createElement("div");
    
    if (sender === "User") {
      line.className = "terminal-line user-command";
    } else if (sender === "System") {
      line.className = "terminal-line system-message";
    } else if (sender === "Git") {
      line.className = "terminal-line git-output";
    } else if (sender === "Hint") {
      line.className = "terminal-line hint-message";
    }
    
    line.textContent = message;
    output.appendChild(line);
    
    // Auto-scroll to bottom
    output.scrollTop = output.scrollHeight;
  }
  
  updateInventory() {
    const inventoryEl = document.getElementById("inventory-items");
    inventoryEl.innerHTML = "";
    
    if (this.inventory.length === 0) {
      inventoryEl.innerHTML = "<p>No items yet</p>";
      return;
    }
    
    this.inventory.forEach(item => {
      const itemEl = document.createElement("div");
      itemEl.className = "inventory-item";
      itemEl.innerHTML = `
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description}</div>
      `;
      inventoryEl.appendChild(itemEl);
    });
  }
  
  argsMatch(solutionArgs, userArgs) {
    // Check if user arguments match the solution
    if (!solutionArgs) return true;
    if (solutionArgs.length !== userArgs.length) return false;
    
    return solutionArgs.every((arg, i) => 
      arg === "*" || arg.toLowerCase() === userArgs[i].toLowerCase()
    );
  }
  
  showHelp() {
    this.writeToTerminal("System", "Available commands:");
    this.writeToTerminal("System", "  help - Show this help message");
    this.writeToTerminal("System", "  look - Examine your surroundings");
    this.writeToTerminal("System", "  inventory - Check your inventory");
    this.writeToTerminal("System", "  git status - Check repository status");
    this.writeToTerminal("System", "  git log - View commit history");
    this.writeToTerminal("System", "  git branch - List branches");
    this.writeToTerminal("System", "  git checkout <branch> - Switch branches");
    this.writeToTerminal("System", "  git commit -m \"message\" - Create a commit");
    this.writeToTerminal("System", "  git merge <branch> - Merge branches");
    this.writeToTerminal("System", "  git reset <options> - Reset changes");
    this.writeToTerminal("System", "  git revert <commit> - Revert changes");
  }
  
  lookAround() {
    const room = this.getCurrentRoom();
    this.writeToTerminal("System", room.description);
    this.writeToTerminal("System", "You see:");
    room.objects.forEach(obj => {
      this.writeToTerminal("System", `- ${obj.description}`);
    });
  }
  
  showInventory() {
    if (this.inventory.length === 0) {
      this.writeToTerminal("System", "Your inventory is empty.");
    } else {
      this.writeToTerminal("System", "Inventory:");
      this.inventory.forEach(item => {
        this.writeToTerminal("System", `- ${item.name}: ${item.description}`);
      });
    }
  }
  
  // Game data
  rooms = [
    {
      name: "The Broken Repository",
      description: "You find yourself in a dimly lit server room. A terminal shows a Git repository with several issues that need fixing.",
      intro: "Welcome to the Git Escape Room! You're locked in a server room with a broken Git repository. Fix the issues to escape!",
      objects: [
        { description: "A terminal with a Git repository open" },
        { description: "A note on the wall with some instructions" },
        { description: "A locked door that requires a specific commit hash to open" }
      ],
      gitState: {
        status: `On branch feature-login
        Your branch and 'origin/feature-login' have diverged,
        and have 2 and 3 different commits each, respectively.
          (use "git pull" to merge the remote branch into yours)
        
        Changes not staged for commit:
          (use "git add <file>..." to update what will be committed)
          (use "git restore <file>..." to discard changes in working directory)
            modified:   login.js
        
        Untracked files:
          (use "git add <file>..." to include in what will be committed)
            temp.log`,
        currentBranch: "feature-login",
        branches: ["main", "feature-login", "bugfix"],
        log: [
          { 
            hash: "a1b2c3d", 
            author: "Developer <dev@example.com>", 
            date: "Mon Oct 10 10:00:00 2023 -0500",
            message: "Fix login page styling" 
          },
          { 
            hash: "e4f5g6h", 
            author: "Developer <dev@example.com>", 
            date: "Sun Oct 9 15:30:00 2023 -0500",
            message: "Add login functionality" 
          },
          { 
            hash: "i7j8k9l", 
            author: "Developer <dev@example.com>", 
            date: "Sat Oct 8 09:15:00 2023 -0500",
            message: "Initial commit" 
          }
        ]
      },
      objectives: [
        "Clean up uncommitted changes",
        "Fix the diverged branch issue",
        "Find the secret commit hash"
      ],
      puzzles: [
        {
          description: "There are unstaged changes and untracked files",
          solution: { 
            command: "add", 
            args: ["login.js"]
          },
          hint: "You need to stage the changes to login.js first",
          successMessage: "Changes to login.js have been staged.",
          points: 50,
          solved: false
        },
        {
          description: "Need to commit the staged changes",
          solution: { 
            command: "commit", 
            args: ["-m", "*"] // * means any argument
          },
          hint: "Once changes are staged, you need to commit them with a message",
          successMessage: "Changes committed successfully!",
          points: 50,
          solved: false
        },
        {
          description: "The branches have diverged and need to be merged",
          solution: { 
            command: "merge", 
            args: ["origin/feature-login"]
          },
          hint: "Your branch has diverged from origin. Try merging the remote branch",
          successMessage: "Branches merged successfully! You found a note with the code: 'G1T-3SC4P3'",
          points: 100,
          solved: false,
          reward: {
            name: "Security Code",
            description: "A code that might help unlock something: G1T-3SC4P3"
          }
        }
      ]
    },
    // Add more rooms here...
  ]
}

// Initialize game
document.addEventListener("DOMContentLoaded", () => {
  const escapeRoom = new GitEscapeRoom();
});