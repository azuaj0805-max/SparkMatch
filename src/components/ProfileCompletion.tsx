import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { Colors, Spacing, Radius } from '../lib/styles'
import { Profile } from '../types'

type Item = {
  key: string
  label: string
  done: boolean
  icon: string
}

function getItems(profile: Profile): Item[] {
  return [
    { key: 'photo', label: 'Add a photo', done: (profile.photos?.length ?? 0) > 0, icon: 'camera-outline' },
    { key: 'job', label: 'Add your job title', done: !!profile.job_title, icon: 'briefcase-outline' },
    { key: 'salary', label: 'Add salary range', done: !!profile.salary_range, icon: 'trending-up-outline' },
    { key: 'prompt', label: 'Answer a prompt', done: (profile.prompts?.length ?? 0) > 0 && !!profile.prompts?.[0]?.answer, icon: 'chatbubble-outline' },
    { key: 'looking', label: 'Set dating goals', done: !!profile.looking_for, icon: 'flag-outline' },
    { key: 'industry', label: 'Add your industry', done: !!profile.industry, icon: 'business-outline' },
  ]
}

export function ProfileCompletion({ profile }: { profile: Profile }) {
  const navigation = useNavigation<any>()
  const items = getItems(profile)
  const done = items.filter(i => i.done).length
  const total = items.length
  const percent = Math.round((done / total) * 100)
  const remaining = items.filter(i => !i.done)

  if (percent === 100) return null

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('EditProfile') }}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Complete your profile</Text>
          <Text style={styles.sub}>{done} of {total} complete · {percent}%</Text>
        </View>
        <Text style={styles.percent}>{percent}%</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      {/* Remaining items */}
      <View style={styles.items}>
        {remaining.slice(0, 3).map(item => (
          <View key={item.key} style={styles.item}>
            <View style={styles.itemIcon}>
              <Ionicons name={item.icon as any} size={14} color={Colors.primary} />
            </View>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
          </View>
        ))}
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaText}>Complete profile →</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.navy,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { gap: 2 },
  title: { fontSize: 15, fontFamily: 'DMSans_700Bold', color: '#fff' },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'DMSans_400Regular' },
  percent: { fontSize: 28, fontFamily: 'DMSans_700Bold', color: Colors.primary },
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  items: { gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(110,140,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  itemLabel: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'DMSans_400Regular' },
  cta: { alignItems: 'flex-end' },
  ctaText: { fontSize: 13, color: Colors.primary, fontFamily: 'DMSans_600SemiBold' },
})
