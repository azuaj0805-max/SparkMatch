import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Image, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useLikesReceived } from '../../hooks/useDiscover'
import { useAuth } from '../../hooks/useAuth'
import { usePhotoUpload } from '../../hooks/usePhotoUpload'
import { Avatar } from '../../components/Avatar'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { SALARY_BADGE_LABELS, LOOKING_FOR_LABELS } from '../../types'
import { supabase } from '../../lib/supabase'

export function LikesScreen() {
  const { currentLike, currentIndex, count, loading, nextLike, prevLike } = useLikesReceived()
  const PREMIUM = false

  if (loading) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>Meridian</Text>
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
        <View>
          <Text style={styles.headerEyebrow}>Meridian</Text>
          <Text style={styles.headerTitle}>Likes You</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeNum}>{count}</Text>
          <Text style={styles.countBadgeLabel}>people</Text>
        </View>
      </View>

      {!PREMIUM && (
        <View style={styles.upgradeBanner}>
          <View style={styles.upgradeBannerLeft}>
            <Text style={styles.upgradeTitle}>Unlock who likes you</Text>
            <Text style={styles.upgradeSub}>See all {count} people, their salary and career details.</Text>
          </View>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>$12/mo</Text>
          </TouchableOpacity>
        </View>
      )}

      {count === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>No likes yet</Text>
          <Text style={styles.emptySub}>When someone likes your profile they'll appear here.</Text>
        </View>
      ) : (
        <View style={styles.queueWrap}>
          <Text style={styles.queueLabel}>{currentIndex + 1} of {count}</Text>

          <View style={styles.likeTile}>
            <View style={[styles.likeTilePhoto, !PREMIUM && styles.blurred]}>
              <Avatar
                name={currentLike?.liker?.first_name ?? '?'}
                photo={PREMIUM ? currentLike?.liker?.photos?.[0] : null}
                size={130}
              />
            </View>
            <View style={styles.likeInfo}>
              <Text style={styles.likeName}>
                {PREMIUM ? `${currentLike?.liker?.first_name}, ${currentLike?.liker?.age}` : '• • • • •'}
              </Text>
              {PREMIUM && currentLike?.liker?.job_title && (
                <Text style={styles.likeJob}>{currentLike.liker.job_title}{currentLike.liker.company ? ` · ${currentLike.liker.company}` : ''}</Text>
              )}
              {PREMIUM && currentLike?.liker?.salary_range && (
                <View style={styles.likeSalary}>
                  <Text style={styles.likeSalaryText}>
                    💰 {SALARY_BADGE_LABELS[currentLike.liker.salary_range as keyof typeof SALARY_BADGE_LABELS]}
                  </Text>
                </View>
              )}
              {currentLike?.message && PREMIUM && (
                <View style={styles.likeMessage}>
                  <Text style={styles.likeMessageText}>"{currentLike.message}"</Text>
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
              style={[styles.navBtn, styles.navBtnPrimary, currentIndex === count - 1 && styles.navBtnDisabled]}
              onPress={nextLike}
              disabled={currentIndex === count - 1}
            >
              <Text style={[styles.navBtnText, styles.navBtnPrimaryText]}>Next →</Text>
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
  const navigation = useNavigation<any>()

  if (!profile) return null

  const salaryLabel = profile.salary_range ? SALARY_BADGE_LABELS[profile.salary_range] : null
  const lookingForLabel = profile.looking_for ? LOOKING_FOR_LABELS[profile.looking_for] : null

  async function handleDeletePhoto(url: string) {
    Alert.alert('Remove photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deletePhoto(url) },
    ])
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete account',
      'This will permanently delete your profile, matches, and messages. This cannot be undone.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: async () => {
            if (!profile) return
            await supabase.from('messages').delete().eq('sender_id', profile.id)
            await supabase.from('likes').delete().eq('liker_id', profile.id)
            await supabase.from('matches').delete().or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
            await supabase.from('profiles').delete().eq('id', profile.id)
            await supabase.auth.signOut()
          }
        }
      ]
    )
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Meridian</Text>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.profileScroll}>

        {/* Hero */}
        <View style={styles.profileHero}>
          <Avatar name={profile.first_name} photo={profile.photos?.[0]} size={76} />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile.first_name}, {profile.age}</Text>
            <Text style={styles.profileSub}>{profile.city}</Text>
            {salaryLabel && (
              <View style={styles.heroSalary}>
                <Text style={styles.heroSalaryText}>💰 {salaryLabel}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Photos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Photos</Text>
          <View style={styles.photoGrid}>
            {(profile.photos ?? []).map((url, i) => (
              <TouchableOpacity key={i} style={styles.photoThumb} onLongPress={() => handleDeletePhoto(url)} activeOpacity={0.8}>
                <Image source={{ uri: url }} style={styles.photoThumbImg} resizeMode="cover" />
                <TouchableOpacity style={styles.photoDelete} onPress={() => handleDeletePhoto(url)}>
                  <Text style={styles.photoDeleteText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            {(profile.photos ?? []).length < 6 && (
              <TouchableOpacity style={styles.photoAdd} onPress={pickAndUploadPhoto} disabled={uploading} activeOpacity={0.7}>
                {uploading ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.photoAddIcon}>+</Text>}
                <Text style={styles.photoAddText}>Add photo</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.photoHint}>Tap ✕ to remove · Up to 6 photos</Text>
        </View>

        {/* Career */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Career</Text>
          {profile.job_title && <InfoRow icon="💼" text={`${profile.job_title}${profile.company ? ` · ${profile.company}` : ''}`} />}
          {profile.industry && <InfoRow icon="🏢" text={profile.industry} />}
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

        {/* Account */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <TouchableOpacity style={styles.accountRow} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.accountRowText}>✏️  Edit profile</Text>
            <Text style={styles.accountArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accountRow} onPress={() => Alert.alert('Block or report', 'Go to a match or conversation, tap their name to view their profile, then tap ⋯ to block or report.')}>
            <Text style={styles.accountRowText}>🚫  Block or report someone</Text>
            <Text style={styles.accountArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accountRow} onPress={() => Alert.alert('Sign out', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Sign out', style: 'destructive', onPress: signOut }])}>
            <Text style={styles.accountRowText}>🚪  Sign out</Text>
            <Text style={styles.accountArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.accountRow, { borderBottomWidth: 0 }]} onPress={handleDeleteAccount}>
            <Text style={[styles.accountRowText, { color: Colors.danger }]}>🗑️  Delete account</Text>
            <Text style={styles.accountArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: 14, borderBottomWidth: 1, borderColor: Colors.border },
  headerEyebrow: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  countBadge: { alignItems: 'center', backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.lg },
  countBadgeNum: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  countBadgeLabel: { fontSize: 10, color: Colors.primary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, color: Colors.primary, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  upgradeBanner: { margin: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.xl, backgroundColor: Colors.navy, flexDirection: 'row', alignItems: 'center', gap: 12 },
  upgradeBannerLeft: { flex: 1 },
  upgradeTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 3 },
  upgradeSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 17 },
  upgradeBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
  upgradeBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  queueWrap: { flex: 1, padding: Spacing.xl, alignItems: 'center' },
  queueLabel: { fontSize: 12, color: Colors.textTertiary, marginBottom: 16, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  likeTile: { width: '100%', backgroundColor: Colors.background, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 16 },
  likeTilePhoto: { height: 300, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  blurred: { opacity: 0.08 },
  likeInfo: { padding: Spacing.lg, gap: 6 },
  likeName: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  likeJob: { fontSize: 14, color: Colors.textSecondary },
  likeSalary: { alignSelf: 'flex-start', backgroundColor: Colors.greenLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.greenBorder },
  likeSalaryText: { fontSize: 12, fontWeight: '600', color: Colors.green },
  likeMessage: { backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: 12 },
  likeMessageText: { fontSize: 13, color: Colors.primary, fontStyle: 'italic', lineHeight: 19 },
  navRow: { flexDirection: 'row', gap: 10, width: '100%' },
  navBtn: { flex: 1, paddingVertical: 13, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  navBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  navBtnPrimaryText: { color: '#fff' },
  editBtn: { backgroundColor: Colors.primaryLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  editBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  profileScroll: { padding: Spacing.xl, gap: 12, paddingBottom: 100 },
  profileHero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border },
  profileName: { fontSize: 20, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  profileSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  heroSalary: { alignSelf: 'flex-start', backgroundColor: Colors.greenLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.greenBorder, marginTop: 6 },
  heroSalaryText: { fontSize: 11, fontWeight: '600', color: Colors.green },
  card: { backgroundColor: Colors.background, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg },
  cardTitle: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  photoThumb: { width: 90, height: 120, borderRadius: Radius.md, overflow: 'hidden', position: 'relative' },
  photoThumbImg: { width: '100%', height: '100%' },
  photoDelete: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  photoDeleteText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  photoAdd: { width: 90, height: 120, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoAddIcon: { fontSize: 24, color: Colors.textTertiary },
  photoAddText: { fontSize: 11, color: Colors.textTertiary },
  photoHint: { fontSize: 11, color: Colors.textTertiary },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  infoIcon: { fontSize: 15 },
  infoText: { fontSize: 14, color: Colors.text, flex: 1 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.primaryLight },
  tagText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  promptBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 12, borderWidth: 1, borderColor: Colors.border },
  promptLabel: { fontSize: 10, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  promptAnswer: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderColor: Colors.border },
  accountRowText: { fontSize: 14, color: Colors.text },
  accountArrow: { fontSize: 16, color: Colors.textTertiary },
})
