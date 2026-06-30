import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLikesReceived } from '../../hooks/useDiscover'
import { useAuth } from '../../hooks/useAuth'
import { Avatar } from '../../components/Avatar'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { SALARY_BADGE_LABELS, LOOKING_FOR_LABELS } from '../../types'

export function LikesScreen() {
  const { likes, count } = useLikesReceived()
  const PREMIUM = false

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Likes You</Text>
        <Text style={styles.headerCount}>{count} people</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        {!PREMIUM && (
          <View style={styles.upgradeBanner}>
            <Text style={styles.upgradeTitle}>See who likes you</Text>
            <Text style={styles.upgradeSub}>Upgrade to Premium to see all {count} people.</Text>
            <TouchableOpacity style={[GlobalStyles.primaryButton, { width: '100%' }]}>
              <Text style={GlobalStyles.primaryButtonText}>Upgrade — $12/mo</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.likesGrid}>
          {likes.map((like) => (
            <View key={like.id} style={styles.likeTile}>
              <View style={[styles.likeTileInner, !PREMIUM && styles.blurred]}>
                <Avatar name={like.liker?.first_name ?? '?'} photo={PREMIUM ? like.liker?.photos?.[0] : null} size={80} />
              </View>
              <View style={styles.nameOverlay}>
                <Text style={styles.overlayName} numberOfLines={1}>{PREMIUM ? like.liker?.first_name : '• • •'}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export function ProfileScreen() {
  const { profile, signOut } = useAuth()
  if (!profile) return null

  const salaryLabel = profile.salary_range ? SALARY_BADGE_LABELS[profile.salary_range] : null
  const lookingForLabel = profile.looking_for ? LOOKING_FOR_LABELS[profile.looking_for] : null

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.profileScroll}>
        <View style={styles.profileHero}>
          <Avatar name={profile.first_name} photo={profile.photos?.[0]} size={72} />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile.first_name}, {profile.age}</Text>
            <Text style={styles.profileSub}>{profile.city}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Career</Text>
          {profile.job_title && <InfoRow icon="💼" text={`${profile.job_title}${profile.company ? ` · ${profile.company}` : ''}`} />}
          {profile.industry && <InfoRow icon="🏢" text={profile.industry} />}
          {salaryLabel && (
            <View style={styles.salaryRow}>
              <Text style={styles.salaryLabel}>💰  Salary range</Text>
              <Text style={styles.salaryValue}>{salaryLabel}</Text>
            </View>
          )}
        </View>
        {lookingForLabel && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dating preferences</Text>
            <InfoRow icon="🎯" text={lookingForLabel} />
            {profile.relationship_style?.length > 0 && <InfoRow icon="💑" text={profile.relationship_style.join(', ')} />}
            {profile.orientation?.length > 0 && profile.show_orientation && <InfoRow icon="🌈" text={profile.orientation.join(', ')} />}
          </View>
        )}
        {profile.work_style?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Work style</Text>
            <View style={styles.tagWrap}>
              {profile.work_style.map(w => (
                <View key={w} style={styles.tag}>
                  <Text style={styles.tagText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {profile.prompts?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Prompts</Text>
            {profile.prompts.map((p, i) => (
              <View key={i} style={[styles.promptBox, i < profile.prompts.length - 1 && { marginBottom: 8 }]}>
                <Text style={styles.promptLabel}>{p.question}</Text>
                <Text style={styles.promptAnswer}>{p.answer}</Text>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity style={[GlobalStyles.primaryButton, { marginBottom: 12 }]}>
          <Text style={GlobalStyles.primaryButtonText}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[GlobalStyles.secondaryButton, { marginBottom: 40 }]}
          onPress={() => Alert.alert('Sign out', 'Are you sure?', [
            { text: 'Cancel' },
            { text: 'Sign out', style: 'destructive', onPress: signOut },
          ])}
        >
          <Text style={GlobalStyles.secondaryButtonText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: 14, borderBottomWidth: 0.5, borderColor: Colors.border },
  headerTitle: { fontSize: 22, fontWeight: '600', color: Colors.text },
  headerCount: { fontSize: 13, color: Colors.textSecondary },
  upgradeBanner: { margin: 16, padding: 16, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface, gap: 10 },
  upgradeTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  upgradeSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  likesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 2 },
  likeTile: { width: '50%', aspectRatio: 3/4, position: 'relative', overflow: 'hidden' },
  likeTileInner: { flex: 1, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  blurred: { opacity: 0.15 },
  nameOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, paddingTop: 24, backgroundColor: 'rgba(0,0,0,0.5)' },
  overlayName: { fontSize: 13, fontWeight: '600', color: '#fff' },
  profileScroll: { padding: Spacing.xl, gap: 12, paddingBottom: 100 },
  profileHero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  profileName: { fontSize: 20, fontWeight: '600', color: Colors.text },
  profileSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  card: { backgroundColor: Colors.background, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.lg },
  cardTitle: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  infoIcon: { fontSize: 15 },
  infoText: { fontSize: 14, color: Colors.text, flex: 1 },
  salaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 6, borderTopWidth: 0.5, borderColor: Colors.border },
  salaryLabel: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  salaryValue: { fontSize: 14, fontWeight: '600', color: Colors.green },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.border },
  tagText: { fontSize: 12, color: Colors.textSecondary },
  promptBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 11 },
  promptLabel: { fontSize: 10, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  promptAnswer: { fontSize: 13, color: Colors.text, lineHeight: 19 },
})
