import { Platform } from 'react-native';

export const typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
  sizes: {
    captionSmall: 7,
    caption: 8,
    small: 9,
    bodySmall: 10,
    body: 11,
    bodyLarge: 12,
    subheading: 14,
    title: 16,
    heading2: 21,
    heading1: 34,
    display: 36,
  },
};
