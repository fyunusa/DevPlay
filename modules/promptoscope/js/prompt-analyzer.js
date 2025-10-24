/**
 * Analyzes and provides insights about prompts
 */
class PromptAnalyzer {
  constructor() {
    // Simple GPT tokenizer approximation
    this.avgWordsPerToken = 0.75;
  }
  
  /**
   * Count approximate tokens in text
   * In a real implementation, you'd use a proper tokenizer
   */
  countTokens(text) {
    if (!text) return 0;
    
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / this.avgWordsPerToken);
  }
  
  /**
   * Analyze prompt structure
   */
  analyzeStructure(prompt) {
    const structure = {
      instructions: [],
      context: [],
      examples: [],
      constraints: [],
      query: ''
    };
    
    // This is a simplified version - in a real app you'd use NLP
    const lines = prompt.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      if (line.match(/example|e\.g\.|for instance|such as/i)) {
        structure.examples.push(line);
      }
      else if (line.match(/must|should|always|never|don't|do not|ensure|make sure|require/i)) {
        structure.constraints.push(line);
      }
      else if (line.endsWith('?') || i === lines.length - 1) {
        structure.query = line;
      }
      else if (line.match(/^(you are|you're|act as|behave as|pretend to be)/i)) {
        structure.context.push(line);
      }
      else {
        structure.instructions.push(line);
      }
    }
    
    return structure;
  }
  
  /**
   * Identify key trigger words in a prompt
   */
  identifyTriggerWords(prompt) {
    const triggerWordCategories = {
      persona: ['you are', 'act as', 'behave as', 'expert', 'professional', 'role'],
      format: ['json', 'markdown', 'table', 'list', 'bullet points', 'step by step'],
      tone: ['formal', 'casual', 'friendly', 'professional', 'academic', 'simple'],
      length: ['concise', 'brief', 'detailed', 'comprehensive', 'in-depth'],
      constraints: ['don\'t', 'do not', 'never', 'always', 'must', 'only']
    };
    
    const found = {};
    
    for (const [category, words] of Object.entries(triggerWordCategories)) {
      found[category] = words.filter(word => 
        prompt.toLowerCase().includes(word.toLowerCase())
      );
    }
    
    return found;
  }
  
  /**
   * Generate a score for the prompt (0-100)
   * Based on various best practices
   */
  scorePrompt(prompt) {
    let score = 50; // Start at neutral
    
    // Length (not too short, not too long)
    const tokens = this.countTokens(prompt);
    if (tokens < 10) score -= 20;
    else if (tokens < 30) score -= 10;
    else if (tokens > 2000) score -= 15;
    else if (tokens > 1000) score -= 5;
    else score += 5;
    
    // Structure
    const structure = this.analyzeStructure(prompt);
    if (structure.context.length > 0) score += 10;
    if (structure.constraints.length > 0) score += 5;
    if (structure.examples.length > 0) score += 10;
    if (structure.query) score += 5;
    
    // Trigger words
    const triggers = this.identifyTriggerWords(prompt);
    if (triggers.persona.length > 0) score += 5;
    if (triggers.format.length > 0) score += 5;
    
    // Check for specificity indicators
    if (prompt.match(/specific|exactly|precisely/i)) score += 5;
    
    // Clarity
    const avgSentenceLength = this.calculateAvgSentenceLength(prompt);
    if (avgSentenceLength > 40) score -= 10;
    else if (avgSentenceLength < 15) score += 5;
    
    // Cap the score
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate average sentence length
   */
  calculateAvgSentenceLength(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    const totalWords = sentences.reduce((count, sentence) => {
      return count + sentence.trim().split(/\s+/).length;
    }, 0);
    
    return totalWords / sentences.length;
  }
  
  /**
   * Get suggestions for improving the prompt
   */
  getSuggestions(prompt) {
    const suggestions = [];
    const structure = this.analyzeStructure(prompt);
    const tokens = this.countTokens(prompt);
    
    if (tokens < 30) {
      suggestions.push('Your prompt is quite short. Consider adding more details or context.');
    }
    
    if (structure.context.length === 0) {
      suggestions.push('Add context or role information (e.g., "You are an expert in...").');
    }
    
    if (structure.examples.length === 0) {
      suggestions.push('Including examples can improve the quality of responses.');
    }
    
    if (structure.constraints.length === 0) {
      suggestions.push('Consider adding constraints or requirements to guide the response.');
    }
    
    const triggers = this.identifyTriggerWords(prompt);
    if (triggers.format.length === 0) {
      suggestions.push('Specify a desired output format (list, table, paragraph, etc).');
    }
    
    if (!prompt.includes('?') && structure.query === '') {
      suggestions.push('End your prompt with a clear question or request.');
    }
    
    return suggestions;
  }
}