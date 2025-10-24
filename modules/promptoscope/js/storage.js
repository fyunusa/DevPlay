/**
 * Handles local storage operations for PromptoScope
 */
class StorageManager {
  constructor() {
    this.KEYS = {
      PROMPTS: 'promptoscope_prompts',
      API_KEYS: 'promptoscope_api_keys',
      TEMPLATES: 'promptoscope_custom_templates',
    };
  }
  
  /**
   * Save a prompt to local storage
   */
  savePrompt(prompt) {
    const prompts = this.getPrompts() || [];
    
    // If prompt with same ID exists, update it
    const index = prompts.findIndex(p => p.id === prompt.id);
    if (index !== -1) {
      prompts[index] = prompt;
    } else {
      prompts.push(prompt);
    }
    
    localStorage.setItem(this.KEYS.PROMPTS, JSON.stringify(prompts));
  }
  
  /**
   * Get all saved prompts
   */
  getPrompts() {
    const promptsStr = localStorage.getItem(this.KEYS.PROMPTS);
    return promptsStr ? JSON.parse(promptsStr) : [];
  }
  
  /**
   * Get a specific prompt by ID
   */
  getPromptById(id) {
    const prompts = this.getPrompts() || [];
    return prompts.find(p => p.id === id);
  }
  
  /**
   * Delete a prompt
   */
  deletePrompt(id) {
    const prompts = this.getPrompts() || [];
    const filtered = prompts.filter(p => p.id !== id);
    localStorage.setItem(this.KEYS.PROMPTS, JSON.stringify(filtered));
  }
  
  /**
   * Save API keys
   */
  saveApiKeys(keys) {
    localStorage.setItem(this.KEYS.API_KEYS, JSON.stringify(keys));
  }
  
  /**
   * Get API keys
   */
  getApiKeys() {
    const keysStr = localStorage.getItem(this.KEYS.API_KEYS);
    return keysStr ? JSON.parse(keysStr) : null;
  }
  
  /**
   * Save custom templates
   */
  saveTemplate(template) {
    const templates = this.getTemplates() || [];
    
    // If template with same ID exists, update it
    const index = templates.findIndex(t => t.id === template.id);
    if (index !== -1) {
      templates[index] = template;
    } else {
      template.id = Date.now(); // Assign ID if new
      templates.push(template);
    }
    
    localStorage.setItem(this.KEYS.TEMPLATES, JSON.stringify(templates));
  }
  
  /**
   * Get custom templates
   */
  getTemplates() {
    const templatesStr = localStorage.getItem(this.KEYS.TEMPLATES);
    return templatesStr ? JSON.parse(templatesStr) : [];
  }
  
  /**
   * Delete a template
   */
  deleteTemplate(id) {
    const templates = this.getTemplates() || [];
    const filtered = templates.filter(t => t.id !== id);
    localStorage.setItem(this.KEYS.TEMPLATES, JSON.stringify(filtered));
  }
  
  /**
   * Clear all data
   */
  clearAll() {
    localStorage.removeItem(this.KEYS.PROMPTS);
    localStorage.removeItem(this.KEYS.TEMPLATES);
    // Don't clear API keys
  }
}