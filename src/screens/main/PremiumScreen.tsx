import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { useAuth } from '../../hooks/useAuth'

const FEATURES = [
  { icon: 'heart-outline', title: 'Unlimited likes', sub: 'Like as many people as you want, every day' },
  { icon: 'eye-outline', title: 'See who liked you', sub: 'View everyone who liked your profile instantly' },
  { icon: 'trending-up-outline', title: 'Salary filter', sub: 'Filter matches by minimum salary range' },
  { icon: 'flash-outline', title: 'Profile boost', sub: '24-hour boost puts you at the top of the feed' },
  { icon: 'chatbubble-outline', title: 'Unlimited matches', sub: 'Remove the 5 match limit' },
  { icon: 'shield-checkmark-outline', title: 'Priority verification', sub: 'Get your profile verified in under 24 hours' },
]

export function PremiumScreen() {
  const navigation = useNavigation<any>()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<'monthly' | 'yearly'>('monthly')

  async function handleSubscribe() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLoading(true)
    // Stripe integration will be added here
    setTimeout(() => {
      setLoading(false)
      Alert.alert(
        'Coming soon',
        'Premium subscriptions are launching with the App Store release. Join the waitlist to be notified.',
        [{ text: 'OK' }]
      )
    }, 1000)
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meridian Premium</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="flash" size={32} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Upgrade to Premium</Text>
          <Text style={styles.heroSub}>
            Get more matches, see who likes you, and stand out from the crowd.
          </Text>
        </View>

        {/* Pricing toggle */}
        <View style={styles.pricingToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, selected === 'monthly' && styles.toggleBtnOn]}
            onPress={() => setSelected('monthly')}
          >
            <Text style={[styles.toggleBtnText, selected === 'monthly' && styles.toggleBtnTextOn]}>Monthly</Text>
            <Text style={[styles.togglePrice, selected === 'monthly' && styles.togglePriceOn]}>$12/mo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, selected === 'yearly' && styles.toggleBtnOn]}
            onPress={() => setSelected('yearly')}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 40%</Text>
            </View>
            <Text style={[styles.toggleBtnText, selected === 'yearly' && styles.toggleBtnTextOn]}>Yearly</Text>
            <Text style={[styles.togglePrice, selected === 'yearly' && styles.togglePriceOn]}>$86/yr</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Everything in Premium</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureRowBorder]}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as any} size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            </View>
          ))}
        </View>

        {/* Free vs Premium */}
        <View style={styles.compareCard}>
          <Text style={styles.compareTitle}>Free vs Premium</Text>
          <View style={styles.compareRow}>
            <Text style={styles.compareLabel}>Daily likes</Text>
            <Text style={styles.compareFree}>4</Text>
            <Text style={styles.comparePremium}>Unlimited</Text>
          </View>
          <View style={styles.compareRow}>
            <Text style={styles.compareLabel}>Active matches</Text>
            <Text style={styles.compareFree}>5</Text>
            <Text style={styles.comparePremium}>Unlimited</Text>
          </View>
          <View style={styles.compareRow}>
            <Text style={styles.compareLabel}>See who liked you</Text>
            <Text style={styles.compareFree}>✗</Text>
            <Text style={styles.comparePremium}>✓</Text>
          </View>
          <View style={styles.compareRow}>
            <Text style={styles.compareLabel}>Salary filter</Text>
            <Text style={styles.compareFree}>✗</Text>
            <Text style={styles.comparePremium}>✓</Text>
          </View>
          <View style={[styles.compareRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.compareLabel}>Profile boost</Text>
            <Text style={styles.compareFree}>✗</Text>
            <Text style={styles.comparePremium}>✓</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.cta}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.ctaBtnText}>
                {selected === 'monthly' ? 'Start for $12/month' : 'Start for $86/year'}
              </Text>
          }
        </TouchableOpacity>
        <Text style={styles.ctaNote}>Cancel anytime · No commitment</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontFamily: 'DMSans_700Bold', color: Colors.text },
  scroll: { padding: Spacing.xl, gap: 16 },
  hero: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  heroIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroTitle: { fontSize: 28, fontFamily: 'DMSans_700Bold', color: Colors.navy, letterSpacing: -0.8 },
  heroSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  pricingToggle: { flexDirection: 'row', gap: 10 },
  toggleBtn: { flex: 1, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border, padding: 16, alignItems: 'center', gap: 4, position: 'relative', backgroundColor: '#fff' },
  toggleBtnOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  toggleBtnText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: Colors.textSecondary },
  toggleBtnTextOn: { color: Colors.primaryDark },
  togglePrice: { fontSize: 20, fontFamily: 'DMSans_700Bold', color: Colors.textSecondary },
  togglePriceOn: { color: Colors.primary },
  saveBadge: { position: 'absolute', top: -10, right: -10, backgroundColor: Colors.green, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  saveBadgeText: { fontSize: 10, fontFamily: 'DMSans_700Bold', color: '#fff' },
  featuresCard: { backgroundColor: '#fff', borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg },
  featuresTitle: { fontSize: 13, fontFamily: 'DMSans_700Bold', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  featureRowBorder: { borderBottomWidth: 1, borderColor: Colors.border },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: Colors.text },
  featureSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  compareCard: { backgroundColor: Colors.navy, borderRadius: Radius.xl, padding: Spacing.lg },
  compareTitle: { fontSize: 13, fontFamily: 'DMSans_700Bold', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 },
  compareRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  compareLabel: { flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.8)', fontFamily: 'DMSans_400Regular' },
  compareFree: { width: 70, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.4)', fontFamily: 'DMSans_500Medium' },
  comparePremium: { width: 80, textAlign: 'center', fontSize: 14, color: Colors.primary, fontFamily: 'DMSans_700Bold' },
  cta: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.xl, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderColor: Colors.border, gap: 8 },
  ctaBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  ctaBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold' },
  ctaNote: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center' },
})
