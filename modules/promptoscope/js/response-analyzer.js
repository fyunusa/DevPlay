/**
 * Analyzes AI responses
 */
class ResponseAnalyzer {
  constructor() {
    this.promptAnalyzer = new PromptAnalyzer();
  }
  
  /**
   * Analyze response quality
   */
  analyzeResponse(prompt, response) {
    return {
      length: this.promptAnalyzer.countTokens(response),
      readability: this.calculateReadability(response),
      relevance: this.estimateRelevance(prompt, response),
      formatCompliance: this.checkFormatCompliance(prompt, response),
      sentimentScore: this.analyzeSentiment(response)
    };
  }
  
  /**
   * Calculate readability score (Flesch-Kincaid simplified)
   */
  calculateReadability(text) {
    const words = text.trim().split(/\s+/).length;
    if (words === 0) return 0;
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const syllables = this.estimateSyllables(text);
    
    const sentencesPerWord = sentences / words;
    const syllablesPerWord = syllables / words;
    
    // Simplified Flesch-Kincaid Grade Level
    const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    
    // Convert to a 0-100 score (higher is more readable)
    return Math.max(0, Math.min(100, 100 - (grade * 5)));
  }
  
  /**
   * Estimate syllable count
   */
  estimateSyllables(text) {
    // Very simple syllable estimator
    const words = text.trim().toLowerCase().split(/\s+/);
    
    return words.reduce((count, word) => {
      // Count vowels groups as syllables
      const syllables = word.replace(/[^aeiouy]/g, ' ').trim().split(/\s+/).length;
      // Every word has at least one syllable
      return count + Math.max(1, syllables);
    }, 0);
  }
  
  /**
   * Estimate relevance of response to prompt
   */
  estimateRelevance(prompt, response) {
    // In a real implementation, you'd use semantic similarity
    // Here we'll use a simple keyword match approach
    
    // Extract keywords from prompt
    const promptWords = new Set(
      prompt.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 3)
    );
    
    // Count keyword occurrences in response
    const responseWords = response.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/);
    
    let matches = 0;
    
    for (const word of responseWords) {
      if (promptWords.has(word)) {
        matches++;
      }
    }
    
    // Calculate relevance score (0-100)
    const relevance = Math.min(100, (matches / Math.max(1, promptWords.size)) * 100);
    
    return relevance;
  }
  
  /**
   * Check if response follows requested format
   */
  checkFormatCompliance(prompt, response) {
    const formatRequests = {
      json: /json|JSON/,
      markdown: /markdown|Markdown|md|MD/,
      table: /table|Table/,
      list: /list|List|bullet points|numbered/
    };
    
    // Check if prompt requests specific format
    for (const [format, regex] of Object.entries(formatRequests)) {
      if (regex.test(prompt)) {
        // Check if response appears to follow that format
        const formatMatches = {
          json: /^\s*[\{\[].*[\}\]]\s*$/s,
          markdown: /^#+ |^\*\*|^- |^```|^>/m,
          table: /\|\s*[^|]+\s*\|/,
          list: /^(\d+[.)]|\*|-)\s+/m
        };
        
        return formatMatches[format].test(response) ? 100 : 0;
      }
    }
    
    // No specific format requested
    return 50;
  }
  
  /**
   * Analyze sentiment (very simplified)
   */
  analyzeSentiment(text) {
    const positive = ["good", "great", "excellent", "amazing", "wonderful", "best", "happy", "positive", "recommend", "love", "like", "helpful", "benefit", "advantage", "success"];
    const negative = ["bad", "terrible", "awful", "horrible", "worst", "sad", "negative", "avoid", "hate", "dislike", "difficult", "problem", "issue", "fail", "poor"];
    
    let score = 50; // Neutral starting point
    const words = text.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      if (positive.includes(word)) score += 2;
      if (negative.includes(word)) score -= 2;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Extract key topics from response
   */
  extractTopics(response) {
    // In a real implementation, you would use NLP or topic modeling
    // For this example, we'll use a simple approach
    
    const words = response.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/);
    
    const stopWords = new Set(["the", "and", "a", "an", "in", "on", "at", "to", "for", "with", "by", "about", "like", "through", "over", "before", "between", "after", "from", "up", "down", "out", "on", "off", "again", "further", "then", "once"]);
    
    // Count word frequencies
    const wordCount = {};
    for (const word of words) {
      if (word.length > 3 && !stopWords.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    }
    
    // Sort by frequency
    const sorted = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
      
    return sorted;
  }
}