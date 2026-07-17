import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Alert, Modal, TextInput, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Avatar } from '../../components/Avatar'
import { InfoRow } from '../../components/InfoRow'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { SALARY_BADGE_LABELS, LOOKING_FOR_LABELS, Profile } from '../../types'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

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
              // Find the match
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
    }).throwOnError().catch(() => {})
    setSubmitting(false)
    setReportVisible(false)
    Alert.alert('Report submitted', 'Thank you for keeping Meridian safe. We\'ll review this within 24 hours.')
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.first_name}</Text>
        <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMenuVisible(true) }} style={styles.menuBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.photoArea}>
          {profile.photos?.[0] ? (
            <Image source={{ uri: profile.photos[0] }} style={styles.photo} resizeMode="cover" />
          ) : (
            <Avatar name={profile.first_name} size={120} />
          )}
          {(profile as any).salary_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.blue} />
              <Text style={styles.verifiedText}>Salary Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.nameSection}>
          <Text style={styles.name}>{profile.first_name}, {profile.age}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.location}>{profile.city}</Text>
          </View>
          {salaryLabel && (
            <View style={styles.salaryBadge}>
              <Ionicons name="trending-up-outline" size={12} color={Colors.green} />
              <Text style={styles.salaryBadgeText}>{salaryLabel}</Text>
            </View>
          )}
        </View>

        {(profile.job_title || profile.industry) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Career</Text>
            {profile.job_title && <InfoRow icon="briefcase-outline" text={`${profile.job_title}${profile.company ? ` · ${profile.company}` : ''}`} />}
            {profile.industry && <InfoRow icon="business-outline" text={profile.industry} />}
          </View>
        )}

        {lookingForLabel && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Looking for</Text>
            <InfoRow icon="flag-outline" text={lookingForLabel} />
            {profile.relationship_style?.length > 0 && <InfoRow icon="heart-outline" text={profile.relationship_style.join(', ')} />}
            {profile.orientation?.length > 0 && (profile as any).show_orientation && <InfoRow icon="rainbow-outline" text={profile.orientation.join(', ')} />}
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

        {((profile as any).drinking || (profile as any).smoking || (profile as any).religion || (profile as any).has_kids) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lifestyle</Text>
            {(profile as any).has_kids && <InfoRow icon="people-outline" text={(profile as any).has_kids} />}
            {(profile as any).drinking && <InfoRow icon="wine-outline" text={`Drinking: ${(profile as any).drinking}`} />}
            {(profile as any).smoking && <InfoRow icon="flame-outline" text={`Smoking: ${(profile as any).smoking}`} />}
            {(profile as any).religion && <InfoRow icon="heart-circle-outline" text={(profile as any).religion} />}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border },
  backBtn: { padding: 4, width: 40 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  menuBtn: { width: 40, alignItems: 'flex-end', padding: 4 },
  scroll: { paddingBottom: 60 },
  photoArea: { height: 340, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  photo: { width: '100%', height: '100%' },
  verifiedBadge: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.blueLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  verifiedText: { fontSize: 12, color: Colors.blue, fontWeight: '600' },
  nameSection: { padding: Spacing.xl, borderBottomWidth: 1, borderColor: Colors.border, gap: 8 },
  name: { fontSize: 26, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 14, color: Colors.textSecondary },
  salaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: Colors.greenLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.greenBorder },
  salaryBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.green },
  card: { margin: Spacing.lg, marginBottom: 0, backgroundColor: Colors.background, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg },
  cardTitle: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.primaryLight },
  tagText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  promptBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 11, borderWidth: 1, borderColor: Colors.border },
  promptLabel: { fontSize: 10, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  promptAnswer: { fontSize: 13, color: Colors.text, lineHeight: 19 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  menuCard: { backgroundColor: Colors.background, borderRadius: 20, margin: 16, padding: 8, paddingBottom: 24 },
  menuTitle: { fontSize: 13, fontWeight: '600', color: Colors.textTertiary, textAlign: 'center', padding: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 0.5, borderColor: Colors.border },
  menuItemText: { fontSize: 16, color: Colors.text },
  reportOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  reportCard: { backgroundColor: Colors.background, borderRadius: 20, padding: 20, paddingBottom: 40 },
  reportTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  reportSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 7 },
  reasonRowOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  reasonText: { fontSize: 14, color: Colors.text },
  reasonTextOn: { color: Colors.primaryDark, fontWeight: '500' },
  reportInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.text, height: 80, marginTop: 8 },
  cancelBtn: { alignItems: 'center', marginTop: 12, padding: 10 },
  cancelText: { fontSize: 14, color: Colors.textSecondary },
})
