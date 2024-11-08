import { FileData } from '../types/message';

interface TopicMatch {
  file: FileData;
  matchedTopics: string[];
  confidence: number;
}

export class TopicMatcher {
  private static normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.normalizeText(text1).split(/\s+/));
    const words2 = new Set(this.normalizeText(text2).split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private static checkPluralSingular(word1: string, word2: string): boolean {
    // Simple plural check - could be expanded with more rules
    return word1 === word2 + 's' || word2 === word1 + 's';
  }

  static findRelevantFiles(files: FileData[], requestedTopics: string[]): TopicMatch[] {
    const matches: TopicMatch[] = [];

    for (const file of files) {
      if (!file.topics || file.topics.length === 0) continue;

      const matchedTopics: string[] = [];
      let totalConfidence = 0;

      for (const reqTopic of requestedTopics) {
        const normalizedReqTopic = this.normalizeText(reqTopic);
        
        for (const fileTopic of file.topics) {
          const normalizedFileTopic = this.normalizeText(fileTopic);

          // Check for exact match
          if (normalizedReqTopic === normalizedFileTopic) {
            matchedTopics.push(fileTopic);
            totalConfidence += 1;
            continue;
          }

          // Check for plural/singular variations
          if (this.checkPluralSingular(normalizedReqTopic, normalizedFileTopic)) {
            matchedTopics.push(fileTopic);
            totalConfidence += 0.9;
            continue;
          }

          // Check if one contains the other
          if (normalizedFileTopic.includes(normalizedReqTopic) || 
              normalizedReqTopic.includes(normalizedFileTopic)) {
            matchedTopics.push(fileTopic);
            totalConfidence += 0.8;
            continue;
          }

          // Calculate similarity for partial matches
          const similarity = this.calculateSimilarity(normalizedReqTopic, normalizedFileTopic);
          if (similarity > 0.5) {
            matchedTopics.push(fileTopic);
            totalConfidence += similarity;
          }
        }

        // Also check filename for relevance
        const normalizedFileName = this.normalizeText(file.fileName);
        if (normalizedFileName.includes(normalizedReqTopic)) {
          totalConfidence += 0.5;
        }
      }

      // If we found any matches, add to results
      if (matchedTopics.length > 0) {
        const avgConfidence = totalConfidence / Math.max(requestedTopics.length, 1);
        matches.push({
          file,
          matchedTopics: [...new Set(matchedTopics)], // Remove duplicates
          confidence: avgConfidence
        });
      }
    }

    // Sort by confidence
    return matches.sort((a, b) => b.confidence - a.confidence);
  }
}