import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ActivityIndicator, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as Haptics from 'expo-haptics'
import { InfoRow } from '../../components/InfoRow'
import { Avatar } from '../../components/Avatar'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { SALARY_BADGE_LABELS, LOOKING_FOR_LABELS, Profile } from '../../types'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const { width } = Dimensions.get('window')

const REPORT_REASONS = [
  'Inappropriate photos',
  'Fake profile / spam',
  'Offensive messages',
  'Harassment',
  'Underage user',
  'Other',
]

export function ViewProfileScreen({ route }: any) {
  const { profile, matchId } = route.params as { profile: Profile; matchId?: string }
  const navigation = useNavigation<any>()
  const { session } = useAuth()
  const [menuVisible, setMenuVisible] = useState(false)
  const [reportVisible, setReportVisible] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [reportNote, setReportNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const salaryLabel = profile.salary_range ? SALARY_BADGE_LABELS[profile.salary_range] : null
  const lookingForLabel = profile.looking_for ? LOOKING_FOR_LABELS[profile.looking_for] : null
  const hasPhoto = profile.photos?.length > 0

  async function handleBlock() {
    setMenuVisible(false)
    Alert.alert(
      `Block ${profile.first_name}?`,
      `They won't be able to see your profile or message you.`,
      [
        { text: 'Cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('likes').upsert({
              liker_id: session?.user.id,
              liked_id: profile.id,
              passed: true,
              message: null,
            })
            Alert.alert('Blocked', `${profile.first_name} has been blocked.`, [
              { text: 'OK', onPress: () => navigation.goBack() }
            ])
          }
        }
      ]
    )
  }

  async function handleUnmatch() {
    setMenuVisible(false)
    Alert.alert(
      `Unmatch ${profile.first_name}?`,
      'This will remove your match and delete your conversation. This cannot be undone.',
      [
        { text: 'Cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: async () => {
            if (matchId) {
              await supabase.from('messages').delete().eq('match_id', matchId)
              await supabase.from('matches').delete().eq('id', matchId)
            } else {
              const { data } = await supabase
                .from('matches')
                .select('id')
                .or(`and(user1_id.eq.${session?.user.id},user2_id.eq.${profile.id}),and(user1_id.eq.${profile.id},user2_id.eq.${session?.user.id})`)
                .single()
              if (data) {
                await supabase.from('messages').delete().eq('match_id', data.id)
                await supabase.from('matches').delete().eq('id', data.id)
              }
            }
            Alert.alert('Unmatched', `You have unmatched with ${profile.first_name}.`, [
              { text: 'OK', onPress: () => navigation.navigate('Matches') }
            ])
          }
        }
      ]
    )
  }

  async function handleSubmitReport() {
    if (!selectedReason) { Alert.alert('Please select a reason'); return }
    setSubmitting(true)
    await supabase.from('reports').insert({
      reporter_id: session?.user.id,
      reported_id: profile.id,
      reason: selectedReason,
      note: reportNote,
    })
    setSubmitting(false)
    setReportVisible(false)
    Alert.alert('Report submitted', "Thank you for keeping Meridian safe. We'll review this within 24 hours.")
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
      {/* Floating header */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.goBack() }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMenuVisible(true) }}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Full width photo */}
        <View style={styles.photoWrap}>
          {hasPhoto ? (
            <Image
              source={{ uri: profile.photos[0] }}
              style={styles.photo}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Avatar name={profile.first_name} size={120} />
            </View>
          )}
          <View style={styles.photoOverlay}>
            <View>
              <Text style={styles.photoName}>{profile.first_name}, {profile.age}</Text>
              <View style={styles.photoMeta}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.photoMetaText}>{profile.city}</Text>
              </View>
            </View>
            {salaryLabel && (
              <View style={styles.salaryBadge}>
                <Ionicons name="trending-up-outline" size={12} color={Colors.green} />
                <Text style={styles.salaryBadgeText}>{salaryLabel}</Text>
              </View>
            )}
          </View>
          {profile.salary_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.blue} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Career */}
        {(profile.job_title || profile.industry) && (
          <View style={styles.block}>
            <View style={styles.blockIcon}>
              <Ionicons name="briefcase-outline" size={16} color={Colors.primary} />
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

        {/* Looking for */}
        {lookingForLabel && (
          <View style={styles.block}>
            <View style={styles.blockIcon}>
              <Ionicons name="flag-outline" size={16} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.blockTitle}>{lookingForLabel}</Text>
              {profile.relationship_style?.length > 0 && (
                <Text style={styles.blockSub}>{profile.relationship_style.join(', ')}</Text>
              )}
            </View>
          </View>
        )}

        {/* Work style tags */}
        {profile.work_style?.length > 0 && (
          <View style={styles.tagBlock}>
            {profile.work_style.map(w => (
              <View key={w} style={styles.tag}>
                <Text style={styles.tagText}>{w}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Prompts */}
        {profile.prompts?.map((p, i) => (
          <View key={i} style={styles.promptBlock}>
            <Text style={styles.promptQ}>{p.question}</Text>
            <Text style={styles.promptA}>{p.answer}</Text>
          </View>
        ))}

        {/* Lifestyle */}
        {(profile.has_kids || profile.drinking || profile.smoking || profile.religion) && (
          <View style={styles.lifestyleBlock}>
            <Text style={styles.sectionLabel}>Lifestyle</Text>
            {profile.has_kids && <InfoRow icon="people-outline" text={profile.has_kids} />}
            {profile.drinking && <InfoRow icon="wine-outline" text={`Drinking: ${profile.drinking}`} />}
            {profile.smoking && <InfoRow icon="flame-outline" text={`Smoking: ${profile.smoking}`} />}
            {profile.religion && <InfoRow icon="heart-circle-outline" text={profile.religion} />}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Options menu */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.menuOverlay} onPress={() => setMenuVisible(false)} activeOpacity={1}>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Options</Text>
            {matchId && (
              <TouchableOpacity style={styles.menuItem} onPress={handleUnmatch}>
                <Ionicons name="heart-dislike-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.menuItemText}>Unmatch {profile.first_name}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); setReportVisible(true) }}>
              <Ionicons name="flag-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Report {profile.first_name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleBlock}>
              <Ionicons name="ban-outline" size={20} color={Colors.danger} />
              <Text style={[styles.menuItemText, { color: Colors.danger }]}>Block {profile.first_name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setMenuVisible(false)}>
              <Text style={[styles.menuItemText, { color: Colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report modal */}
      <Modal visible={reportVisible} transparent animationType="slide">
        <View style={styles.reportOverlay}>
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>Report {profile.first_name}</Text>
            <Text style={styles.reportSub}>Why are you reporting this profile?</Text>
            {REPORT_REASONS.map(reason => (
              <TouchableOpacity
                key={reason}
                style={[styles.reasonRow, selectedReason === reason && styles.reasonRowOn]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextOn]}>{reason}</Text>
                {selectedReason === reason && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
            <TextInput
              style={styles.reportInput}
              placeholder="Additional details (optional)"
              placeholderTextColor={Colors.textTertiary}
              value={reportNote}
              onChangeText={setReportNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[GlobalStyles.primaryButton, { marginTop: 12 }]}
              onPress={handleSubmitReport}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={GlobalStyles.primaryButtonText}>Submit report</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setReportVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  floatingHeader: { position: 'absolute', top: 52, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg },
  floatingBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 60 },
  photoWrap: { width: '100%', height: width * 1.2, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { width: '100%', height: '100%', backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.xl, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.35)' },
  photoName: { fontSize: 28, fontFamily: 'DMSans_700Bold', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  photoMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  photoMetaText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  salaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.greenLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.greenBorder },
  salaryBadgeText: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: Colors.green },
  verifiedBadge: { position: 'absolute', top: 60, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.blueLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  verifiedText: { fontSize: 11, color: Colors.blue, fontFamily: 'DMSans_600SemiBold' },
  block: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.lg, borderBottomWidth: 1, borderColor: Colors.border },
  blockIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  blockTitle: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: Colors.text },
  blockSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  tagBlock: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: Spacing.lg, borderBottomWidth: 1, borderColor: Colors.border },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.primaryLight },
  tagText: { fontSize: 13, color: Colors.primary, fontFamily: 'DMSans_500Medium' },
  promptBlock: { padding: Spacing.lg, borderBottomWidth: 1, borderColor: Colors.border, gap: 6 },
  promptQ: { fontSize: 12, fontFamily: 'DMSans_700Bold', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6 },
  promptA: { fontSize: 16, color: Colors.text, lineHeight: 22, fontFamily: 'DMSans_500Medium' },
  lifestyleBlock: { padding: Spacing.lg, gap: 4 },
  sectionLabel: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  menuCard: { backgroundColor: Colors.background, borderRadius: 20, margin: 16, padding: 8, paddingBottom: 24 },
  menuTitle: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.textTertiary, textAlign: 'center', padding: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 0.5, borderColor: Colors.border },
  menuItemText: { fontSize: 16, color: Colors.text },
  reportOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  reportCard: { backgroundColor: Colors.background, borderRadius: 20, padding: 20, paddingBottom: 40 },
  reportTitle: { fontSize: 18, fontFamily: 'DMSans_700Bold', color: Colors.text, marginBottom: 6 },
  reportSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 7 },
  reasonRowOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  reasonText: { fontSize: 14, color: Colors.text },
  reasonTextOn: { color: Colors.primaryDark, fontFamily: 'DMSans_500Medium' },
  reportInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.text, height: 80, marginTop: 8 },
  cancelBtn: { alignItems: 'center', marginTop: 12, padding: 10 },
  cancelText: { fontSize: 14, color: Colors.textSecondary },
})
