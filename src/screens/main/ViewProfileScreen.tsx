import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Avatar } from '../../components/Avatar'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { SALARY_BADGE_LABELS, LOOKING_FOR_LABELS, Profile } from '../../types'

export function ViewProfileScreen({ route }: any) {
  const { profile } = route.params as { profile: Profile }
  const navigation = useNavigation<any>()

  const salaryLabel = profile.salary_range ? SALARY_BADGE_LABELS[profile.salary_range] : null
  const lookingForLabel = profile.looking_for ? LOOKING_FOR_LABELS[profile.looking_for] : null

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.first_name}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Photo */}
        <View style={styles.photoArea}>
          {profile.photos?.[0] ? (
            <Image source={{ uri: profile.photos[0] }} style={styles.photo} resizeMode="cover" />
          ) : (
            <Avatar name={profile.first_name} size={120} />
          )}
          {profile.salary_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Salary Verified</Text>
            </View>
          )}
        </View>

        {/* Name + basic info */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>{profile.first_name}, {profile.age}</Text>
          <Text style={styles.location}>{profile.city}</Text>
          {salaryLabel && (
            <View style={styles.salaryBadge}>
              <Text style={styles.salaryBadgeText}>💰 {salaryLabel}</Text>
            </View>
          )}
        </View>

        {/* Career */}
        {(profile.job_title || profile.industry) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Career</Text>
            {profile.job_title && <InfoRow icon="💼" text={`${profile.job_title}${profile.company ? ` · ${profile.company}` : ''}`} />}
            {profile.industry && <InfoRow icon="🏢" text={profile.industry} />}
          </View>
        )}

        {/* Dating preferences */}
        {lookingForLabel && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Looking for</Text>
            <InfoRow icon="🎯" text={lookingForLabel} />
            {profile.relationship_style?.length > 0 && (
              <InfoRow icon="💑" text={profile.relationship_style.join(', ')} />
            )}
            {profile.orientation?.length > 0 && profile.show_orientation && (
              <InfoRow icon="🌈" text={profile.orientation.join(', ')} />
            )}
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

        {/* Lifestyle */}
        {(profile.drinking || profile.smoking || profile.religion || profile.has_kids) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lifestyle</Text>
            {profile.has_kids && <InfoRow icon="👶" text={profile.has_kids} />}
            {profile.drinking && <InfoRow icon="🍷" text={`Drinking: ${profile.drinking}`} />}
            {profile.smoking && <InfoRow icon="🚬" text={`Smoking: ${profile.smoking}`} />}
            {profile.religion && <InfoRow icon="🙏" text={profile.religion} />}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: Colors.border },
  backBtn: { padding: 4, width: 32 },
  backArrow: { fontSize: 20, color: Colors.textSecondary },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  scroll: { paddingBottom: 60 },
  photoArea: { height: 320, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  photo: { width: '100%', height: '100%' },
  verifiedBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: Colors.blueLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  verifiedText: { fontSize: 12, color: Colors.blue, fontWeight: '600' },
  nameSection: { padding: Spacing.xl, borderBottomWidth: 0.5, borderColor: Colors.border },
  name: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  location: { fontSize: 14, color: Colors.textSecondary, marginBottom: 10 },
  salaryBadge: { alignSelf: 'flex-start', backgroundColor: Colors.greenLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.greenBorder },
  salaryBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.green },
  card: { margin: Spacing.lg, marginBottom: 0, backgroundColor: Colors.background, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: Spacing.lg },
  cardTitle: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  infoIcon: { fontSize: 15 },
  infoText: { fontSize: 14, color: Colors.text, flex: 1 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.border },
  tagText: { fontSize: 12, color: Colors.textSecondary },
  promptBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 11 },
  promptLabel: { fontSize: 10, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  promptAnswer: { fontSize: 13, color: Colors.text, lineHeight: 19 },
})
