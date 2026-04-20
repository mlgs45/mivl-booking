export const brand = {
  primary: '#1C2F5E',
  primaryDark: '#0F1A3A',
  accent: '#E63946',
  accentDark: '#B82A36',
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
