import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Radius } from '../../lib/styles'

const PRIVACY_POLICY = `Last updated: July 2026

Meridian ("we", "us", or "our") operates the Meridian dating application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.

INFORMATION WE COLLECT

We collect information you provide directly to us when you create an account, including your name, age, email address, location, career information, salary range, and profile photos.

HOW WE USE YOUR INFORMATION

We use the information we collect to:
- Provide, maintain, and improve Meridian
- Match you with other users based on your preferences
- Send you notifications about matches and messages
- Ensure the safety and security of our platform

SHARING YOUR INFORMATION

We do not sell your personal information. We share your information only with other users as part of the matching experience, and with service providers who help us operate the app.

LOCATION DATA

We use your location to show you people nearby. You can disable location access in your device settings at any time.

DATA RETENTION

You can delete your account at any time from the Profile tab, which will permanently remove all your data.

CONTACT US

If you have questions about this Privacy Policy, contact us at privacy@meridianapp.com`

const TERMS_OF_SERVICE = `Last updated: July 2026

By using Meridian, you agree to these Terms of Service.

ELIGIBILITY

You must be at least 18 years old to use Meridian.

ACCEPTABLE USE

You agree not to:
- Create a fake or misleading profile
- Use Meridian for commercial purposes
- Harass, abuse, or harm other users
- Post inappropriate or illegal content

PROFILE ACCURACY

You agree that the information in your profile, including career details and salary range, is accurate to the best of your knowledge.

PREMIUM SUBSCRIPTION

Meridian offers a Premium subscription at $12/month. Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date.

TERMINATION

We reserve the right to suspend or terminate accounts that violate these terms.

CONTACT US

If you have questions about these Terms, contact us at legal@meridianapp.com`

export function LegalScreen({ route }: any) {
  const { type } = route.params as { type: 'privacy' | 'terms' }
  const navigation = useNavigation<any>()
  const isPrivacy = type === 'privacy'
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service'
  const content = isPrivacy ? PRIVACY_POLICY : TERMS_OF_SERVICE

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.content}>{content}</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  scroll: { padding: Spacing.xl },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  content: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
})
