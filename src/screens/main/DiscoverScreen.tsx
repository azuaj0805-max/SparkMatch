import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDiscover } from '../../hooks/useDiscover'
import { Avatar } from '../../components/Avatar'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { Profile, SALARY_BADGE_LABELS } from '../../types'

export function DiscoverScreen() {
  const { profiles, loading, likesRemaining, likeProfile, passProfile } = useDiscover()
  const [matchModal, setMatchModal] = useState(false)
  const [commentModal, setCommentModal] = useState<Profile | null>(null)
  const [comment, setComment] = useState('')

  async function handleLike(profile: Profile) {
    if (likesRemaining <= 0) {
      Alert.alert('No likes remaining', 'You have used all 4 likes for today. Come back tomorrow!')
      return
    }
    const result = await likeProfile(profile.id)
    if (result === 'match') setMatchModal(true)
    if (result === 'conversation_limit') {
      Alert.alert('Conversation limit', 'You can only have 4 active conversations at a time.')
    }
  }

  async function submitComment() {
    if (!commentModal) return
    if (likesRemaining <= 0) {
      Alert.alert('No likes remaining', 'You have used all 4 likes for today.')
      setCommentModal(null)
      return
    }
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meridian</Text>
          <Text style={styles.headerSub}>Discover</Text>
        </View>
        <View style={styles.likesCounter}>
          <Text style={styles.likesCounterNum}>{likesRemaining}</Text>
          <Text style={styles.likesCounterLabel}>likes left</Text>
        </View>
      </View>

      {likesRemaining <= 0 && (
        <View style={styles.limitBanner}>
          <Text style={styles.limitText}>✦  You've used all 4 likes today. Come back tomorrow.</Text>
        </View>
      )}

      {profiles.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>◈</Text>
          <Text style={styles.emptyTitle}>You've seen everyone</Text>
          <Text style={styles.emptySub}>Check back later for new profiles.</Text>
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
              likesRemaining={likesRemaining}
            />
          ))}
        </ScrollView>
      )}

      {/* Match modal */}
      <Modal visible={matchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.matchCard}>
            <View style={styles.matchIconWrap}>
              <Text style={styles.matchIcon}>◈</Text>
            </View>
            <Text style={styles.matchTitle}>It's a match</Text>
            <Text style={styles.matchSub}>You and this person both expressed interest. Start the conversation.</Text>
            <TouchableOpacity style={styles.matchBtn} onPress={() => setMatchModal(false)}>
              <Text style={styles.matchBtnText}>Send a message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keepBtn} onPress={() => setMatchModal(false)}>
              <Text style={styles.keepText}>Keep discovering</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Comment modal */}
      <Modal visible={!!commentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.commentCard}>
            <Text style={styles.commentTitle}>Add a note</Text>
            <Text style={styles.commentSub}>What caught your attention? A note gets 3× more responses.</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Write something thoughtful..."
              placeholderTextColor={Colors.textTertiary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.matchBtn} onPress={submitComment}>
              <Text style={styles.matchBtnText}>Like with note</Text>
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

function ProfileCard({ profile, onLike, onPass, onComment, likesRemaining }: {
  profile: Profile
  onLike: () => void
  onPass: () => void
  onComment: () => void
  likesRemaining: number
}) {
  const salaryLabel = profile.salary_range ? SALARY_BADGE_LABELS[profile.salary_range] : null

  return (
    <View style={styles.card}>
      {/* Photo */}
      <View style={styles.photoArea}>
        <Avatar name={profile.first_name} photo={profile.photos?.[0]} size={100} />
        {profile.salary_verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        {/* Name + salary */}
        <View style={styles.nameRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.first_name}, {profile.age}</Text>
            <Text style={styles.meta}>{profile.city}{profile.job_title ? `  ·  ${profile.job_title}` : ''}</Text>
          </View>
          {salaryLabel && (
            <View style={styles.salaryBadge}>
              <Text style={styles.salaryBadgeText}>{salaryLabel}</Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {(profile.industry || (profile.work_style?.length > 0)) && (
          <View style={styles.tagRow}>
            {profile.industry && <Tag label={profile.industry} />}
            {profile.work_style?.slice(0, 1).map(w => <Tag key={w} label={w} />)}
          </View>
        )}

        {/* Prompts */}
        {profile.prompts?.map((p, i) => (
          <View key={i} style={styles.promptBox}>
            <Text style={styles.promptLabel}>{p.question}</Text>
            <Text style={styles.promptAnswer}>{p.answer}</Text>
          </View>
        ))}

        {/* Looking for */}
        {profile.looking_for && profile.looking_for !== 'private' && (
          <View style={styles.goalRow}>
            <Text style={styles.goalDot}>◦</Text>
            <Text style={styles.goalText}>
              {profile.looking_for === 'serious' ? 'Looking for something serious'
                : profile.looking_for === 'open' ? 'Open to anything'
                : 'Casual dating'}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.passBtn} onPress={onPass} activeOpacity={0.7}>
          <Text style={styles.passIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.likeBtn, likesRemaining <= 0 && styles.likeBtnDisabled]}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <Text style={styles.likeIcon}>♥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.commentBtn} onPress={onComment} activeOpacity={0.7}>
          <Text style={styles.commentIcon}>✎</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary, letterSpacing: 1.5, textTransform: 'uppercase' },
  headerSub: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  likesCounter: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.lg,
  },
  likesCounterNum: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  likesCounterLabel: { fontSize: 10, color: Colors.primary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  limitBanner: { backgroundColor: Colors.surface, padding: Spacing.md, marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  limitText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  stack: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 90 },
  card: { backgroundColor: Colors.background, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  photoArea: { height: 260, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: Colors.blueLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  verifiedText: { fontSize: 11, color: Colors.blue, fontWeight: '600' },
  cardBody: { padding: Spacing.lg, gap: Spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  meta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  salaryBadge: { backgroundColor: Colors.greenLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.greenBorder },
  salaryBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.green },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.primaryLight },
  tagText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  promptBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 12, borderWidth: 1, borderColor: Colors.border },
  promptLabel: { fontSize: 10, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  promptAnswer: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  goalDot: { fontSize: 16, color: Colors.primary },
  goalText: { fontSize: 13, color: Colors.textSecondary },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, padding: Spacing.lg, borderTopWidth: 1, borderColor: Colors.border },
  passBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  passIcon: { fontSize: 18, color: Colors.textSecondary },
  likeBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  likeBtnDisabled: { backgroundColor: Colors.borderDark },
  likeIcon: { fontSize: 26, color: '#fff' },
  commentBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  commentIcon: { fontSize: 20, color: Colors.primary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, color: Colors.primary, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  matchCard: { backgroundColor: Colors.background, borderRadius: Radius.xxl, padding: 28, alignItems: 'center', width: '100%' },
  matchIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  matchIcon: { fontSize: 28, color: Colors.primary },
  matchTitle: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 8, letterSpacing: -0.3 },
  matchSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  matchBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 14, width: '100%', alignItems: 'center' },
  matchBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  keepBtn: { marginTop: 12, padding: 10 },
  keepText: { fontSize: 14, color: Colors.textSecondary },
  commentCard: { backgroundColor: Colors.background, borderRadius: Radius.xxl, padding: 24, width: '100%' },
  commentTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  commentSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  commentInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: 14, fontSize: 14, color: Colors.text, height: 90, backgroundColor: Colors.surface },
})
