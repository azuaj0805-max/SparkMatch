import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useDiscover } from '../../hooks/useDiscover'
import { Avatar } from '../../components/Avatar'
import { SkeletonProfileCard } from '../../components/SkeletonCard'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { Profile, SALARY_BADGE_LABELS } from '../../types'

export function DiscoverScreen() {
  const { profiles, loading, likesRemaining, likeProfile, passProfile } = useDiscover()
  const [matchModal, setMatchModal] = useState(false)
  const [commentModal, setCommentModal] = useState<Profile | null>(null)
  const [comment, setComment] = useState('')

  async function handleLike(profile: Profile) {
    if (likesRemaining <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('No likes remaining', 'You have used all 4 likes for today. Come back tomorrow!')
      return
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const result = await likeProfile(profile.id)
    if (result === 'match') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setMatchModal(true)
    }
    if (result === 'conversation_limit') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      Alert.alert('Conversation limit', 'You can only have 4 active conversations at a time.')
    }
  }

  async function handlePass(profile: Profile) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    passProfile(profile.id)
  }

  async function submitComment() {
    if (!commentModal) return
    if (likesRemaining <= 0) {
      Alert.alert('No likes remaining', 'You have used all 4 likes for today.')
      setCommentModal(null)
      return
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const result = await likeProfile(commentModal.id, comment)
    setCommentModal(null)
    setComment('')
    if (result === 'match') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setMatchModal(true)
    }
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Meridian</Text>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>
        <View style={styles.likesCounter}>
          <Text style={styles.likesCounterNum}>{likesRemaining}</Text>
          <Text style={styles.likesCounterLabel}>likes left</Text>
        </View>
      </View>

      {likesRemaining <= 0 && (
        <View style={styles.limitBanner}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.limitText}>You've used all 4 likes today. Come back tomorrow.</Text>
        </View>
      )}

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stack}>
          <SkeletonProfileCard />
        </ScrollView>
      ) : profiles.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="compass-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>You've seen everyone</Text>
          <Text style={styles.emptySub}>Check back later for new profiles in your area.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stack}>
          {profiles.slice(0, 3).map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onLike={() => handleLike(profile)}
              onPass={() => handlePass(profile)}
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
              <Ionicons name="heart" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.matchTitle}>It's a match</Text>
            <Text style={styles.matchSub}>You and this person both expressed interest. Start the conversation.</Text>
            <TouchableOpacity style={styles.matchBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMatchModal(false) }}>
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
        <View style={styles.commentOverlay}>
          <View style={styles.commentCard}>
            <Text style={styles.commentTitle}>Add a note</Text>
            <Text style={styles.commentSub}>What caught your attention? A thoughtful note gets 3× more responses.</Text>
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
      <View style={styles.photoArea}>
        <Avatar name={profile.first_name} photo={profile.photos?.[0]} size={100} />
        {profile.salary_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color={Colors.blue} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.first_name}, {profile.age}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
              <Text style={styles.meta}>{profile.city}{profile.job_title ? `  ·  ${profile.job_title}` : ''}</Text>
            </View>
          </View>
          {salaryLabel && (
            <View style={styles.salaryBadge}>
              <Ionicons name="trending-up-outline" size={12} color={Colors.green} />
              <Text style={styles.salaryBadgeText}>{salaryLabel}</Text>
            </View>
          )}
        </View>

        {(profile.industry || (profile.work_style?.length > 0)) && (
          <View style={styles.tagRow}>
            {profile.industry && <Tag label={profile.industry} />}
            {profile.work_style?.slice(0, 1).map(w => <Tag key={w} label={w} />)}
          </View>
        )}

        {profile.prompts?.map((p, i) => (
          <View key={i} style={styles.promptBox}>
            <Text style={styles.promptLabel}>{p.question}</Text>
            <Text style={styles.promptAnswer}>{p.answer}</Text>
          </View>
        ))}

        {profile.looking_for && profile.looking_for !== 'private' && (
          <View style={styles.goalRow}>
            <Ionicons name="flag-outline" size={13} color={Colors.primary} />
            <Text style={styles.goalText}>
              {profile.looking_for === 'serious' ? 'Looking for something serious'
                : profile.looking_for === 'open' ? 'Open to anything'
                : 'Casual dating'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.passBtn} onPress={onPass} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.likeBtn, likesRemaining <= 0 && styles.likeBtnDisabled]}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.commentBtn} onPress={onComment} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={22} color={Colors.primary} />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: 14, borderBottomWidth: 1, borderColor: Colors.border },
  headerEyebrow: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  likesCounter: { alignItems: 'center', backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.lg },
  likesCounterNum: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  likesCounterLabel: { fontSize: 10, color: Colors.primary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  limitBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, padding: Spacing.md, marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  limitText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  stack: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 90 },
  card: { backgroundColor: Colors.background, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  photoArea: { height: 260, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.blueLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  verifiedText: { fontSize: 11, color: Colors.blue, fontWeight: '600' },
  cardBody: { padding: Spacing.lg, gap: Spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  meta: { fontSize: 13, color: Colors.textTertiary },
  salaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.greenLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.greenBorder },
  salaryBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.green },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.primaryLight },
  tagText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  promptBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 12, borderWidth: 1, borderColor: Colors.border },
  promptLabel: { fontSize: 10, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  promptAnswer: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  goalText: { fontSize: 13, color: Colors.textSecondary },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, padding: Spacing.lg, borderTopWidth: 1, borderColor: Colors.border },
  passBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  likeBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  likeBtnDisabled: { backgroundColor: Colors.borderDark },
  commentBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  matchCard: { backgroundColor: Colors.background, borderRadius: Radius.xxl, padding: 28, alignItems: 'center', width: '100%' },
  matchIconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  matchTitle: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 8, letterSpacing: -0.5 },
  matchSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  matchBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 14, width: '100%', alignItems: 'center' },
  matchBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  keepBtn: { marginTop: 12, padding: 10 },
  keepText: { fontSize: 14, color: Colors.textSecondary },
  commentOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  commentCard: { backgroundColor: Colors.background, borderRadius: Radius.xxl, padding: 24, paddingBottom: 36 },
  commentTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 6, letterSpacing: -0.3 },
  commentSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  commentInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: 14, fontSize: 14, color: Colors.text, height: 90, backgroundColor: Colors.surface, marginBottom: 16 },
})
