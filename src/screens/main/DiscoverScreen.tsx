import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useDiscover, DiscoverFilters } from '../../hooks/useDiscover'
import { useAuth } from '../../hooks/useAuth'
import { Avatar } from '../../components/Avatar'
import { SkeletonProfileCard } from '../../components/SkeletonCard'
import { MatchModal } from '../../components/MatchModal'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { Profile, SALARY_BADGE_LABELS } from '../../types'
import { getDistanceMiles, formatDistance, getDistanceLabel } from '../../lib/distance'

export function DiscoverScreen() {
  const { profiles, loading, likesRemaining, filters, setFilters, likeProfile, passProfile } = useDiscover()
  const { profile: myProfile } = useAuth()
  const [matchModal, setMatchModal] = useState(false)
  const [commentModal, setCommentModal] = useState<Profile | null>(null)
  const [filterModal, setFilterModal] = useState(false)
  const [comment, setComment] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [tempFilters, setTempFilters] = useState<DiscoverFilters>(filters)

  const currentProfile = profiles[currentIndex]

  function getDistance(profile: Profile): string {
    return getDistanceLabel(
      (myProfile as any)?.lat ?? null,
      (myProfile as any)?.lng ?? null,
      (profile as any)?.lat ?? null,
      (profile as any)?.lng ?? null,
      profile.city
    )
  }







  async function handleLike(profile: Profile) {
    if (likesRemaining <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('No likes remaining', 'You have used all 4 likes for today. Come back tomorrow!')
      return
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const result = await likeProfile(profile.id)
    setCurrentIndex(i => i + 1)
    if (result === 'match') setMatchModal(true)
    if (result === 'conversation_limit') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      Alert.alert('Conversation limit', 'You can only have 4 active conversations at a time.')
    }
  }

  async function handlePass(profile: Profile) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await passProfile(profile.id)
    setCurrentIndex(i => i + 1)
  }

  async function submitComment() {
    if (!commentModal) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const result = await likeProfile(commentModal.id, comment)
    setCommentModal(null)
    setComment('')
    setCurrentIndex(i => i + 1)
    if (result === 'match') setMatchModal(true)
  }

  function applyFilters() {
    setFilters(tempFilters)
    setCurrentIndex(0)
    setFilterModal(false)
  }

  const filtersActive = filters.minAge !== 18 || filters.maxAge !== 50 || filters.maxDistance !== 50

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Meridian</Text>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.filterBtn, filtersActive && styles.filterBtnActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTempFilters(filters); setFilterModal(true) }}
          >
            <Ionicons name="options-outline" size={20} color={filtersActive ? Colors.primary : Colors.textSecondary} />
            {filtersActive && <View style={styles.filterDot} />}
          </TouchableOpacity>
          <View style={styles.likesCounter}>
            <Text style={styles.likesCounterNum}>{likesRemaining}</Text>
            <Text style={styles.likesCounterLabel}>likes</Text>
          </View>
        </View>
      </View>

      {likesRemaining <= 0 && (
        <View style={styles.limitBanner}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.limitText}>You've used all 4 likes today. Come back tomorrow.</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <SkeletonProfileCard />
        ) : !currentProfile ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="compass-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>You've seen everyone</Text>
            <Text style={styles.emptySub}>Try adjusting your filters or check back later.</Text>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => setFilterModal(true)}>
              <Text style={styles.adjustBtnText}>Adjust filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ProfileCard
            key={currentProfile.id}
            profile={currentProfile}
            distance={getDistance(currentProfile)}
            onLike={() => handleLike(currentProfile)}
            onPass={() => handlePass(currentProfile)}
            onComment={() => setCommentModal(currentProfile)}
            likesRemaining={likesRemaining}
          />
        )}
      </ScrollView>

      {/* Match modal */}
      <MatchModal
        visible={matchModal}
        onSendMessage={() => setMatchModal(false)}
        onKeepDiscovering={() => setMatchModal(false)}
      />

      {/* Filter modal */}
      <Modal visible={filterModal} transparent animationType="slide">
        <View style={styles.modalOverlayBottom}>
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setTempFilters({ minAge: 18, maxAge: 50, maxDistance: 50 })}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.filterLabel}>Age range</Text>
            <View style={styles.filterRow}>
              <View style={styles.filterInputWrap}>
                <Text style={styles.filterInputLabel}>Min</Text>
                <TextInput
                  style={styles.filterInput}
                  value={String(tempFilters.minAge)}
                  onChangeText={v => setTempFilters(f => ({ ...f, minAge: parseInt(v) || 18 }))}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <Text style={styles.filterSep}>—</Text>
              <View style={styles.filterInputWrap}>
                <Text style={styles.filterInputLabel}>Max</Text>
                <TextInput
                  style={styles.filterInput}
                  value={String(tempFilters.maxAge)}
                  onChangeText={v => setTempFilters(f => ({ ...f, maxAge: parseInt(v) || 50 }))}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>
            <Text style={[styles.filterLabel, { marginTop: Spacing.lg }]}>Maximum distance</Text>
            <View style={styles.distanceOptions}>
              {[5, 10, 25, 50, 100].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.distanceBtn, tempFilters.maxDistance === d && styles.distanceBtnActive]}
                  onPress={() => setTempFilters(f => ({ ...f, maxDistance: d }))}
                >
                  <Text style={[styles.distanceBtnText, tempFilters.maxDistance === d && styles.distanceBtnTextActive]}>
                    {d} mi
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={styles.applyBtnText}>Apply filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelFilterBtn} onPress={() => setFilterModal(false)}>
              <Text style={styles.cancelFilterText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Comment modal */}
      <Modal visible={!!commentModal} transparent animationType="slide">
        <View style={styles.modalOverlayBottom}>
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

function ProfileCard({ profile, distance, onLike, onPass, onComment, likesRemaining }: {
  profile: Profile
  distance: string | null
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
        {(profile as any).salary_verified && (
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
              <Text style={styles.meta}>
                {distance ?? profile.city}
                {profile.job_title ? `  ·  ${profile.job_title}` : ''}
              </Text>
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

        {profile.prompts?.slice(0, 1).map((p, i) => (
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  filterBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  filterDot: { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  likesCounter: { alignItems: 'center', backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.lg },
  likesCounterNum: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  likesCounterLabel: { fontSize: 10, color: Colors.primary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  limitBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, padding: Spacing.md, marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  limitText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
  card: { backgroundColor: Colors.background, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  photoArea: { height: 300, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.blueLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  verifiedText: { fontSize: 11, color: Colors.blue, fontWeight: '600' },
  cardBody: { padding: Spacing.lg, gap: Spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
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
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, padding: Spacing.xl, borderTopWidth: 1, borderColor: Colors.border },
  passBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  likeBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  likeBtnDisabled: { backgroundColor: Colors.borderDark },
  commentBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 40, paddingTop: 80 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  adjustBtn: { backgroundColor: Colors.primaryLight, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full },
  adjustBtnText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  modalOverlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterCard: { backgroundColor: Colors.background, borderRadius: Radius.xxl, padding: 24, paddingBottom: 36 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  filterTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  resetText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  filterLabel: { fontSize: 12, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filterInputWrap: { flex: 1, gap: 6 },
  filterInputLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  filterInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  filterSep: { fontSize: 18, color: Colors.textTertiary, marginTop: 20 },
  distanceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  distanceBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  distanceBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  distanceBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  distanceBtnTextActive: { color: Colors.primary, fontWeight: '700' },
  applyBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  applyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelFilterBtn: { alignItems: 'center', marginTop: 12, padding: 10 },
  cancelFilterText: { fontSize: 14, color: Colors.textSecondary },
  matchBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 14, width: '100%', alignItems: 'center' },
  matchBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  keepBtn: { marginTop: 12, padding: 10 },
  keepText: { fontSize: 14, color: Colors.textSecondary },
  commentCard: { backgroundColor: Colors.background, borderRadius: Radius.xxl, padding: 24, paddingBottom: 36 },
  commentTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 6, letterSpacing: -0.3 },
  commentSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  commentInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: 14, fontSize: 14, color: Colors.text, height: 90, backgroundColor: Colors.surface, marginBottom: 16 },
})
