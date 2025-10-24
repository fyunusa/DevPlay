/**
 * PromptoScope - Visual Prompt Engineering & Testing Laboratory
 * Main application logic
 */
class PromptoScope {
  constructor() {
    this.storage = new StorageManager();
    this.parameterManager = new ParameterManager();
    this.promptAnalyzer = new PromptAnalyzer();
    this.responseAnalyzer = new ResponseAnalyzer();
    this.visualizer = new Visualizer();

    this.currentPrompt = {
      name: "",
      content: "",
      model: "gpt-3.5-turbo",
      params: {},
    };

    this.apiKeys = {
      openai: "",
      anthropic: "",
    };

    this.history = [];
    this.templates = {};

    this.init();
  }

  async init() {
    // Create notifications container if not exists
    this.createNotificationsContainer();

    // Create API key warning container if not exists
    this.createApiKeyWarning();

    // Load saved API keys
    await this.loadApiKeys();

    // Load templates
    this.loadTemplates();

    // Set up event listeners
    this.setupEventListeners();

    // Set up tabs
    this.setupTabs();

    // Initialize parameters
    this.parameterManager.initParameters();

    // Check if API keys are set
    this.checkApiKeys();

    // Create visualization containers
    this.createVisualizationContainers();

    console.log("PromptoScope initialized");
  }

  createNotificationsContainer() {
    // Check if notifications container exists, if not create it
    if (!document.getElementById('notifications')) {
      const notificationsContainer = document.createElement('div');
      notificationsContainer.id = 'notifications';
      notificationsContainer.className = 'notifications-container';
      document.body.appendChild(notificationsContainer);
    }
  }

  createApiKeyWarning() {
    // Check if API key warning exists, if not create it
    if (!document.getElementById('api-key-warning')) {
      const apiKeyWarning = document.createElement('div');
      apiKeyWarning.id = 'api-key-warning';
      apiKeyWarning.className = 'api-key-warning';
      apiKeyWarning.style.display = 'none';
      apiKeyWarning.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>API keys not configured. Some features may be limited.</span>
        <button id="set-api-keys-btn" class="btn btn-sm btn-primary">Set API Keys</button>
      `;
      document.querySelector('.header').appendChild(apiKeyWarning);

      // Add event listener for the button
      apiKeyWarning.querySelector('#set-api-keys-btn').addEventListener('click', () => {
        this.showApiKeyModal();
      });
    }
  }

  createVisualizationContainers() {
    // Check for visualization area and create visualization containers if needed
    const visualizationArea = document.getElementById('visualization-area');
    if (visualizationArea) {
      // Create containers for different visualization types if they don't exist
      const vizTypes = ['attention', 'structure', 'tokens', 'context', 'xray'];
      
      vizTypes.forEach(type => {
        if (!document.getElementById(`${type}-viz`)) {
          const container = document.createElement('div');
          container.id = `${type}-viz`;
          container.className = 'viz-content';
          container.style.display = 'none';
          visualizationArea.appendChild(container);
        }
      });
      
      // Make the first one active
      const firstViz = document.getElementById('attention-viz');
      if (firstViz) {
        firstViz.style.display = 'block';
      }
    }
  }

  async loadApiKeys() {
    const keys = await this.storage.getApiKeys();
    if (keys) {
      this.apiKeys = keys;
    }
  }

  loadTemplates() {
    // Load built-in templates
    fetch("js/templates.json")
      .then((response) => response.json())
      .then((data) => {
        this.templates = data;
        this.renderTemplateCategories();
      })
      .catch((error) => {
        console.error("Error loading templates:", error);
        // Set default empty templates object if loading fails
        this.templates = {
          instructional: [],
          creative: [],
          analytical: [],
          conversational: [],
          coding: [],
          custom: []
        };
      });

    // Load custom templates
    const customTemplates = this.storage.getTemplates();
    if (customTemplates) {
      this.templates.custom = customTemplates;
    }
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll(".tab-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.getAttribute("data-tab");
        this.showTab(tabName);
      });
    });

    // Prompt editor
    const promptInput = document.getElementById("prompt-input");
    if (promptInput) {
      promptInput.addEventListener("input", (e) => {
        this.currentPrompt.content = e.target.value;
        this.updateTokenCount();
      });
    }

    const promptName = document.getElementById("prompt-name");
    if (promptName) {
      promptName.addEventListener("input", (e) => {
        this.currentPrompt.name = e.target.value;
      });
    }

    const modelSelect = document.getElementById("model-select");
    if (modelSelect) {
      modelSelect.addEventListener("change", (e) => {
        this.currentPrompt.model = e.target.value;
        this.updateTokenCount();
      });
    }

    // Buttons
    const generateBtn = document.getElementById("generate-btn");
    if (generateBtn) {
      generateBtn.addEventListener("click", () => {
        this.generateResponse();
      });
    }

    const savePromptBtn = document.getElementById("save-prompt-btn");
    if (savePromptBtn) {
      savePromptBtn.addEventListener("click", () => {
        this.savePrompt();
      });
    }

    const clearPromptBtn = document.getElementById("clear-prompt-btn");
    if (clearPromptBtn) {
      clearPromptBtn.addEventListener("click", () => {
        this.clearPrompt();
      });
    }

    const copyResponseBtn = document.getElementById("copy-response-btn");
    if (copyResponseBtn) {
      copyResponseBtn.addEventListener("click", () => {
        this.copyResponse();
      });
    }

    // API key modal
    const saveApiKeysBtn = document.getElementById("save-api-keys");
    if (saveApiKeysBtn) {
      saveApiKeysBtn.addEventListener("click", () => {
        this.saveApiKeys();
      });
    }

    const closeApiModalBtn = document.getElementById("close-api-modal");
    if (closeApiModalBtn) {
      closeApiModalBtn.addEventListener("click", () => {
        document.getElementById("api-key-modal").style.display = "none";
      });
    }

    // Visualization options
    document.querySelectorAll(".viz-option").forEach((option) => {
      option.addEventListener("click", () => {
        const vizType = option.getAttribute("data-viz");
        this.showVisualization(vizType);
      });
    });

    // Template categories
    document.querySelectorAll(".template-category").forEach((category) => {
      category.addEventListener("click", () => {
        const categoryName = category.getAttribute("data-category");
        this.showTemplateCategory(categoryName);
      });
    });

    // A/B Testing
    const runTestBtn = document.getElementById("run-test-btn");
    if (runTestBtn) {
      runTestBtn.addEventListener("click", () => {
        this.runABTest();
      });
    }
  }

  setupTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active class from all tab buttons
        document.querySelectorAll(".tab-btn").forEach((b) => {
          b.classList.remove("active");
        });

        // Add active class to clicked button
        btn.classList.add("active");

        // Hide all tab contents
        document.querySelectorAll(".tab-content").forEach((content) => {
          content.classList.remove("active");
        });

        // Show the corresponding tab content
        const tabId = btn.getAttribute("data-tab") + "-tab";
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
          tabContent.classList.add("active");
        }
      });
    });
  }

  showTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });

    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (tabBtn) {
      tabBtn.classList.add("active");
    }
    
    const tabContent = document.getElementById(`${tabName}-tab`);
    if (tabContent) {
      tabContent.classList.add("active");
    }
  }

  updateTokenCount() {
    const tokenCount = document.getElementById("token-count");
    const tokenMeterFill = document.getElementById("token-meter-fill");
    if (!tokenCount || !tokenMeterFill) return;

    const text = this.currentPrompt.content;
    const count = this.promptAnalyzer.countTokens(text);

    tokenCount.textContent = count;

    // Update token meter
    const percentage = Math.min(100, (count / 4000) * 100);
    tokenMeterFill.style.width = `${percentage}%`;

    // Change color based on token count
    if (percentage > 90) {
      tokenMeterFill.style.backgroundColor = "var(--error)";
    } else if (percentage > 75) {
      tokenMeterFill.style.backgroundColor = "var(--warning)";
    } else {
      tokenMeterFill.style.backgroundColor = "var(--primary)";
    }
  }

  async generateResponse() {
    if (!this.currentPrompt.content.trim()) {
      this.showNotification("Please enter a prompt first", "error");
      return;
    }

    if (!this.checkApiKeys()) {
      return;
    }

    // Show loading state
    const generateBtn = document.getElementById("generate-btn");
    if (!generateBtn) return;
    
    const originalBtnText = generateBtn.innerHTML;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    const aiResponse = document.getElementById("ai-response");
    const responsePlaceholder = document.querySelector(".response-placeholder");
    
    if (aiResponse) {
      aiResponse.style.display = "none";
    }
    
    if (responsePlaceholder) {
      responsePlaceholder.innerHTML = `
        <i class="fas fa-robot fa-spin"></i>
        <p>Generating response...</p>
      `;
      responsePlaceholder.style.display = "flex";
    }

    // Get parameters
    const params = this.parameterManager.getParameters();

    try {
      const startTime = Date.now();

      // Generate response
      const response = await this.callAI(
        this.currentPrompt.content,
        this.currentPrompt.model,
        params
      );

      const endTime = Date.now();
      const responseTime = ((endTime - startTime) / 1000).toFixed(2);

      // Update UI with response
      if (aiResponse) {
        aiResponse.innerHTML = response;
        aiResponse.style.display = "block";
      }
      
      if (responsePlaceholder) {
        responsePlaceholder.style.display = "none";
      }

      // Update metadata
      const responseTokens = document.getElementById("response-tokens");
      const responseTimeEl = document.getElementById("response-time");
      const responseModel = document.getElementById("response-model");
      
      if (responseTokens) {
        responseTokens.textContent = this.promptAnalyzer.countTokens(response);
      }
      
      if (responseTimeEl) {
        responseTimeEl.textContent = responseTime + "s";
      }
      
      if (responseModel) {
        responseModel.textContent = this.currentPrompt.model;
      }

      // Add to history
      this.addToHistory(this.currentPrompt.content, response);

      // Update visualizations if on visualization tab
      const visualizeTab = document.getElementById("visualize-tab");
      if (visualizeTab && visualizeTab.classList.contains("active")) {
        this.showVisualization("attention");
      }
    } catch (error) {
      console.error("Error generating response:", error);
      if (aiResponse) {
        aiResponse.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
        aiResponse.style.display = "block";
      }
      
      if (responsePlaceholder) {
        responsePlaceholder.style.display = "none";
      }
      
      this.showNotification(error.message, "error");
    } finally {
      // Restore button state
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalBtnText;
      }
    }
  }

  async callAI(prompt, model, params) {
    // This is a mock implementation - in a real app, you'd call an AI API
    // For this demo, we'll return a simulated response

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return a mock response
    return `This is a simulated response to your prompt. In a real implementation, this would call the actual AI API (OpenAI, Anthropic, etc.) and return the response.

Your prompt was: "${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}"

Selected model: ${model}
Parameters: Temperature ${params.temperature}, Top-P ${params.topP}

This response is just a placeholder. To implement actual API calls, you would need to:
1. Use the appropriate API client library
2. Format the request according to the API specifications
3. Handle the response and any errors

The visualization features would then analyze the actual AI response.`;
  }

  savePrompt() {
    if (!this.currentPrompt.content.trim()) {
      this.showNotification("Please enter a prompt first", "error");
      return;
    }

    if (!this.currentPrompt.name.trim()) {
      this.currentPrompt.name = "Prompt " + new Date().toLocaleString();
    }

    const promptToSave = {
      id: Date.now(),
      name: this.currentPrompt.name,
      content: this.currentPrompt.content,
      model: this.currentPrompt.model,
      params: this.parameterManager.getParameters(),
      date: new Date().toISOString(),
    };

    this.storage.savePrompt(promptToSave);
    this.showNotification("Prompt saved successfully", "success");
    this.updateHistoryView();
  }

  clearPrompt() {
    const promptInput = document.getElementById("prompt-input");
    const promptName = document.getElementById("prompt-name");
    
    if (promptInput) {
      promptInput.value = "";
    }
    
    if (promptName) {
      promptName.value = "";
    }
    
    this.currentPrompt.content = "";
    this.currentPrompt.name = "";
    this.updateTokenCount();
  }

  copyResponse() {
    const aiResponse = document.getElementById("ai-response");
    if (!aiResponse) return;
    
    const response = aiResponse.textContent;
    if (!response) {
      this.showNotification("No response to copy", "error");
      return;
    }

    navigator.clipboard
      .writeText(response)
      .then(() => {
        this.showNotification("Response copied to clipboard", "success");
      })
      .catch((err) => {
        console.error("Error copying to clipboard:", err);
        this.showNotification("Failed to copy to clipboard", "error");
      });
  }

  addToHistory(prompt, response) {
    const historyItem = {
      id: Date.now(),
      prompt: prompt,
      response: response,
      model: this.currentPrompt.model,
      params: this.parameterManager.getParameters(),
      date: new Date().toISOString(),
    };

    this.history.unshift(historyItem);
    this.updateHistoryView();
  }

  updateHistoryView() {
    const historyList = document.getElementById("version-history");
    if (!historyList) return;
    
    const savedPrompts = this.storage.getPrompts();

    if (!savedPrompts || savedPrompts.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-save"></i>
          <p>Save prompts to see version history</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = savedPrompts
      .map(
        (item) => `
      <div class="history-item" data-id="${item.id}">
        <div class="history-item-header">
          <h4>${item.name}</h4>
          <div class="history-item-actions">
            <button class="history-btn load-btn" data-id="${item.id}">
              <i class="fas fa-arrow-up"></i>
            </button>
            <button class="history-btn delete-btn" data-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="history-item-meta">
          <span><i class="fas fa-calendar"></i> ${new Date(
            item.date
          ).toLocaleString()}</span>
          <span><i class="fas fa-robot"></i> ${item.model}</span>
        </div>
        <div class="history-item-preview">${item.content.substring(0, 60)}${
          item.content.length > 60 ? "..." : ""
        }</div>
      </div>
    `
      )
      .join("");

    // Add event listeners to history item buttons
    document.querySelectorAll(".load-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        this.loadPromptFromHistory(id);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        this.deletePromptFromHistory(id);
      });
    });
  }

  // Continuing from where we left off...

  loadPromptFromHistory(id) {
    const prompt = this.storage.getPromptById(id);
    if (!prompt) return;

    const promptName = document.getElementById("prompt-name");
    const promptInput = document.getElementById("prompt-input");
    const modelSelect = document.getElementById("model-select");
    
    if (promptName) promptName.value = prompt.name;
    if (promptInput) promptInput.value = prompt.content;
    if (modelSelect) modelSelect.value = prompt.model;

    this.currentPrompt.name = prompt.name;
    this.currentPrompt.content = prompt.content;
    this.currentPrompt.model = prompt.model;

    if (prompt.params) {
      this.parameterManager.setParameters(prompt.params);
    }

    this.updateTokenCount();
    this.showNotification("Prompt loaded", "success");

    // Switch to the edit tab
    this.showTab("editor");
  }

  deletePromptFromHistory(id) {
    this.storage.deletePrompt(id);
    this.showNotification("Prompt deleted", "success");
    this.updateHistoryView();
  }

  saveApiKeys() {
    const openaiKey = document.getElementById("openai-key");
    const anthropicKey = document.getElementById("anthropic-key");
    const apiKeyModal = document.getElementById("api-key-modal");
    
    if (!openaiKey || !anthropicKey) return;
    
    this.apiKeys = {
      openai: openaiKey.value.trim(),
      anthropic: anthropicKey.value.trim(),
    };

    this.storage.saveApiKeys(this.apiKeys);
    this.showNotification("API keys saved", "success");

    // Close modal
    if (apiKeyModal) {
      apiKeyModal.style.display = "none";
    }

    this.checkApiKeys();
  }

  checkApiKeys() {
    const apiKeyWarning = document.getElementById("api-key-warning");
    if (!apiKeyWarning) return true; // Skip this check if element doesn't exist
    
    const hasKeys = this.apiKeys.openai || this.apiKeys.anthropic;

    if (!hasKeys) {
      apiKeyWarning.style.display = "flex";
      return false;
    } else {
      apiKeyWarning.style.display = "none";
      return true;
    }
  }

  showApiKeyModal() {
    const apiKeyModal = document.getElementById("api-key-modal");
    const openaiKey = document.getElementById("openai-key");
    const anthropicKey = document.getElementById("anthropic-key");
    
    if (!apiKeyModal || !openaiKey || !anthropicKey) return;
    
    openaiKey.value = this.apiKeys.openai || "";
    anthropicKey.value = this.apiKeys.anthropic || "";
    apiKeyModal.style.display = "flex";
  }

  showVisualization(vizType) {
    // First check if elements exist
    const vizContainer = document.getElementById(`${vizType}-viz`);
    if (!vizContainer) {
      console.error(`Visualization container ${vizType}-viz not found`);
      return;
    }
    
    // Hide all visualizations
    document.querySelectorAll("[id$='-viz']").forEach((viz) => {
      viz.style.display = "none";
    });

    // Show selected visualization
    vizContainer.style.display = "block";

    // Update active button
    document.querySelectorAll(".viz-option").forEach((btn) => {
      btn.classList.remove("active");
    });
    
    const vizOptionBtn = document.querySelector(`.viz-option[data-viz="${vizType}"]`);
    if (vizOptionBtn) {
      vizOptionBtn.classList.add("active");
    }

    // Generate visualization
    switch (vizType) {
      case "attention":
        this.visualizer.renderAttentionMap(
          this.currentPrompt.content,
          document.getElementById("ai-response")?.textContent || ""
        );
        break;

      case "structure":
        this.visualizer.renderPromptStructure(this.currentPrompt.content);
        break;

      case "context":
        this.visualizer.renderContextWindow(this.currentPrompt.content);
        break;

      case "tokens":
        // For token breakdown visualization
        const tokenViz = document.getElementById("tokens-viz");
        if (tokenViz) {
          const tokens = this.promptAnalyzer.countTokens(this.currentPrompt.content);
          tokenViz.innerHTML = `
            <div class="token-breakdown">
              <h3>Token Breakdown</h3>
              <p>Your prompt uses approximately ${tokens} tokens.</p>
              <div class="token-visual">
                ${Array(Math.min(tokens, 100)).fill('<span class="token-unit"></span>').join('')}
              </div>
              <p>Tokens are the basic units that AI models process. Each token is roughly 4 characters or 0.75 words.</p>
            </div>
          `;
        }
        break;

      case "xray":
        this.visualizer.renderPromptXRay(this.currentPrompt.content);
        break;
    }
  }

  renderTemplateCategories() {
    const templatesArea = document.getElementById("templates-area");
    if (!templatesArea || !this.templates) return;

    const categories = Object.keys(this.templates);
    if (categories.length === 0) return;

    // Show first category by default
    this.showTemplateCategory(categories[0]);
  }

  showTemplateCategory(category) {
    const templatesArea = document.getElementById("templates-area");
    if (!templatesArea || !this.templates || !this.templates[category]) return;

    // Highlight selected category
    document.querySelectorAll(".template-category").forEach((cat) => {
      cat.classList.remove("active");
    });
    
    const categoryEl = document.querySelector(`.template-category[data-category="${category}"]`);
    if (categoryEl) {
      categoryEl.classList.add("active");
    }

    // Show templates for this category
    const templates = this.templates[category];

    templatesArea.innerHTML = templates.length === 0 
      ? `<div class="empty-state"><i class="fas fa-file-alt"></i><p>No templates in this category</p></div>`
      : templates.map(template => `
          <div class="template-card">
            <h4>${template.name}</h4>
            <p>${template.description || ''}</p>
            <div class="template-preview">${template.content.substring(0, 100)}${
              template.content.length > 100 ? "..." : ""
            }</div>
            <button class="btn btn-sm btn-primary use-template-btn" data-template-id="${
              template.id
            }">Use Template</button>
          </div>
        `).join("");

    // Add event listeners
    document.querySelectorAll(".use-template-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const templateId = btn.getAttribute("data-template-id");
        this.useTemplate(category, templateId);
      });
    });
  }

  useTemplate(category, templateId) {
    if (!this.templates[category]) return;
    
    const template = this.templates[category].find(
      (t) => t.id === parseInt(templateId) || t.id === templateId
    );

    if (!template) return;

    const promptName = document.getElementById("prompt-name");
    const promptInput = document.getElementById("prompt-input");
    
    if (promptName) promptName.value = template.name;
    if (promptInput) promptInput.value = template.content;

    this.currentPrompt.name = template.name;
    this.currentPrompt.content = template.content;

    this.updateTokenCount();
    this.showNotification("Template applied", "success");

    // Switch to the editor tab
    this.showTab("editor");
  }

  runABTest() {
    const promptA = document.getElementById("prompt-a")?.value;
    const promptB = document.getElementById("prompt-b")?.value;
    const runTestBtn = document.getElementById("run-test-btn");
    const testResults = document.getElementById("test-results");

    if (!promptA?.trim() || !promptB?.trim()) {
      this.showNotification(
        "Please enter both prompts for comparison",
        "error"
      );
      return;
    }

    if (runTestBtn) {
      runTestBtn.disabled = true;
      runTestBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    }

    // In a real implementation, we would send both prompts to the AI
    // and compare the results. Here we'll simulate it.

    setTimeout(() => {
      const model = document.getElementById("model-select")?.value || "gpt-3.5-turbo";
      const params = this.parameterManager.getParameters();

      // Generate scores (in a real app, these would be calculated)
      const scoreA = Math.random() * 40 + 60; // 60-100
      const scoreB = Math.random() * 40 + 60; // 60-100

      const comparisonResults = {
        promptA: {
          length: this.promptAnalyzer.countTokens(promptA),
          complexity: Math.floor(Math.random() * 5) + 1, // 1-5
          clarity: Math.floor(Math.random() * 5) + 1, // 1-5
          specificity: Math.floor(Math.random() * 5) + 1, // 1-5
          overall: scoreA.toFixed(1),
        },
        promptB: {
          length: this.promptAnalyzer.countTokens(promptB),
          complexity: Math.floor(Math.random() * 5) + 1, // 1-5
          clarity: Math.floor(Math.random() * 5) + 1, // 1-5
          specificity: Math.floor(Math.random() * 5) + 1, // 1-5
          overall: scoreB.toFixed(1),
        },
      };

      // Show comparison results
      this.showComparisonResults(comparisonResults);

      if (runTestBtn) {
        runTestBtn.disabled = false;
        runTestBtn.innerHTML = '<i class="fas fa-play"></i> Run Test';
      }
    }, 2000);
  }

  showComparisonResults(results) {
    const resultsContainer = document.getElementById("test-results");
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
      <h4>Test Results</h4>
      <div class="comparison-metrics">
        <div class="metric-group">
          <h4>Prompt A</h4>
          <div class="metric">
            <span class="metric-name">Length:</span>
            <span class="metric-value">${results.promptA.length} tokens</span>
          </div>
          <div class="metric">
            <span class="metric-name">Complexity:</span>
            <span class="metric-value">${"★".repeat(
              results.promptA.complexity
            )}${"☆".repeat(5 - results.promptA.complexity)}</span>
          </div>
          <div class="metric">
            <span class="metric-name">Clarity:</span>
            <span class="metric-value">${"★".repeat(
              results.promptA.clarity
            )}${"☆".repeat(5 - results.promptA.clarity)}</span>
          </div>
          <div class="metric">
            <span class="metric-name">Specificity:</span>
            <span class="metric-value">${"★".repeat(
              results.promptA.specificity
            )}${"☆".repeat(5 - results.promptA.specificity)}</span>
          </div>
          <div class="metric overall">
            <span class="metric-name">Overall Score:</span>
            <span class="metric-value">${results.promptA.overall}</span>
          </div>
        </div>
        
        <div class="comparison-divider">
          <div class="vs-badge">VS</div>
        </div>
        
        <div class="metric-group">
          <h4>Prompt B</h4>
          <div class="metric">
            <span class="metric-name">Length:</span>
            <span class="metric-value">${results.promptB.length} tokens</span>
          </div>
          <div class="metric">
            <span class="metric-name">Complexity:</span>
            <span class="metric-value">${"★".repeat(
              results.promptB.complexity
            )}${"☆".repeat(5 - results.promptB.complexity)}</span>
          </div>
          <div class="metric">
            <span class="metric-name">Clarity:</span>
            <span class="metric-value">${"★".repeat(
              results.promptB.clarity
            )}${"☆".repeat(5 - results.promptB.clarity)}</span>
          </div>
          <div class="metric">
            <span class="metric-name">Specificity:</span>
            <span class="metric-value">${"★".repeat(
              results.promptB.specificity
            )}${"☆".repeat(5 - results.promptB.specificity)}</span>
          </div>
          <div class="metric overall">
            <span class="metric-name">Overall Score:</span>
            <span class="metric-value">${results.promptB.overall}</span>
          </div>
        </div>
      </div>
      
      <div class="comparison-recommendation">
        <h4>Recommendation</h4>
        <p>${
          parseFloat(results.promptA.overall) >
          parseFloat(results.promptB.overall)
            ? "Prompt A appears to perform better overall."
            : "Prompt B appears to perform better overall."
        }</p>
      </div>
    `;

    // Show results
    resultsContainer.style.display = "block";
  }

  showNotification(message, type) {
    // Create notifications container if it doesn't exist
    let notificationsContainer = document.getElementById("notifications");
    if (!notificationsContainer) {
      notificationsContainer = document.createElement("div");
      notificationsContainer.id = "notifications";
      notificationsContainer.className = "notifications-container";
      document.body.appendChild(notificationsContainer);
    }
    
    const notification = document.createElement("div");
    notification.className = `notification ${type || "info"}`;
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas fa-${
          type === "error"
            ? "exclamation-circle"
            : type === "success"
            ? "check-circle"
            : "info-circle"
        }"></i>
      </div>
      <div class="notification-message">${message}</div>
    `;

    notificationsContainer.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        if (notification.parentNode === notificationsContainer) {
          notificationsContainer.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new PromptoScope();
});