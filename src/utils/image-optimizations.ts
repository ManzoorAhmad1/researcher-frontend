export const ImageSizes = {
  // Avatar and profile images
  avatar: {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 36, height: 36 },
    xl: { width: 56, height: 56 },
  },

  // Icons
  icon: {
    xs: { width: 18, height: 18 },
    sm: { width: 20, height: 20 },
    md: { width: 24, height: 24 },
    lg: { width: 32, height: 32 },
    xl: { width: 64, height: 64 },
  },

  // Logos
  logo: {
    sm: { width: 90, height: 90 },
    md: { width: 100, height: 100 },
    lg: { width: 120, height: 120 },
    xl: { with: 150, height: 150 },
    xxl: { width: 200, height: 200 },
  },

  // Social icons
  social: { width: 48, height: 48 },

  // Feature images
  feature: { width: 750, height: 400 },

  // Dashboard-specific sizes
  dashboard: {
    icon: { width: 240, height: 180 },
  },
};

/**
 * Configuration for next/image priority loading
 * Use this for images that are likely to be in the viewport on initial load (LCP candidates)
 */
export const priorityImageProps = {
  priority: true,
  loading: "eager" as const,
};

/**
 * Helper function to get image dimensions with fallback
 */
export const getImageDimensions = (
  type: keyof typeof ImageSizes,
  size: string = "md"
) => {
  try {
    return (ImageSizes[type] as any)[size] || ImageSizes[type];
  } catch (e) {
    // Fallback dimensions to prevent layout shift if misconfigured
    return { width: 24, height: 24 };
  }
};
