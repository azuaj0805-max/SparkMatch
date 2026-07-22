import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ScrollView, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as Haptics from 'expo-haptics'
import { useDiscover, DiscoverFilters } from '../../hooks/useDiscover'
import { useAuth } from '../../hooks/useAuth'
import { SkeletonProfileCard } from '../../components/SkeletonCard'
import { MatchModal } from '../../components/MatchModal'
import { PressableScale } from '../../components/PressableScale'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { Profile, SALARY_BADGE_LABELS } from '../../types'
import { getDistanceLabel } from '../../lib/distance'

const { width } = Dimensions.get('window')

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
      myProfile?.lat ?? null,
      myProfile?.lng ?? null,
      profile.lat ?? null,
      profile.lng ?? null,
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
      Alert.alert('Match limit reached', 'You can have up to 5 active matches at a time.')
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
        <Text style={styles.headerTitle}>Meridian</Text>
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

      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <SkeletonProfileCard />
        </ScrollView>
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
        <ScrollView
          key={currentProfile.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ProfileCard
            profile={currentProfile}
            distance={getDistance(currentProfile)}
            onLike={() => handleLike(currentProfile)}
            onPass={() => handlePass(currentProfile)}
            onComment={() => setCommentModal(currentProfile)}
            likesRemaining={likesRemaining}
          />
        </ScrollView>
      )}

      {/* Sticky action bar */}
      {currentProfile && !loading && (
        <View style={styles.actionBar}>
          <PressableScale style={styles.passBtn} onPress={() => handlePass(currentProfile)}>
            <Ionicons name="close" size={26} color={Colors.textSecondary} />
          </PressableScale>
          <PressableScale
            style={[styles.likeBtn, likesRemaining <= 0 && styles.likeBtnDisabled]}
            onPress={() => handleLike(currentProfile)}
            disabled={likesRemaining <= 0}
            scale={0.9}
          >
            <Ionicons name="heart" size={30} color="#fff" />
          </PressableScale>
          <PressableScale style={styles.commentBtn} onPress={() => setCommentModal(currentProfile)}>
            <Ionicons name="chatbubble-outline" size={22} color={Colors.primary} />
          </PressableScale>
        </View>
      )}

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
  distance: string
  onLike: () => void
  onPass: () => void
  onComment: () => void
  likesRemaining: number
}) {
  const salaryLabel = profile.salary_range ? SALARY_BADGE_LABELS[profile.salary_range] : null
  const hasPhoto = profile.photos?.length > 0

  return (
    <View style={styles.profileWrap}>

      {/* Hero photo card */}
      <View style={styles.heroCard}>
        <View style={styles.photoWrap}>
          {hasPhoto ? (
            <Image source={{ uri: profile.photos[0] }} style={styles.photo} contentFit="cover" transition={200} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <View style={styles.initials}>
                <Text style={styles.initialsText}>{profile.first_name[0]}</Text>
              </View>
            </View>
          )}
          <View style={styles.photoOverlay}>
            <View style={{ flex: 1 }}>
              <Text style={styles.photoName}>{profile.first_name}, {profile.age}</Text>
              <View style={styles.photoMeta}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.photoMetaText}>{distance}</Text>
              </View>
            </View>
            {salaryLabel && (
              <View style={styles.salaryBadge}>
                <Ionicons name="trending-up-outline" size={12} color={Colors.green} />
                <Text style={styles.salaryBadgeText}>{salaryLabel}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Career below photo in hero card */}
        {(profile.job_title || profile.industry) && (
          <View style={styles.heroInfo}>
            <View style={styles.blockIcon}>
              <Ionicons name="briefcase-outline" size={15} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              {profile.job_title && (
                <Text style={styles.blockTitle}>
                  {profile.job_title}{profile.company ? ` at ${profile.company}` : ''}
                </Text>
              )}
              {profile.industry && <Text style={styles.blockSub}>{profile.industry}</Text>}
            </View>
          </View>
        )}
      </View>

      {/* Prompt cards — one per prompt like Hinge */}
      {profile.prompts?.map((p, i) => (
        <View key={i} style={styles.contentCard}>
          <Text style={styles.promptQ}>{p.question}</Text>
          <Text style={styles.promptA}>{p.answer}</Text>
        </View>
      ))}

      {/* Second photo if available */}
      {profile.photos?.length > 1 && (
        <View style={styles.secondPhotoCard}>
          <Image source={{ uri: profile.photos[1] }} style={styles.secondPhoto} contentFit="cover" transition={200} />
        </View>
      )}

      {/* Work style card */}
      {profile.work_style?.length > 0 && (
        <View style={styles.contentCard}>
          <Text style={styles.contentCardLabel}>Work style</Text>
          <View style={styles.tagWrap}>
            {profile.work_style.map(w => (
              <View key={w} style={styles.tag}>
                <Text style={styles.tagText}>{w}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Looking for card */}
      {profile.looking_for && profile.looking_for !== 'private' && (
        <View style={styles.contentCard}>
          <Text style={styles.contentCardLabel}>Looking for</Text>
          <View style={styles.goalRow}>
            <Ionicons name="flag-outline" size={16} color={Colors.primary} />
            <Text style={styles.goalText}>
              {profile.looking_for === 'serious' ? 'Something serious'
                : profile.looking_for === 'open' ? 'Open to anything'
                : 'Casual dating'}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom padding for action bar */}
      <View style={{ height: 100 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: 14, borderBottomWidth: 1, borderColor: Colors.border },
  headerTitle: { fontSize: 20, fontFamily: 'DMSans_700Bold', color: Colors.text, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  filterBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  filterDot: { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  likesCounter: { alignItems: 'center', backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.lg },
  likesCounterNum: { fontSize: 20, fontFamily: 'DMSans_700Bold', color: Colors.primary },
  likesCounterLabel: { fontSize: 10, color: Colors.primary, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 },
  limitBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, padding: Spacing.md, marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  limitText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 20 },
  profileWrap: { gap: Spacing.md },

  // Hero card
  heroCard: { borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  photoWrap: { width: '100%', height: width * 1.15, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { width: '100%', height: '100%', backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  initials: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 40, fontFamily: 'DMSans_700Bold', color: Colors.primary },
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, paddingBottom: Spacing.xl, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.4)' },
  photoName: { fontSize: 28, fontFamily: 'DMSans_700Bold', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  photoMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  photoMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  salaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.greenLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.greenBorder },
  salaryBadgeText: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: Colors.green },
  heroInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.lg },
  blockIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  blockTitle: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: Colors.text },
  blockSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  // Content cards
  contentCard: { borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, padding: Spacing.lg, gap: 10 },
  contentCardLabel: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  promptQ: { fontSize: 13, fontFamily: 'DMSans_700Bold', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  promptA: { fontSize: 18, color: Colors.text, lineHeight: 26, fontFamily: 'DMSans_500Medium' },

  // Second photo
  secondPhotoCard: { borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, height: width * 1.1 },
  secondPhoto: { width: '100%', height: '100%' },

  // Tags
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.primaryLight },
  tagText: { fontSize: 13, color: Colors.primary, fontFamily: 'DMSans_500Medium' },

  // Goal
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalText: { fontSize: 16, color: Colors.text, fontFamily: 'DMSans_500Medium' },

  // Sticky action bar
  actionBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: Spacing.lg,
    paddingBottom: 28,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  passBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  likeBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  likeBtnDisabled: { backgroundColor: Colors.borderDark },
  commentBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: 'DMSans_700Bold', color: Colors.text, marginBottom: 8, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  adjustBtn: { backgroundColor: Colors.primaryLight, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full },
  adjustBtnText: { fontSize: 14, color: Colors.primary, fontFamily: 'DMSans_600SemiBold' },

  // Modals
  modalOverlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterCard: { backgroundColor: Colors.background, borderRadius: Radius.xxl, padding: 24, paddingBottom: 36 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  filterTitle: { fontSize: 18, fontFamily: 'DMSans_700Bold', color: Colors.text, letterSpacing: -0.3 },
  resetText: { fontSize: 14, color: Colors.primary, fontFamily: 'DMSans_600SemiBold' },
  filterLabel: { fontSize: 12, fontFamily: 'DMSans_700Bold', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filterInputWrap: { flex: 1, gap: 6 },
  filterInputLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'DMSans_500Medium' },
  filterInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: Colors.text, textAlign: 'center' },
  filterSep: { fontSize: 18, color: Colors.textTertiary, marginTop: 20 },
  distanceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  distanceBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  distanceBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  distanceBtnText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'DMSans_500Medium' },
  distanceBtnTextActive: { color: Colors.primary, fontFamily: 'DMSans_700Bold' },
  applyBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  applyBtnText: { color: '#fff', fontSize: 15, fontFamily: 'DMSans_700Bold' },
  cancelFilterBtn: { alignItems: 'center', marginTop: 12, padding: 10 },
  cancelFilterText: { fontSize: 14, color: Colors.textSecondary },
  matchBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 14, width: '100%', alignItems: 'center' },
  matchBtnText: { color: '#fff', fontSize: 15, fontFamily: 'DMSans_700Bold' },
  keepBtn: { marginTop: 12, padding: 10 },
  keepText: { fontSize: 14, color: Colors.textSecondary },
  commentCard: { backgroundColor: Colors.background, borderRadius: Radius.xxl, padding: 24, paddingBottom: 36 },
  commentTitle: { fontSize: 20, fontFamily: 'DMSans_700Bold', color: Colors.text, marginBottom: 6, letterSpacing: -0.3 },
  commentSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  commentInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: 14, fontSize: 14, color: Colors.text, height: 90, backgroundColor: Colors.surface, marginBottom: 16 },
})
