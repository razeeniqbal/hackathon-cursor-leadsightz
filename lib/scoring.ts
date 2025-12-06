/**
 * Lead Scoring Engine - Volume + Stability Algorithm
 * Based on the Python algorithm from the user's attachments
 */

export interface Lead {
  rating: number
  user_ratings_total: number
  price_level?: number
}

export interface ScoredLead extends Lead {
  volume_score: number
  stability_score: number
  total_score: number
  priority_tier: "Critical" | "High" | "Medium" | "Low"
}

/**
 * Calculate Volume Score (0-100)
 * Based on number of reviews - indicates market presence
 */
export function calculateVolumeScore(reviewCount: number): number {
  if (reviewCount === 0) return 0

  // Logarithmic scale to handle wide range of review counts
  // 1 review = 0, 10 reviews = 20, 100 reviews = 40, 1000 reviews = 60, 10000+ reviews = 80-100
  const logScore = Math.log10(reviewCount + 1) * 25

  // Cap at 100
  return Math.min(100, Math.round(logScore * 100) / 100)
}

/**
 * Calculate Stability Score (0-100)
 * Based on average rating - indicates business quality
 */
export function calculateStabilityScore(rating: number): number {
  if (rating === 0) return 0

  // Convert 5-star rating to 0-100 scale
  // 5 stars = 100, 4 stars = 80, 3 stars = 60, 2 stars = 40, 1 star = 20
  const stabilityScore = (rating / 5) * 100

  return Math.round(stabilityScore * 100) / 100
}

/**
 * Calculate Total Score with weighted average
 * Volume (40%) + Stability (60%) = Total Score
 *
 * Rationale:
 * - Stability (60%): Quality is more important than quantity
 * - Volume (40%): Market presence indicates opportunity size
 */
export function calculateTotalScore(volumeScore: number, stabilityScore: number): number {
  const VOLUME_WEIGHT = 0.4
  const STABILITY_WEIGHT = 0.6

  const totalScore = volumeScore * VOLUME_WEIGHT + stabilityScore * STABILITY_WEIGHT

  return Math.round(totalScore * 100) / 100
}

/**
 * Determine priority tier based on total score
 */
export function getPriorityTier(totalScore: number): "Critical" | "High" | "Medium" | "Low" {
  if (totalScore >= 80) return "Critical"
  if (totalScore >= 60) return "High"
  if (totalScore >= 40) return "Medium"
  return "Low"
}

/**
 * Score a single lead with the Volume + Stability algorithm
 */
export function scoreLead(lead: Lead): ScoredLead {
  const volumeScore = calculateVolumeScore(lead.user_ratings_total)
  const stabilityScore = calculateStabilityScore(lead.rating)
  const totalScore = calculateTotalScore(volumeScore, stabilityScore)
  const priorityTier = getPriorityTier(totalScore)

  return {
    ...lead,
    volume_score: volumeScore,
    stability_score: stabilityScore,
    total_score: totalScore,
    priority_tier: priorityTier,
  }
}

/**
 * Score multiple leads and sort by total score (descending)
 */
export function scoreLeads(leads: Lead[]): ScoredLead[] {
  return leads.map(scoreLead).sort((a, b) => b.total_score - a.total_score)
}

/**
 * Get color for priority tier (for UI visualization)
 */
export function getPriorityColor(tier: string): string {
  switch (tier) {
    case "Critical":
      return "destructive" // Red
    case "High":
      return "default" // Orange/Yellow
    case "Medium":
      return "secondary" // Blue
    case "Low":
      return "outline" // Gray
    default:
      return "outline"
  }
}
