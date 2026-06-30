import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDiscover } from '../../hooks/useDiscover'
import { Avatar } from '../../components/Avatar'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { Profile, SALARY_BADGE_LABELS } from '../../types'

export function DiscoverScreen() {
  const { profiles, loading, likeProfile, passProfile } = useDiscover()
  const [matchModal, setMatchModal] = useState(false)
  const [commentModal, setCommentModal] = useState<Profile | null>(null)
  const [comment, setComment] = useState('')

  async function handleLike(profile: Profile) {
    const result = await likeProfile(profile.id)
    if (result === 'match') setMatchModal(true)
  }

  async function submitComment() {
    if (!commentModal) return
    const result = await likeProfile(commentModal.id, comment)
    setCommentModal(null)
    setComment('')
    if (result === 'match') setMatchModal(true)
  }

  if (loading) {
    return (
      <SafeAreaView style={[GlobalStyles.safeArea, styles.centered]}>
        <ActivityIndicator color={Colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      {profiles.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✦</Text>
          <Text style={styles.emptyTitle}>You've seen everyone</Text>
          <Text style={styles.emptySub}>Check back later or adjust your filters.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stack}>
          {profiles.slice(0, 3).map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onLike={() => handleLike(profile)}
              onPass={() => passProfile(profile.id)}
              onComment={() => setCommentModal(profile)}
            />
          ))}
        </ScrollView>
      )}

      <Modal visible={matchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.matchCard}>
            <Text style={styles.matchEmoji}>🎉</Text>
            <Text style={styles.matchTitle}>It's a match!</Text>
            <Text style={styles.matchSub}>You both liked each other. Say hello!</Text>
            <TouchableOpacity style={[GlobalStyles.primaryButton, { width: '100%' }]} onPress={() => setMatchModal(false)}>
              <Text style={GlobalStyles.primaryButtonText}>Send a message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keepBtn} onPress={() => setMatchModal(false)}>
              <Text style={styles.keepText}>Keep swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!commentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.commentCard}>
            <Text style={styles.matchTitle}>Add a note</Text>
            <Text style={styles.matchSub}>What caught your eye? Commenting gets 3× more responses.</Text>
            <TextInput
              style={[GlobalStyles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
              placeholder="Write something..."
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity style={[GlobalStyles.primaryButton, { width: '100%', marginTop: 12 }]} onPress={submitComment}>
              <Text style={GlobalStyles.primaryButtonText}>Like with note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keepBtn} onPress={() => setCommentModal(null)}>
              <Text style={styles.keepText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

function ProfileCard({ profile, onLike, onPass, onComment }: {
  profile: Profile
  onLike: () => void
  onPass: () => void
  onComment: () => void
}) {
  const salaryLabel = profile.salary_range ? SALARY_BADGE_LABELS[profile.salary_range] : null

  return (
    <View style={styles.card}>
      <View style={styles.photoArea}>
        <Avatar name={profile.first_name} photo={profile.photos?.[0]} size={110} />
        {profile.salary_verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.first_name}, {profile.age}</Text>
          {salaryLabel && (
            <View style={styles.salaryBadge}>
              <Text style={styles.salaryBadgeText}>💰 {salaryLabel}</Text>
            </View>
          )}
        </View>
        <Text style={styles.meta}>{profile.city}{profile.job_title ? ` · ${profile.job_title}` : ''}</Text>
        <View style={styles.tagRow}>
          {profile.job_title && <Tag label={profile.job_title} color="coral" />}
          {profile.industry && <Tag label={profile.industry} color="blue" />}
          {profile.work_style?.slice(0, 1).map(w => <Tag key={w} label={w} color="purple" />)}
        </View>
        {profile.prompts?.map((p, i) => (
          <View key={i} style={styles.promptBox}>
            <Text style={styles.promptLabel}>{p.question}</Text>
            <Text style={styles.promptAnswer}>{p.answer}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.passBtn} onPress={onPass} activeOpacity={0.7}>
          <Text style={styles.passIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeBtn} onPress={onLike} activeOpacity={0.7}>
          <Text style={styles.likeIcon}>♥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.commentBtn} onPress={onComment} activeOpacity={0.7}>
          <Text style={styles.commentIcon}>💬</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function Tag({ label, color }: { label: string; color: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    coral:  { bg: Colors.primaryLight, text: Colors.primaryDark },
    blue:   { bg: Colors.blueLight,    text: Colors.blue },
    purple: { bg: Colors.purpleLight,  text: Colors.purple },
  }
  const c = map[color] ?? map.coral
  return (
    <View style={[styles.tag, { backgroundColor: c.bg }]}>
      <Text style={[styles.tagText, { color: c.text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: 14, borderBottomWidth: 0.5, borderColor: Colors.border },
  headerTitle: { fontSize: 22, fontWeight: '600', color: Colors.text },
  stack: { padding: 14, gap: 14, paddingBottom: 90 },
  card: { backgroundColor: Colors.background, borderRadius: 16, borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden' },
  photoArea: { height: 280, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: Colors.blueLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  verifiedText: { fontSize: 11, color: Colors.blue, fontWeight: '600' },
  cardBody: { padding: 14 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  name: { fontSize: 20, fontWeight: '600', color: Colors.text, flex: 1 },
  salaryBadge: { backgroundColor: Colors.greenLight, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5, borderColor: Colors.greenBorder },
  salaryBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.green },
  meta: { fontSize: 12, color: Colors.textSecondary, marginBottom: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
  tag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.full },
  tagText: { fontSize: 11, fontWeight: '500' },
  promptBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 11, marginBottom: 8 },
  promptLabel: { fontSize: 10, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  promptAnswer: { fontSize: 13, color: Colors.text, lineHeight: 19 },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, padding: 14, paddingTop: 8 },
  passBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  passIcon: { fontSize: 20, color: Colors.textSecondary },
  likeBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  likeIcon: { fontSize: 26, color: '#fff' },
  commentBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 0.5, borderColor: Colors.blue, alignItems: 'center', justifyContent: 'center' },
  commentIcon: { fontSize: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  matchCard: { backgroundColor: Colors.background, borderRadius: 20, padding: 28, alignItems: 'center', width: '100%' },
  commentCard: { backgroundColor: Colors.background, borderRadius: 20, padding: 24, width: '100%' },
  matchEmoji: { fontSize: 48, marginBottom: 12 },
  matchTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  matchSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  keepBtn: { marginTop: 12, padding: 10 },
  keepText: { fontSize: 13, color: Colors.textSecondary },
})
