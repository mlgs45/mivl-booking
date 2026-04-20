export const brand = {
  primary: '#1B4DB5',
  primaryDark: '#143D9B',
  accent: '#FFC72C',
  accentDark: '#E6AF00',
  neutral50: '#F5F7FA',
  neutral100: '#E9EDF2',
  neutral700: '#2D2D2D',
  neutral900: '#0D0D0D',
  success: '#16A34A',
  warning: '#EAB308',
  danger: '#DC2626',
  white: '#FFFFFF',
} as const;

export type BrandColor = keyof typeof brand;
