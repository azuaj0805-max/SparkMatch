import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAuth } from '../../hooks/useAuth'
import { PhotoCarousel } from '../../components/PhotoCarousel'
import { InfoRow } from '../../components/InfoRow'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { SALARY_BADGE_LABELS, LOOKING_FOR_LABELS } from '../../types'

const { width } = Dimensions.get('window')

export function ProfilePreviewScreen() {
  const { profile } = useAuth()
  const navigation = useNavigation<any>()

  if (!profile) return null

  const salaryLabel = profile.salary_range ? SALARY_BADGE_LABELS[profile.salary_range] : null
  const lookingForLabel = profile.looking_for ? LOOKING_FOR_LABELS[profile.looking_for] : null

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
        <View style={styles.previewBadge}>
          <Ionicons name="eye-outline" size={14} color={Colors.primary} />
          <Text style={styles.previewBadgeText}>Preview</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero photo */}
        <View style={styles.photoWrap}>
          <PhotoCarousel
            photos={profile.photos ?? []}
            height={width * 1.2}
            name={profile.first_name}
          />
          <View style={styles.photoOverlay}>
            <View style={{ flex: 1 }}>
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

        {/* Prompts */}
        {profile.prompts?.map((p, i) => (
          <View key={i} style={styles.promptCard}>
            <Text style={styles.promptQ}>{p.question}</Text>
            <Text style={styles.promptA}>{p.answer}</Text>
          </View>
        ))}

        {/* Work style */}
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

        {/* Looking for */}
        {lookingForLabel && (
          <View style={styles.contentCard}>
            <Text style={styles.contentCardLabel}>Looking for</Text>
            <View style={styles.goalRow}>
              <Ionicons name="flag-outline" size={16} color={Colors.primary} />
              <Text style={styles.goalText}>{lookingForLabel}</Text>
            </View>
          </View>
        )}

        {/* Lifestyle */}
        {(profile.has_kids || profile.drinking || profile.smoking || profile.religion) && (
          <View style={styles.contentCard}>
            <Text style={styles.contentCardLabel}>Lifestyle</Text>
            {profile.has_kids && <InfoRow icon="people-outline" text={profile.has_kids} />}
            {profile.drinking && <InfoRow icon="wine-outline" text={`Drinking: ${profile.drinking}`} />}
            {profile.smoking && <InfoRow icon="flame-outline" text={`Smoking: ${profile.smoking}`} />}
            {profile.religion && <InfoRow icon="heart-circle-outline" text={profile.religion} />}
          </View>
        )}

        {/* Edit CTA */}
        <TouchableOpacity
          style={styles.editCta}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('EditProfile') }}
        >
          <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
          <Text style={styles.editCtaText}>Edit your profile</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  floatingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 10, position: 'absolute', top: 52, left: 0, right: 0, zIndex: 10 },
  floatingBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  previewBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full },
  previewBadgeText: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.primary },
  scroll: { paddingBottom: 60 },
  photoWrap: { width: '100%', height: width * 1.2, position: 'relative' },
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.xl, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.4)' },
  photoName: { fontSize: 28, fontFamily: 'DMSans_700Bold', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  photoMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  photoMetaText: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  salaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.greenLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.greenBorder },
  salaryBadgeText: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: Colors.green },
  block: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.lg, borderBottomWidth: 1, borderColor: Colors.border },
  blockIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  blockTitle: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: Colors.text },
  blockSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  promptCard: { padding: Spacing.lg, borderBottomWidth: 1, borderColor: Colors.border, gap: 6 },
  promptQ: { fontSize: 12, fontFamily: 'DMSans_700Bold', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 },
  promptA: { fontSize: 18, color: Colors.text, lineHeight: 26, fontFamily: 'DMSans_500Medium' },
  contentCard: { padding: Spacing.lg, borderBottomWidth: 1, borderColor: Colors.border, gap: 10 },
  contentCardLabel: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.primaryLight },
  tagText: { fontSize: 13, color: Colors.primary, fontFamily: 'DMSans_500Medium' },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalText: { fontSize: 16, color: Colors.text, fontFamily: 'DMSans_500Medium' },
  editCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: Spacing.xl, padding: Spacing.lg, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  editCtaText: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: Colors.primary },
})
