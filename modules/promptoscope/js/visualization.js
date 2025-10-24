/**
 * Creates visualizations for prompt analysis
 */
class Visualizer {
  constructor() {
    this.promptAnalyzer = new PromptAnalyzer();
    this.colors = {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      highlight: '#ec4899',
      muted: '#94a3b8',
      light: '#f1f5f9',
      dark: '#334155'
    };
  }
  
  /**
   * Render attention map visualization
   */
  renderAttentionMap(prompt, response) {
    const container = document.getElementById('attention-viz');
    if (!container) return;
    
    // In a real implementation, this would use actual attention data from the API
    // Here we'll simulate it based on keyword matching
    
    const words = prompt.split(/\s+/);
    const attentionScores = this.generateSimulatedAttentionScores(words);
    
    let html = '<div class="attention-map">';
    
    words.forEach((word, i) => {
      const score = attentionScores[i];
      const intensity = Math.floor(score * 100);
      const fontSize = 14 + (score * 10); // 14-24px
      
      html += `<span class="attention-word" style="
        font-size: ${fontSize}px; 
        background-color: rgba(99, 102, 241, ${score}); 
        color: ${score > 0.5 ? 'white' : 'black'};
      " title="Attention score: ${intensity}%">${word}</span>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
  }
  
  /**
   * Generate simulated attention scores
   */
  generateSimulatedAttentionScores(words) {
    // Keywords that typically get attention
    const highAttentionWords = [
      "you", "your", "expert", "create", "write", "generate", "analyze",
      "explain", "detail", "important", "critical", "key", "main",
      "must", "should", "don't", "do", "not", "never", "always",
      "json", "format", "markdown", "table", "list"
    ];
    
    return words.map(word => {
      const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      
      // Words at beginning and end tend to get more attention
      const positionFactor = 0.2;
      
      if (highAttentionWords.includes(cleanWord)) {
        return Math.min(0.9, 0.7 + Math.random() * 0.3); // High attention 0.7-0.9
      } else if (word.length > 8) {
        return Math.min(0.8, 0.5 + Math.random() * 0.3); // Medium-high attention 0.5-0.8
      } else if (word.length < 3) {
        return 0.1 + Math.random() * 0.2; // Low attention 0.1-0.3
      } else {
        return 0.3 + Math.random() * 0.3; // Medium attention 0.3-0.6
      }
    });
  }
  
  /**
   * Render prompt structure visualization
   */
  renderPromptStructure(prompt) {
    const container = document.getElementById('structure-viz');
    if (!container) return;
    
    const structure = this.promptAnalyzer.analyzeStructure(prompt);
    
    // Calculate percentages
    const total = Object.values(structure).reduce((sum, arr) => {
      return sum + (Array.isArray(arr) ? arr.length : (arr ? 1 : 0));
    }, 0);
    
    const getPercentage = (value) => {
      const count = Array.isArray(value) ? value.length : (value ? 1 : 0);
      return Math.round((count / Math.max(1, total)) * 100);
    };
    
    const percentages = {
      instructions: getPercentage(structure.instructions),
      context: getPercentage(structure.context),
      examples: getPercentage(structure.examples),
      constraints: getPercentage(structure.constraints),
      query: getPercentage(structure.query)
    };
    
    // Create the visualization
    let html = `
      <div class="structure-chart">
        <div class="structure-bar" style="display: flex; height: 40px; width: 100%; border-radius: 6px; overflow: hidden;">
    `;
    
    // Add segments to the bar
    if (percentages.context > 0) {
      html += `<div class="segment context" style="width: ${percentages.context}%; background-color: #6366f1;" title="Context: ${percentages.context}%"></div>`;
    }
    if (percentages.instructions > 0) {
      html += `<div class="segment instructions" style="width: ${percentages.instructions}%; background-color: #8b5cf6;" title="Instructions: ${percentages.instructions}%"></div>`;
    }
    if (percentages.examples > 0) {
      html += `<div class="segment examples" style="width: ${percentages.examples}%; background-color: #ec4899;" title="Examples: ${percentages.examples}%"></div>`;
    }
    if (percentages.constraints > 0) {
      html += `<div class="segment constraints" style="width: ${percentages.constraints}%; background-color: #f59e0b;" title="Constraints: ${percentages.constraints}%"></div>`;
    }
    if (percentages.query > 0) {
      html += `<div class="segment query" style="width: ${percentages.query}%; background-color: #10b981;" title="Query: ${percentages.query}%"></div>`;
    }
    
    html += `</div>
      <div class="structure-legend">
        <div class="legend-item"><span class="color-dot" style="background-color: #6366f1;"></span> Context (${percentages.context}%)</div>
        <div class="legend-item"><span class="color-dot" style="background-color: #8b5cf6;"></span> Instructions (${percentages.instructions}%)</div>
        <div class="legend-item"><span class="color-dot" style="background-color: #ec4899;"></span> Examples (${percentages.examples}%)</div>
        <div class="legend-item"><span class="color-dot" style="background-color: #f59e0b;"></span> Constraints (${percentages.constraints}%)</div>
        <div class="legend-item"><span class="color-dot" style="background-color: #10b981;"></span> Query (${percentages.query}%)</div>
      </div>
    `;
    
    // Add component breakdown
    html += `<div class="structure-components">`;
    
    // Add each component
    for (const [type, items] of Object.entries(structure)) {
      if (Array.isArray(items) && items.length > 0) {
        html += `
          <div class="component-section">
            <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
            <ul class="component-list">
              ${items.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `;
      } else if (!Array.isArray(items) && items) {
        html += `
          <div class="component-section">
            <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
            <p>${items}</p>
          </div>
        `;
      }
    }
    
    html += `</div>`;
    
    container.innerHTML = html;
  }
  
  /**
   * Render context window visualization
   */
  renderContextWindow(prompt) {
    const container = document.getElementById('context-viz');
    if (!container) return;
    
    const tokens = this.promptAnalyzer.countTokens(prompt);
    const maxTokens = 4000; // Typical context window for GPT-3.5
    
    const percentage = Math.min(100, (tokens / maxTokens) * 100);
    
    let color;
    if (percentage < 25) {
      color = '#10b981'; // Green
    } else if (percentage < 50) {
      color = '#6366f1'; // Blue
    } else if (percentage < 75) {
      color = '#f59e0b'; // Orange
    } else {
      color = '#ef4444'; // Red
    }
    
    // Create the visualization
    let html = `
      <div class="token-gauge">
        <div class="token-bar">
          <div class="token-fill" style="width: ${percentage}%; background-color: ${color};"></div>
        </div>
        <div class="token-label">
          ${tokens} / ${maxTokens} tokens (${percentage.toFixed(1)}% of context window)
        </div>
        <div class="token-description">
          <p>Your prompt uses approximately ${tokens} tokens. This visualization shows how much of the AI model's context window is consumed by your prompt.</p>
          <p>The remaining space (${maxTokens - tokens} tokens) is available for the AI to generate its response.</p>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  /**
   * Render prompt X-Ray (detailed breakdown)
   */
  renderPromptXRay(prompt) {
    const container = document.getElementById('xray-viz');
    if (!container) return;
    
    // Get analysis data
    const structure = this.promptAnalyzer.analyzeStructure(prompt);
    const triggers = this.promptAnalyzer.identifyTriggerWords(prompt);
    const score = this.promptAnalyzer.scorePrompt(prompt);
    const suggestions = this.promptAnalyzer.getSuggestions(prompt);
    
    // Create the visualization
    let html = `
      <div class="xray-container">
        <div class="xray-score">
          <div class="score-circle" style="
            background: conic-gradient(
              ${this.colors.primary} ${score}%, 
              ${this.colors.light} ${score}% 100%
            );
          ">
            <div class="score-inner">${Math.round(score)}</div>
          </div>
          <div class="score-label">Prompt Strength Score</div>
        </div>
        
        <div class="xray-details">
          <h3>Prompt Analysis</h3>
          
          <div class="xray-section">
            <h4>Trigger Words</h4>
            <div class="trigger-categories">
    `;
    
    // Add trigger words
    for (const [category, words] of Object.entries(triggers)) {
      if (words.length > 0) {
        html += `
          <div class="trigger-category">
            <div class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
            <div class="category-words">
              ${words.map(word => `<span class="trigger-word">${word}</span>`).join('')}
            </div>
          </div>
        `;
      }
    }
    
    html += `
            </div>
          </div>
          
          <div class="xray-section">
            <h4>Suggestions</h4>
            <ul class="suggestion-list">
              ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
              ${suggestions.length === 0 ? '<li>No suggestions - your prompt looks great!</li>' : ''}
            </ul>
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }
}