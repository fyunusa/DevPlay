/**
 * Manages AI model parameters for PromptoScope
 */
class ParameterManager {
  constructor() {
    this.parameters = {
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 1000,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    };
    
    this.parameterInfo = {
      temperature: {
        min: 0,
        max: 2,
        step: 0.1,
        description: "Controls randomness. Lower values are more deterministic, higher values are more creative."
      },
      topP: {
        min: 0,
        max: 1,
        step: 0.05,
        description: "Controls diversity by limiting the cumulative probability of token selection."
      },
      maxTokens: {
        min: 50,
        max: 4000,
        step: 50,
        description: "Maximum number of tokens to generate in the response."
      },
      frequencyPenalty: {
        min: -2,
        max: 2,
        step: 0.1,
        description: "Reduces repetition by penalizing tokens that have already appeared in the text."
      },
      presencePenalty: {
        min: -2,
        max: 2,
        step: 0.1,
        description: "Encourages diversity by penalizing tokens that have appeared at all."
      }
    };
  }
  
  /**
   * Initialize parameter sliders in the UI
   */
  initParameters() {
    const paramContainer = document.getElementById('parameter-controls');
    if (!paramContainer) return;
    
    // Create sliders for each parameter
    for (const [param, value] of Object.entries(this.parameters)) {
      const info = this.parameterInfo[param];
      
      const paramSlider = document.createElement('div');
      paramSlider.className = 'param-slider';
      paramSlider.innerHTML = `
        <div class="param-header">
          <label for="${param}-slider">${this.formatParamName(param)}</label>
          <span class="param-value" id="${param}-value">${value}</span>
        </div>
        <input 
          type="range" 
          id="${param}-slider" 
          min="${info.min}" 
          max="${info.max}" 
          step="${info.step}" 
          value="${value}"
        >
        <div class="param-description">${info.description}</div>
      `;
      
      paramContainer.appendChild(paramSlider);
      
      // Add event listener
      const slider = document.getElementById(`${param}-slider`);
      const valueDisplay = document.getElementById(`${param}-value`);
      
      slider.addEventListener('input', (e) => {
        const newValue = parseFloat(e.target.value);
        this.parameters[param] = newValue;
        valueDisplay.textContent = newValue;
      });
    }
  }
  
  /**
   * Format parameter name for display
   */
  formatParamName(param) {
    return param
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Get current parameters
   */
  getParameters() {
    return {...this.parameters};
  }
  
  /**
   * Set parameters from saved prompt
   */
  setParameters(params) {
    // Update internal state
    for (const [param, value] of Object.entries(params)) {
      if (this.parameters.hasOwnProperty(param)) {
        this.parameters[param] = value;
      }
    }
    
    // Update UI
    for (const [param, value] of Object.entries(params)) {
      const slider = document.getElementById(`${param}-slider`);
      const valueDisplay = document.getElementById(`${param}-value`);
      
      if (slider && valueDisplay) {
        slider.value = value;
        valueDisplay.textContent = value;
      }
    }
  }
}