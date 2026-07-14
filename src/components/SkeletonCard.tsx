import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, Dimensions } from 'react-native'
import { Colors, Radius, Spacing } from '../lib/styles'

const { width } = Dimensions.get('window')

function SkeletonBox({ width: w, height: h, borderRadius = 8, style }: {
  width: number | string
  height: number
  borderRadius?: number
  style?: any
}) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius, backgroundColor: Colors.border, opacity },
        style,
      ]}
    />
  )
}

export function SkeletonProfileCard() {
  return (
    <View style={styles.card}>
      {/* Photo area */}
      <SkeletonBox width="100%" height={260} borderRadius={0} />

      <View style={styles.body}>
        {/* Name + salary */}
        <View style={styles.nameRow}>
          <SkeletonBox width={160} height={24} borderRadius={6} />
          <SkeletonBox width={70} height={24} borderRadius={12} />
        </View>

        {/* Location */}
        <SkeletonBox width={120} height={14} borderRadius={4} style={{ marginTop: 8 }} />

        {/* Tags */}
        <View style={styles.tagRow}>
          <SkeletonBox width={90} height={28} borderRadius={14} />
          <SkeletonBox width={110} height={28} borderRadius={14} />
        </View>

        {/* Prompt box */}
        <View style={styles.promptBox}>
          <SkeletonBox width={80} height={10} borderRadius={4} />
          <SkeletonBox width="100%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
          <SkeletonBox width="80%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <SkeletonBox width={52} height={52} borderRadius={26} />
        <SkeletonBox width={64} height={64} borderRadius={32} />
        <SkeletonBox width={52} height={52} borderRadius={26} />
      </View>
    </View>
  )
}

export function SkeletonConvoRow() {
  return (
    <View style={styles.convoRow}>
      <SkeletonBox width={52} height={52} borderRadius={26} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBox width={120} height={14} borderRadius={4} />
        <SkeletonBox width={200} height={12} borderRadius={4} />
      </View>
      <SkeletonBox width={30} height={12} borderRadius={4} />
    </View>
  )
}

export function SkeletonProfileHeader() {
  return (
    <View style={styles.profileHero}>
      <SkeletonBox width={76} height={76} borderRadius={38} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBox width={150} height={20} borderRadius={5} />
        <SkeletonBox width={100} height={14} borderRadius={4} />
        <SkeletonBox width={80} height={20} borderRadius={10} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  body: { padding: Spacing.lg, gap: Spacing.md },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tagRow: { flexDirection: 'row', gap: 8 },
  promptBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  convoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
})
