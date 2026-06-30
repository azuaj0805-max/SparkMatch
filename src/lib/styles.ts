import { StyleSheet } from 'react-native'

export const Colors = {
  primary:       '#D85A30',
  primaryLight:  '#FAECE7',
  primaryDark:   '#993C1D',
  green:         '#3B6D11',
  greenLight:    '#EAF3DE',
  greenBorder:   '#C0DD97',
  blue:          '#185FA5',
  blueLight:     '#E6F1FB',
  teal:          '#0F6E56',
  tealLight:     '#E1F5EE',
  purple:        '#534AB7',
  purpleLight:   '#EEEDFE',
  amber:         '#854F0B',
  amberLight:    '#FAEEDA',
  pink:          '#993556',
  pinkLight:     '#FBEAF0',
  text:          '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary:  '#9B9B9B',
  border:        '#E5E5E5',
  borderDark:    '#CCCCCC',
  surface:       '#F7F7F5',
  background:    '#FFFFFF',
  danger:        '#A32D2D',
  dangerLight:   '#FCEBEB',
}

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
}

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 999,
}

export const GlobalStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: 'row', alignItems: 'center' },
  separator: { height: 0.5, backgroundColor: Colors.border },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.borderDark,
  },
  secondaryButtonText: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  input: {
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
})
