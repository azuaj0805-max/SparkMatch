import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Image, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLikesReceived } from '../../hooks/useDiscover'
import { useAuth } from '../../hooks/useAuth'
import { usePhotoUpload } from '../../hooks/usePhotoUpload'
import { Avatar } from '../../components/Avatar'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { SALARY_BADGE_LABELS, LOOKING_FOR_LABELS } from '../../types'

export function LikesScreen() {
  const { currentLike, currentIndex, count, loading, nextLike, prevLike } = useLikesReceived()
  const PREMIUM = false

  if (loading) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Likes You</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Likes You</Text>
        <Text style={styles.headerCount}>{count} people</Text>
      </View>

      {!PREMIUM && (
        <View style={styles.upgradeBanner}>
          <Text style={styles.upgradeTitle}>See who likes you</Text>
          <Text style={styles.upgradeSub}>
            Upgrade to Premium to see all {count} people — including salary and career details.
          </Text>
          <TouchableOpacity style={[GlobalStyles.primaryButton, { width: '100%' }]}>
            <Text style={GlobalStyles.primaryButtonText}>Upgrade — $12/mo</Text>
          </TouchableOpacity>
        </View>
      )}

      {count === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>💛</Text>
          <Text style={styles.emptyTitle}>No likes yet</Text>
          <Text style={styles.emptySub}>When someone likes you they'll appear here.</Text>
        </View>
      ) : (
        <View style={styles.queueWrap}>
          <Text style={styles.queueLabel}>{currentIndex + 1} of {count}</Text>
          <View style={styles.likeTile}>
            <View style={[styles.likeTileInner, !PREMIUM && styles.blurred]}>
              <Avatar
                name={currentLike?.liker?.first_name ?? '?'}
                photo={PREMIUM ? currentLike?.liker?.photos?.[0] : null}
                size={120}
              />
            </View>
            <View style={styles.likeInfo}>
              <Text style={styles.likeName}>
                {PREMIUM ? `${currentLike?.liker?.first_name}, ${currentLike?.liker?.age}` : '• • •'}
              </Text>
              {PREMIUM && currentLike?.liker?.job_title && (
                <Text style={styles.likeJob}>{currentLike.liker.job_title}</Text>
              )}
              {PREMIUM && currentLike?.liker?.salary_range && (
                <View style={styles.salaryBadge}>
                  <Text style={styles.salaryBadgeText}>
                    💰 {SALARY_BADGE_LABELS[currentLike.liker.salary_range as keyof typeof SALARY_BADGE_LABELS]}
                  </Text>
                </View>
              )}
              {currentLike?.message && PREMIUM && (
                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>"{currentLike.message}"</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
              onPress={prevLike}
              disabled={currentIndex === 0}
            >
              <Text style={styles.navBtnText}>← Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, currentIndex === count - 1 && styles.navBtnDisabled]}
              onPress={nextLike}
              disabled={currentIndex === count - 1}
            >
              <Text style={styles.navBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export function ProfileScreen() {
  const { profile, signOut } = useAuth()
  const { pickAndUploadPhoto, deletePhoto, uploading } = usePhotoUpload()

  if (!profile) return null

  const salaryLabel = profile.salary_range ? SALARY_BADGE_LABELS[profile.salary_range] : null
  const lookingForLabel = profile.looking_for ? LOOKING_FOR_LABELS[profile.looking_for] : null

  async function handleAddPhoto() {
    await pickAndUploadPhoto()
  }

  async function handleDeletePhoto(url: string) {
    Alert.alert('Remove photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deletePhoto(url) },
    ])
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.profileScroll}>

        {/* Hero */}
        <View style={styles.profileHero}>
          <Avatar name={profile.first_name} photo={profile.photos?.[0]} size={72} />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile.first_name}, {profile.age}</Text>
            <Text style={styles.profileSub}>{profile.city}</Text>
          </View>
        </View>

        {/* Photos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Photos</Text>
          <View style={styles.photoGrid}>
            {(profile.photos ?? []).map((url, i) => (
              <TouchableOpacity
                key={i}
                style={styles.photoThumb}
                onLongPress={() => handleDeletePhoto(url)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: url }} style={styles.photoThumbImg} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.photoDelete}
                  onPress={() => handleDeletePhoto(url)}
                >
                  <Text style={styles.photoDeleteText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            {(profile.photos ?? []).length < 6 && (
              <TouchableOpacity
                style={styles.photoAdd}
                onPress={handleAddPhoto}
                disabled={uploading}
                activeOpacity={0.7}
              >
                {uploading
                  ? <ActivityIndicator color={Colors.primary} />
                  : <Text style={styles.photoAddIcon}>+</Text>
                }
                <Text style={styles.photoAddText}>Add photo</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.photoHint}>Long press a photo to remove it. Up to 6 photos.</Text>
        </View>

        {/* Career */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Career</Text>
          {profile.job_title && <InfoRow icon="💼" text={`${profile.job_title}${profile.company ? ` · ${profile.company}` : ''}`} />}
          {profile.industry && <InfoRow icon="🏢" text={profile.industry} />}
          {salaryLabel && (
            <View style={styles.salaryRow}>
              <Text style={styles.salaryRowLabel}>💰  Salary range</Text>
              <Text style={styles.salaryValue}>{salaryLabel}</Text>
            </View>
          )}
        </View>

        {/* Dating preferences */}
        {lookingForLabel && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dating preferences</Text>
            <InfoRow icon="🎯" text={lookingForLabel} />
            {profile.relationship_style?.length > 0 && <InfoRow icon="💑" text={profile.relationship_style.join(', ')} />}
            {profile.orientation?.length > 0 && profile.show_orientation && <InfoRow icon="🌈" text={profile.orientation.join(', ')} />}
          </View>
        )}

        {/* Work style */}
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

        {/* Prompts */}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  upgradeBanner: { margin: 16, padding: 16, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface, gap: 10 },
  upgradeTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  upgradeSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  queueWrap: { flex: 1, padding: Spacing.xl, alignItems: 'center' },
  queueLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  likeTile: { width: '100%', backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden', marginBottom: 16 },
  likeTileInner: { height: 280, alignItems: 'center', justifyContent: 'center' },
  blurred: { opacity: 0.12 },
  likeInfo: { padding: Spacing.lg },
  likeName: { fontSize: 20, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  likeJob: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
  salaryBadge: { alignSelf: 'flex-start', backgroundColor: Colors.greenLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.greenBorder, marginBottom: 8 },
  salaryBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.green },
  messageBox: { backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.md, marginTop: 4 },
  messageText: { fontSize: 13, color: Colors.primaryDark, fontStyle: 'italic', lineHeight: 19 },
  navRow: { flexDirection: 'row', gap: 12, width: '100%' },
  navBtn: { flex: 1, paddingVertical: 12, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center' },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  profileScroll: { padding: Spacing.xl, gap: 12, paddingBottom: 100 },
  profileHero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  profileName: { fontSize: 20, fontWeight: '600', color: Colors.text },
  profileSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  card: { backgroundColor: Colors.background, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.lg },
  cardTitle: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  photoThumb: { width: 90, height: 120, borderRadius: Radius.md, overflow: 'hidden', position: 'relative' },
  photoThumbImg: { width: '100%', height: '100%' },
  photoDelete: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  photoDeleteText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  photoAdd: { width: 90, height: 120, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoAddIcon: { fontSize: 24, color: Colors.textTertiary },
  photoAddText: { fontSize: 11, color: Colors.textTertiary },
  photoHint: { fontSize: 11, color: Colors.textTertiary, marginTop: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  infoIcon: { fontSize: 15 },
  infoText: { fontSize: 14, color: Colors.text, flex: 1 },
  salaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 6, borderTopWidth: 0.5, borderColor: Colors.border },
  salaryRowLabel: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  salaryValue: { fontSize: 14, fontWeight: '600', color: Colors.green },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.border },
  tagText: { fontSize: 12, color: Colors.textSecondary },
  promptBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 11 },
  promptLabel: { fontSize: 10, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  promptAnswer: { fontSize: 13, color: Colors.text, lineHeight: 19 },
})
