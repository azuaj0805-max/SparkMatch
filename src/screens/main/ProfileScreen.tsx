import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Image, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useNavigation } from "@react-navigation/native"
import { useLikesReceived } from '../../hooks/useDiscover'
import { useAuth } from '../../hooks/useAuth'
import { Avatar } from '../../components/Avatar'
import { ProfileCompletion } from "../../components/ProfileCompletion"
import { InfoRow } from '../../components/InfoRow'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { SALARY_BADGE_LABELS, LOOKING_FOR_LABELS } from '../../types'
import { supabase } from '../../lib/supabase'

export function LikesScreen() {
  const { currentLike, currentIndex, count, loading, nextLike, prevLike } = useLikesReceived()
  const navigation = useNavigation<any>()

  if (loading) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Likes You</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Likes You</Text>
        </View>
        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeNum}>{count}</Text>
            <Text style={styles.countBadgeLabel}>people</Text>
          </View>
        )}
      </View>

      {count === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="heart-outline" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No likes yet</Text>
          <Text style={styles.emptySub}>When someone likes your profile they'll appear here.</Text>
        </View>
      ) : (
        <View style={styles.queueWrap}>
          <Text style={styles.queueLabel}>{currentIndex + 1} of {count}</Text>

          <TouchableOpacity style={styles.likeTile} onPress={() => currentLike?.liker && navigation.navigate("ViewProfile", { profile: currentLike.liker })} activeOpacity={0.85}>
            <View style={styles.likeTilePhoto}>
              <Avatar
                name={currentLike?.liker?.first_name ?? '?'}
                photo={currentLike?.liker?.photos?.[0]}
                size={130}
              />
            </View>
            <View style={styles.likeInfo}>
              <Text style={styles.likeName}>
                {`${currentLike?.liker?.first_name}, ${currentLike?.liker?.age}`}
              </Text>
              {currentLike?.liker?.job_title && (
                <View style={styles.likeMetaRow}>
                  <Ionicons name="briefcase-outline" size={13} color={Colors.textSecondary} />
                  <Text style={styles.likeJob}>
                    {currentLike.liker.job_title}
                    {currentLike.liker.company ? ` · ${currentLike.liker.company}` : ''}
                  </Text>
                </View>
              )}
              {currentLike?.liker?.city && (
                <View style={styles.likeMetaRow}>
                  <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                  <Text style={styles.likeJob}>{currentLike.liker.city}</Text>
                </View>
              )}
              {currentLike?.liker?.salary_range && (
                <View style={styles.likeSalary}>
                  <Ionicons name="trending-up-outline" size={12} color={Colors.green} />
                  <Text style={styles.likeSalaryText}>
                    {SALARY_BADGE_LABELS[currentLike.liker.salary_range as keyof typeof SALARY_BADGE_LABELS]}
                  </Text>
                </View>
              )}
              {currentLike?.message && (
                <View style={styles.likeMessage}>
                  <Ionicons name="chatbubble-outline" size={12} color={Colors.primary} />
                  <Text style={styles.likeMessageText}>"{currentLike.message}"</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.matchLimitNote}>
            <Ionicons name="information-circle-outline" size={15} color={Colors.textTertiary} />
            <Text style={styles.matchLimitText}>You can have up to 5 active matches at a time</Text>
          </View>

          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); prevLike() }}
              disabled={currentIndex === 0}
            >
              <Ionicons name="arrow-back" size={16} color={Colors.text} />
              <Text style={styles.navBtnText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnPrimary, currentIndex === count - 1 && styles.navBtnDisabled]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); nextLike() }}
              disabled={currentIndex === count - 1}
            >
              <Text style={[styles.navBtnText, styles.navBtnPrimaryText]}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export function ProfileScreen() {
  const { profile, signOut } = useAuth()
  const navigation = useNavigation<any>()

  if (!profile) return null

  const salaryLabel = profile.salary_range ? SALARY_BADGE_LABELS[profile.salary_range] : null
  const lookingForLabel = profile.looking_for ? LOOKING_FOR_LABELS[profile.looking_for] : null

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
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('EditProfile') }}
        >
          <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.profileScroll}>
        <View style={styles.profileHero}>
          <Avatar name={profile.first_name} photo={profile.photos?.[0]} size={76} />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile.first_name}, {profile.age}</Text>
            <View style={styles.profileMetaRow}>
              <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
              <Text style={styles.profileSub}>{profile.city}</Text>
            </View>
            {salaryLabel && (
              <View style={styles.heroSalary}>
                <Ionicons name="trending-up-outline" size={11} color={Colors.green} />
                <Text style={styles.heroSalaryText}>{salaryLabel}</Text>
              </View>
            )}
          </View>
        </View>

        <ProfileCompletion profile={profile} />

        {(profile.photos ?? []).length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photos</Text>
            <View style={styles.photoGrid}>
              {(profile.photos ?? []).map((url, i) => (
                <View key={i} style={styles.photoThumb}>
                  <Image source={{ uri: url }} style={styles.photoThumbImg} resizeMode="cover" />
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.managePhotosBtn} onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.managePhotosBtnText}>Manage photos</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addPhotosCard} onPress={() => navigation.navigate('EditProfile')}>
            <View style={styles.addPhotosIconWrap}>
              <Ionicons name="camera-outline" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.addPhotosTitle}>Add photos</Text>
            <Text style={styles.addPhotosSub}>Profiles with photos get 10× more likes</Text>
          </TouchableOpacity>
        )}

        {(profile.job_title || profile.industry) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Career</Text>
            {profile.job_title && <InfoRow icon="briefcase-outline" text={`${profile.job_title}${profile.company ? ` · ${profile.company}` : ''}`} />}
            {profile.industry && <InfoRow icon="business-outline" text={profile.industry} />}
          </View>
        )}

        {lookingForLabel && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dating preferences</Text>
            <InfoRow icon="flag-outline" text={lookingForLabel} />
            {profile.relationship_style?.length > 0 && <InfoRow icon="heart-outline" text={profile.relationship_style.join(', ')} />}
            {profile.orientation?.length > 0 && profile.show_orientation && <InfoRow icon="rainbow-outline" text={profile.orientation.join(', ')} />}
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <AccountRow icon="pencil-outline" label="Edit profile & photos" onPress={() => navigation.navigate('EditProfile')} />
          <AccountRow icon="document-text-outline" label="Privacy Policy" onPress={() => navigation.navigate('Legal', { type: 'privacy' })} />
          <AccountRow icon="reader-outline" label="Terms of Service" onPress={() => navigation.navigate('Legal', { type: 'terms' })} />
          <AccountRow icon="ban-outline" label="Block or report someone" onPress={() => Alert.alert('Block or report', 'Open a match, tap their name, then tap ⋯ to block or report.')} />
          <AccountRow icon="log-out-outline" label="Sign out" onPress={() => Alert.alert('Sign out', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Sign out', style: 'destructive', onPress: signOut }])} />
          <AccountRow icon="trash-outline" label="Delete account" onPress={handleDeleteAccount} danger last />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function AccountRow({ icon, label, onPress, danger, last }: { icon: string; label: string; onPress: () => void; danger?: boolean; last?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.accountRow, last && { borderBottomWidth: 0 }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress() }}
      activeOpacity={0.7}
    >
      <View style={styles.accountRowLeft}>
        <Ionicons name={icon as any} size={18} color={danger ? Colors.danger : Colors.textSecondary} />
        <Text style={[styles.accountRowText, danger && { color: Colors.danger }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.borderDark} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: 14, borderBottomWidth: 1, borderColor: Colors.border },
  headerEyebrow: { fontSize: 11, fontFamily: "DMSans_700Bold", color: Colors.primary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { fontSize: 28, fontFamily: "DMSans_700Bold", color: Colors.text, letterSpacing: -0.5 },
  countBadge: { alignItems: 'center', backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.lg },
  countBadgeNum: { fontSize: 20, fontFamily: "DMSans_700Bold", color: Colors.primary },
  countBadgeLabel: { fontSize: 10, color: Colors.primary, fontFamily: "DMSans_500Medium", textTransform: 'uppercase', letterSpacing: 0.5 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: "DMSans_700Bold", color: Colors.text, marginBottom: 8, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  queueWrap: { flex: 1, padding: Spacing.xl, gap: 14 },
  queueLabel: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_500Medium", textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  likeTile: { backgroundColor: Colors.background, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  likeTilePhoto: { height: 300, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  likeInfo: { padding: Spacing.lg, gap: 8 },
  likeName: { fontSize: 22, fontFamily: "DMSans_700Bold", color: Colors.text, letterSpacing: -0.3 },
  likeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeJob: { fontSize: 14, color: Colors.textSecondary },
  likeSalary: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: Colors.greenLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.greenBorder },
  likeSalaryText: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: Colors.green },
  likeMessage: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: 12 },
  likeMessageText: { fontSize: 13, color: Colors.primary, fontStyle: 'italic', lineHeight: 19, flex: 1 },
  matchLimitNote: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  matchLimitText: { fontSize: 12, color: Colors.textTertiary, flex: 1 },
  navRow: { flexDirection: 'row', gap: 10 },
  navBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  navBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { fontSize: 14, color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  navBtnPrimaryText: { color: '#fff' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
  editBtnText: { fontSize: 13, fontFamily: "DMSans_600SemiBold", color: Colors.primary },
  profileScroll: { padding: Spacing.xl, gap: 12, paddingBottom: 100 },
  profileHero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border },
  profileName: { fontSize: 20, fontFamily: "DMSans_700Bold", color: Colors.text, letterSpacing: -0.3 },
  profileMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  profileSub: { fontSize: 13, color: Colors.textTertiary },
  heroSalary: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: Colors.greenLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.greenBorder, marginTop: 6 },
  heroSalaryText: { fontSize: 11, fontFamily: "DMSans_600SemiBold", color: Colors.green },
  card: { backgroundColor: Colors.background, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg },
  cardTitle: { fontSize: 11, fontFamily: "DMSans_700Bold", color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  photoThumb: { width: 90, height: 120, borderRadius: Radius.md, overflow: 'hidden' },
  photoThumbImg: { width: '100%', height: '100%' },
  managePhotosBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  managePhotosBtnText: { fontSize: 13, color: Colors.primary, fontFamily: "DMSans_600SemiBold" },
  addPhotosCard: { backgroundColor: Colors.primaryLight, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', gap: 6 },
  addPhotosIconWrap: { width: 60, height: 60, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  addPhotosTitle: { fontSize: 16, fontFamily: "DMSans_700Bold", color: Colors.primary },
  addPhotosSub: { fontSize: 13, color: Colors.primaryDark, textAlign: 'center' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.primaryLight },
  tagText: { fontSize: 12, color: Colors.primary, fontFamily: "DMSans_500Medium" },
  promptBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 12, borderWidth: 1, borderColor: Colors.border },
  promptLabel: { fontSize: 10, fontFamily: "DMSans_700Bold", color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  promptAnswer: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderColor: Colors.border },
  accountRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountRowText: { fontSize: 14, color: Colors.text, fontFamily: "DMSans_500Medium" },
})
