import { useColorScheme } from 'react-native';

// Predefined color palettes that work well in both light and dark themes
const colorPalettes = {
  light: [
    { bg: '#EFF6FF', border: '#2563EB', text: '#1E3A8A' }, // Blue
    { bg: '#F0FDF4', border: '#16A34A', text: '#14532D' }, // Green
    { bg: '#FDF2F8', border: '#DC2626', text: '#7F1D1D' }, // Rose
    { bg: '#F3E8FF', border: '#9333EA', text: '#581C87' }, // Purple
    { bg: '#FEF3C7', border: '#D97706', text: '#78350F' }, // Amber
    { bg: '#ECFDF5', border: '#059669', text: '#064E3B' }, // Emerald
    { bg: '#FDF4FF', border: '#C026D3', text: '#86198F' }, // Fuchsia
    { bg: '#F0F9FF', border: '#0284C7', text: '#0C4A6E' }, // Sky
    { bg: '#FFF7ED', border: '#EA580C', text: '#9A3412' }, // Orange
    { bg: '#F8FAFC', border: '#475569', text: '#0F172A' }, // Slate
  ],
  dark: [
    { bg: '#1E3A8A', border: '#60A5FA', text: '#DBEAFE' }, // Blue
    { bg: '#14532D', border: '#4ADE80', text: '#DCFCE7' }, // Green
    { bg: '#7F1D1D', border: '#F87171', text: '#FEE2E2' }, // Rose
    { bg: '#581C87', border: '#C084FC', text: '#F3E8FF' }, // Purple
    { bg: '#78350F', border: '#FBBF24', text: '#FEF3C7' }, // Amber
    { bg: '#064E3B', border: '#34D399', text: '#D1FAE5' }, // Emerald
    { bg: '#86198F', border: '#E879F9', text: '#FAE8FF' }, // Fuchsia
    { bg: '#0C4A6E', border: '#38BDF8', text: '#E0F2FE' }, // Sky
    { bg: '#9A3412', border: '#FB923C', text: '#FED7AA' }, // Orange
    { bg: '#0F172A', border: '#94A3B8', text: '#F1F5F9' }, // Slate
  ],
};

// Cache to store colors for specific superset IDs to ensure consistency
const supersetColorCache = new Map<number, { bg: string; border: string; text: string }>();

export const getSupersetColor = (supersetId: number, isDark: boolean = false) => {
  // Check cache first for consistency
  if (supersetColorCache.has(supersetId)) {
    return supersetColorCache.get(supersetId)!;
  }

  // Use superset ID as seed for consistent "random" selection
  const palette = isDark ? colorPalettes.dark : colorPalettes.light;
  const colorIndex = supersetId % palette.length;
  const selectedColor = palette[colorIndex];

  // Cache the color for this superset ID
  supersetColorCache.set(supersetId, selectedColor);

  return selectedColor;
};

// React hook to get superset colors with theme awareness
export const useSupersetColor = (supersetId: number) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return getSupersetColor(supersetId, isDark);
};

// Clear cache function (useful for testing or manual reset)
export const clearSupersetColorCache = () => {
  supersetColorCache.clear();
};

// Get all available colors for a theme (useful for preview)
export const getAllSupersetColors = (isDark: boolean = false) => {
  return isDark ? colorPalettes.dark : colorPalettes.light;
};

// Generate CSS styles for React Native
export const getSupersetStyles = (supersetId: number, isDark: boolean = false) => {
  const colors = getSupersetColor(supersetId, isDark);
  
  return {
    headerContainer: {
      backgroundColor: colors.bg,
      borderColor: colors.border,
      borderWidth: 1,
    },
    headerText: {
      color: colors.text,
    },
    contentContainer: {
      backgroundColor: colors.bg + '80', // Add transparency
      borderColor: colors.border,
      borderWidth: 1,
      borderTopWidth: 0, // Remove top border to connect with header
    },
    leftBorder: {
      borderLeftColor: colors.border,
      borderLeftWidth: 4,
    },
  };
};
