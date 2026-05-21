// constants/Colors.ts

const primaryPinkLight = '#FF69B4'; // Hot Pink
const primaryPinkDark = '#FF1493';  // Deep Pink

export const Colors = {
  light: {
    text: '#111827',          // Dark gray for readability
    background: '#FFF0F5',    // Lavender Blush (very soft pink)
    surface: '#FFFFFF',       // Pure white for cards/components
    primary: primaryPinkLight,
    icon: '#6B7280',          // Inactive gray icons
    tabIconSelected: primaryPinkLight,
  },
  dark: {
    text: '#F9FAFB',          // Off-white text
    background: '#1A0B13',    // Very dark pinkish-black
    surface: '#2D1422',       // Dark pinkish-gray for cards
    primary: primaryPinkDark,
    icon: '#9CA3AF',
    tabIconSelected: primaryPinkDark,
  },
};
