import { StyleSheet } from 'react-native'

export const Colors = {
  // Brand
  primary:       '#6E8CFF',
  primaryLight:  '#EEF1FF',
  primaryDark:   '#4A6AE8',

  // Dark navy
  navy:          '#101E3B',
  navyLight:     '#1C2D52',

  // Supporting
  green:         '#2D7A5F',
  greenLight:    '#E0F2EA',
  greenBorder:   '#A8D4BC',
  blue:          '#3A6EA8',
  blueLight:     '#E0EAF5',
  purple:        '#534AB7',
  purpleLight:   '#EEEDFE',
  amber:         '#854F0B',
  amberLight:    '#FAEEDA',
  pink:          '#993556',
  pinkLight:     '#FBEAF0',

  // Neutrals
  text:          '#101E3B',
  textSecondary: '#4A5568',
  textTertiary:  '#8896AB',
  border:        '#E8ECF4',
  borderDark:    '#C8D0E0',
  surface:       '#F4F6FF',
  surfaceAlt:    '#F8F9FC',
  background:    '#FFFFFF',

  // Status
  danger:        '#E53E3E',
  dangerLight:   '#FFF5F5',
}

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
}

export const Radius = {
  sm: 6, md: 10, lg: 14, xl: 20, xxl: 28, full: 999,
}

export const GlobalStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: 'row', alignItems: 'center' },
  separator: { height: 0.5, backgroundColor: Colors.border },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
})
