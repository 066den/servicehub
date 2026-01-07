// Constants for different image aspect ratios
export const ASPECT_RATIOS = {
  SQUARE: 1, // 1:1 - square
  LANDSCAPE: 16 / 9, // 16:9 - wide format
  PORTRAIT: 3 / 4, // 3:4 - portrait
  GOLDEN: 1.618, // Golden ratio
  CLASSIC: 4 / 3, // 4:3 - classic
  WIDE: 21 / 9, // 21:9 - ultra wide
  INSTAGRAM: 1, // 1:1 - Instagram square
  STORY: 9 / 16, // 9:16 - Instagram Stories
  COVER: 2 / 3, // 2:3 - book cover
} as const

// Types for aspect ratios
export type AspectRatioType = keyof typeof ASPECT_RATIOS

// Function to get the aspect ratio by type
export const getAspectRatio = (type: AspectRatioType): number => {
  return ASPECT_RATIOS[type]
}

// Function to get the aspect ratio label
export const getAspectRatioLabel = (type: AspectRatioType): string => {
  const labels: Record<AspectRatioType, string> = {
    SQUARE: 'Square aspect ratio (1:1)',
    LANDSCAPE: 'Wide format (16:9)',
    PORTRAIT: 'Portrait (3:4)',
    GOLDEN: 'Golden ratio (1.618:1)',
    CLASSIC: 'Classic (4:3)',
    WIDE: 'Ultra wide (21:9)',
    INSTAGRAM: 'Instagram (1:1)',
    STORY: 'Instagram Stories (9:16)',
    COVER: 'Book cover (2:3)',
  }
  return labels[type]
}

// Function to validate the aspect ratio
export const isValidAspectRatio = (ratio: number): boolean => {
  return ratio > 0 && ratio <= 10 // Reasonable limits
}

// Function to round the aspect ratio to a reasonable number of decimal places
export const roundAspectRatio = (
  ratio: number,
  decimals: number = 3
): number => {
  return Math.round(ratio * Math.pow(10, decimals)) / Math.pow(10, decimals)
}
