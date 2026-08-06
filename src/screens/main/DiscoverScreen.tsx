import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ScrollView, Dimensions, Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useDiscover, DiscoverFilters } from '../../hooks/useDiscover'
import { useAuth } from '../../hooks/useAuth'
import { SkeletonProfileCard } from '../../components/SkeletonCard'
import { MatchModal } from '../../components/MatchModal'
import { PressableScale } from '../../components/PressableScale'
import { PhotoCarousel } from '../../components/PhotoCarousel'
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
  const fadeAnim = React.useRef(new Animated.Value(1)).current

  React.useEffect(() => { setCurrentIndex(0) }, [profiles.length])

  const currentProfile = profiles[currentIndex]

  function animateNext() {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start()
  }

  function getDistance(profile: Profile): string {
    return getDistanceLabel(
      myProfile?.lat ?? null, myProfile?.lng ?? null,
      profile.lat ?? null, profile.lng ?? null,
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
    animateNext()
    const result = await likeProfile(profile.id)
    setCurrentIndex(i => i + 1)
    if (result === 'match') setMatchModal(true)
    if (result === 'conversation_limit') {
      Alert.alert('Match limit reached', 'You can have up to 5 active matches at a time.')
    }
  }

  async function handlePass(profile: Profile) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    animateNext()
    await passProfile(profile.id)
    setCurrentIndex(i => i + 1)
  }

  async function submitComment() {
    if (!commentModal) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    animateNext()
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
    <SafeAreaView style={styles.safeArea}>
      {/* Clean minimal header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meridian</Text>
        <TouchableOpacity
          style={[styles.filterBtn, filtersActive && styles.filterBtnActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTempFilters(filters); setFilterModal(true) }}
        >
          <Ionicons name="options-outline" size={20} color={filtersActive ? Colors.primary : Colors.textSecondary} />
          {filtersActive && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Likes remaining — subtle bar */}
      {likesRemaining <= 0 ? (
        <View style={styles.limitBanner}>
          <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.limitText}>Daily likes used · Come back tomorrow</Text>
        </View>
      ) : (
        <View style={styles.likesBar}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={[styles.likesDot, i < likesRemaining && styles.likesDotActive]} />
          ))}
          <Text style={styles.likesBarText}>{likesRemaining} like{likesRemaining !== 1 ? 's' : ''} left today</Text>
        </View>
      )}

      {/* Card area */}
      {loading ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <SkeletonProfileCard />
        </ScrollView>
      ) : !currentProfile ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="compass-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>You're all caught up</Text>
          <Text style={styles.emptySub}>Check back later for new people near you.</Text>
          <TouchableOpacity style={styles.adjustBtn} onPress={() => setFilterModal(true)}>
            <Text style={styles.adjustBtnText}>Adjust filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.ScrollView
          key={currentProfile.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={{ opacity: fadeAnim }}
        >
          <ProfileCard
            profile={currentProfile}
            distance={getDistance(currentProfile)}
            onLike={() => handleLike(currentProfile)}
            onPass={() => handlePass(currentProfile)}
            onComment={() => setCommentModal(currentProfile)}
            likesRemaining={likesRemaining}
          />
          <View style={{ height: 110 }} />
        </Animated.ScrollView>
      )}

      {/* Sticky action bar — redesigned */}
      {currentProfile && !loading && (
        <View style={styles.actionBar}>
          <PressableScale style={styles.passBtn} onPress={() => handlePass(currentProfile)}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </PressableScale>

          <PressableScale
            style={[styles.likeBtn, likesRemaining <= 0 && styles.likeBtnDisabled]}
            onPress={() => handleLike(currentProfile)}
            disabled={likesRemaining <= 0}
            scale={0.92}
          >
            <Ionicons name="heart" size={26} color="#fff" />
          </PressableScale>

          <PressableScale style={styles.commentBtn} onPress={() => setCommentModal(currentProfile)}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
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
            <View style={styles.filterHandle} />
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
              <Text style={styles.applyBtnText}>Apply</Text>
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
            <View style={styles.filterHandle} />
            <Text style={styles.commentTitle}>Send a note</Text>
            <Text style={styles.commentSub}>Stand out — a thoughtful note gets 3× more responses.</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="What caught your eye?"
              placeholderTextColor={Colors.textTertiary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoFocus
            />
            <TouchableOpacity style={styles.applyBtn} onPress={submitComment}>
              <Text style={styles.applyBtnText}>Like with note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelFilterBtn} onPress={() => setCommentModal(null)}>
              <Text style={styles.cancelFilterText}>Cancel</Text>
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

  return (
    <View style={styles.profileWrap}>
      {/* Hero photo — full bleed, no border radius on top */}
      <View style={styles.heroCard}>
        <PhotoCarousel
          photos={profile.photos ?? []}
          height={width * 1.25}
          name={profile.first_name}
        />
        {/* Name overlay — sits on photo */}
        <View style={styles.photoOverlay}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.photoName}>{profile.first_name}, {profile.age}</Text>
              <Text style={styles.photoLocation}>{distance}</Text>
            </View>
            {salaryLabel && (
              <View style={styles.salaryChip}>
                <Text style={styles.salaryChipText}>{salaryLabel}</Text>
              </View>
            )}
          </View>
          {profile.salary_verified && (
            <View style={styles.verifiedChip}>
              <Ionicons name="shield-checkmark" size={11} color="#fff" />
              <Text style={styles.verifiedChipText}>Verified</Text>
            </View>
          )}
        </View>
      </View>

      {/* Career — clean, no border card */}
      {(profile.job_title || profile.industry) && (
        <View style={styles.infoRow}>
          <Ionicons name="briefcase-outline" size={15} color={Colors.textTertiary} />
          <Text style={styles.infoText}>
            {profile.job_title}{profile.company ? ` · ${profile.company}` : ''}
            {profile.industry ? `  ·  ${profile.industry}` : ''}
          </Text>
        </View>
      )}

      {/* Prompts — the centerpiece */}
      {profile.prompts?.slice(0, 1).map((p, i) => (
        <View key={i} style={styles.promptCard}>
          <Text style={styles.promptQ}>{p.question}</Text>
          <Text style={styles.promptA}>{p.answer}</Text>
        </View>
      ))}

      {/* Second photo */}
      {(profile.photos ?? []).length > 1 && (
        <View style={styles.secondPhoto}>
          <PhotoCarousel
            photos={(profile.photos ?? []).slice(1)}
            height={width * 0.9}
            name={profile.first_name}
          />
        </View>
      )}

      {/* Work style tags — minimal */}
      {profile.work_style?.length > 0 && (
        <View style={styles.tagsRow}>
          {profile.work_style.slice(0, 3).map(w => (
            <View key={w} style={styles.tag}>
              <Text style={styles.tagText}>{w}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Looking for */}
      {profile.looking_for && profile.looking_for !== 'private' && (
        <View style={styles.lookingRow}>
          <Text style={styles.lookingLabel}>Looking for</Text>
          <Text style={styles.lookingValue}>
            {profile.looking_for === 'serious' ? 'Something serious'
              : profile.looking_for === 'open' ? 'Open to anything'
              : 'Casual dating'}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontFamily: 'DMSans_700Bold', color: Colors.navy, letterSpacing: -0.5 },
  filterBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, position: 'relative' },
  filterBtnActive: { backgroundColor: Colors.primaryLight },
  filterDot: { position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },

  // Likes bar
  likesBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8, gap: 6 },
  likesDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  likesDotActive: { backgroundColor: Colors.primary },
  likesBarText: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: Colors.textTertiary, marginLeft: 4 },
  limitBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingBottom: 8 },
  limitText: { fontSize: 12, color: Colors.textTertiary },

  // Scroll
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  // Profile
  profileWrap: { gap: 2 },

  // Hero card
  heroCard: { borderRadius: 20, overflow: 'hidden', position: 'relative' },
  photoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  nameRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  photoName: { fontSize: 30, fontFamily: 'DMSans_700Bold', color: '#fff', letterSpacing: -0.8, lineHeight: 34 },
  photoLocation: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2, fontFamily: 'DMSans_400Regular' },
  salaryChip: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  salaryChipText: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: '#fff' },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 8, backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedChipText: { fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#fff' },

  // Info row
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingVertical: 10 },
  infoText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'DMSans_400Regular', flex: 1 },

  // Prompt card
  promptCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1, marginVertical: 4 },
  promptQ: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.8 },
  promptA: { fontSize: 18, color: Colors.text, lineHeight: 26, fontFamily: 'DMSans_500Medium' },

  // Second photo
  secondPhoto: { borderRadius: 16, overflow: 'hidden', marginVertical: 4 },

  // Tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 2, paddingVertical: 6 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border },
  tagText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'DMSans_400Regular' },

  // Looking for
  lookingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 10, borderTopWidth: 1, borderColor: Colors.border, marginTop: 4 },
  lookingLabel: { fontSize: 12, color: Colors.textTertiary, fontFamily: 'DMSans_500Medium' },
  lookingValue: { fontSize: 14, color: Colors.text, fontFamily: 'DMSans_600SemiBold' },

  // Action bar — redesigned
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 20, paddingVertical: 16, paddingBottom: 28,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  passBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  likeBtn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  likeBtnDisabled: { backgroundColor: Colors.borderDark, shadowOpacity: 0 },
  commentBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontFamily: 'DMSans_700Bold', color: Colors.text, marginBottom: 6, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  adjustBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  adjustBtnText: { fontSize: 14, color: Colors.text, fontFamily: 'DMSans_500Medium' },

  // Modals
  modalOverlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  filterHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  filterCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, paddingBottom: 36 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  filterTitle: { fontSize: 17, fontFamily: 'DMSans_700Bold', color: Colors.text },
  resetText: { fontSize: 14, color: Colors.primary, fontFamily: 'DMSans_600SemiBold' },
  filterLabel: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filterInputWrap: { flex: 1, gap: 6 },
  filterInputLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'DMSans_500Medium' },
  filterInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: Colors.text, textAlign: 'center' },
  filterSep: { fontSize: 18, color: Colors.textTertiary, marginTop: 18 },
  distanceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  distanceBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  distanceBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  distanceBtnText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'DMSans_500Medium' },
  distanceBtnTextActive: { color: Colors.primary, fontFamily: 'DMSans_700Bold' },
  applyBtn: { backgroundColor: Colors.primary, borderRadius: 50, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  applyBtnText: { color: '#fff', fontSize: 15, fontFamily: 'DMSans_700Bold' },
  cancelFilterBtn: { alignItems: 'center', marginTop: 10, padding: 10 },
  cancelFilterText: { fontSize: 14, color: Colors.textSecondary },
  commentCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, paddingBottom: 36 },
  commentTitle: { fontSize: 20, fontFamily: 'DMSans_700Bold', color: Colors.text, marginBottom: 4 },
  commentSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  commentInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 14, fontSize: 15, color: Colors.text, height: 100, backgroundColor: '#FAFAFA', marginBottom: 4, fontFamily: 'DMSans_400Regular' },
})
