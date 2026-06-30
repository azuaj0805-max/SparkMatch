import React from 'react'
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { Colors, Radius, Spacing } from '../lib/styles'

type ChipProps = {
  label: string
  selected: boolean
  onPress: () => void
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

type ChipGroupProps = {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  single?: boolean
  columns?: 1 | 2
}

export function ChipGroup({ options, selected, onChange, single = false, columns = 2 }: ChipGroupProps) {
  function toggle(option: string) {
    if (single) {
      onChange([option])
    } else {
      if (selected.includes(option)) {
        onChange(selected.filter(s => s !== option))
      } else {
        onChange([...selected, option])
      }
    }
  }

  return (
    <View style={columns === 2 ? styles.grid2 : styles.grid1}>
      {options.map(opt => (
        <Chip
          key={opt}
          label={opt}
          selected={selected.includes(opt)}
          onPress={() => toggle(opt)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  label: {
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  labelSelected: {
    color: Colors.primaryDark,
    fontWeight: '500',
  },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  grid1: {
    gap: 8,
  },
})
