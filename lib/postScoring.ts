/**
 * Post Scoring Algorithm
 * 
 * Ranks posts based on:
 * - Engagement (likes + comments)
 * - Quality (negative impact from flags)
 * - Freshness (time decay)
 * 
 * Similar to Reddit's "Hot" algorithm
 */

interface PostScoreData {
  likesCount: number;
  commentsCount: number;
  flagCount?: number;
  createdAt: Date | string;
}

/**
 * Calculate a post's score for ranking
 * 
 * Formula: score = (engagement - quality_penalty) / time_decay
 * 
 * Where:
 * - engagement = likes + (comments * 2) [comments weighted higher]
 * - quality_penalty = flags * 5 [flags heavily penalize]
 * - time_decay = (hours_old + 2) ^ 1.5 [exponential decay]
 */
export function calculatePostScore(post: PostScoreData): number {
  // Get post age in hours
  const createdAt = post.createdAt instanceof Date 
    ? post.createdAt 
    : new Date(post.createdAt);
  const now = new Date();
  const ageInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  // Calculate engagement score
  // Comments are weighted 2x because they indicate deeper engagement
  const engagementScore = post.likesCount + (post.commentsCount * 2);
  
  // Calculate quality penalty from flags
  // Each flag reduces the score significantly
  const flagPenalty = (post.flagCount || 0) * 5;
  
  // Base score (can be negative if heavily flagged)
  const baseScore = engagementScore - flagPenalty;
  
  // Time decay factor
  // Adding 2 to age prevents division issues and gives new posts a boost
  // Using 1.5 as exponent for moderate decay (not too fast, not too slow)
  const timeDecay = Math.pow(ageInHours + 2, 1.5);
  
  // Final score
  const score = baseScore / timeDecay;
  
  return score;
}

/**
 * Sort posts by score (highest first)
 */
export function sortPostsByScore<T extends PostScoreData>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const scoreA = calculatePostScore(a);
    const scoreB = calculatePostScore(b);
    return scoreB - scoreA; // Descending order (highest score first)
  });
}

/**
 * Get top N posts by score
 */
export function getTopPosts<T extends PostScoreData>(posts: T[], limit: number): T[] {
  const sorted = sortPostsByScore(posts);
  return sorted.slice(0, limit);
}

/**
 * Configuration for scoring algorithm
 * Adjust these to tune the ranking behavior
 */
export const SCORING_CONFIG = {
  // Weight for comments (higher = comments matter more)
  commentWeight: 2,
  
  // Penalty multiplier for flags (higher = flags hurt more)
  flagPenalty: 5,
  
  // Time decay exponent (higher = faster decay)
  // 1.0 = linear, 1.5 = moderate, 2.0 = aggressive
  timeDecayExponent: 1.5,
  
  // Grace period in hours (new posts get a boost)
  gracePeriodHours: 2,
};

/**
 * Calculate score with custom config
 */
export function calculatePostScoreCustom(
  post: PostScoreData,
  config: typeof SCORING_CONFIG = SCORING_CONFIG
): number {
  const createdAt = post.createdAt instanceof Date 
    ? post.createdAt 
    : new Date(post.createdAt);
  const now = new Date();
  const ageInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  const engagementScore = post.likesCount + (post.commentsCount * config.commentWeight);
  const flagPenalty = (post.flagCount || 0) * config.flagPenalty;
  const baseScore = engagementScore - flagPenalty;
  const timeDecay = Math.pow(ageInHours + config.gracePeriodHours, config.timeDecayExponent);
  
  return baseScore / timeDecay;
}

/**
 * Debug: Get detailed scoring breakdown
 */
export function getScoreBreakdown(post: PostScoreData): {
  score: number;
  engagement: number;
  flagPenalty: number;
  baseScore: number;
  ageInHours: number;
  timeDecay: number;
} {
  const createdAt = post.createdAt instanceof Date 
    ? post.createdAt 
    : new Date(post.createdAt);
  const now = new Date();
  const ageInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  const engagement = post.likesCount + (post.commentsCount * 2);
  const flagPenalty = (post.flagCount || 0) * 5;
  const baseScore = engagement - flagPenalty;
  const timeDecay = Math.pow(ageInHours + 2, 1.5);
  const score = baseScore / timeDecay;
  
  return {
    score,
    engagement,
    flagPenalty,
    baseScore,
    ageInHours: Math.round(ageInHours * 100) / 100,
    timeDecay: Math.round(timeDecay * 100) / 100,
  };
}

