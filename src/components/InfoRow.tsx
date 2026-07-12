import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing } from '../lib/styles'

type Props = {
  icon: string
  text: string
  color?: string
}

export function InfoRow({ icon, text, color }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon as any} size={16} color={color ?? Colors.textSecondary} />
      <Text style={[styles.text, color ? { color } : {}]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  text: { fontSize: 14, color: Colors.text, flex: 1 },
})
