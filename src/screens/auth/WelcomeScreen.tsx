import React, { useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Colors, Spacing, Radius } from '../../lib/styles'

const { height } = Dimensions.get('window')

type Props = {
  onGetStarted: () => void
  onSignIn: () => void
}

const FEATURES = [
  { icon: 'briefcase-outline', title: 'Career transparency', sub: 'See salary ranges and career goals upfront' },
  { icon: 'trending-up-outline', title: 'Ambitious matches', sub: 'Connect with people who share your drive' },
  { icon: 'shield-checkmark-outline', title: 'Verified profiles', sub: 'Real people, real careers, real connections' },
]

export function WelcomeScreen({ onGetStarted, onSignIn }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <View style={styles.container}>
      {/* Dark navy hero */}
      <View style={styles.hero}>
        <Animated.View style={[styles.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoWrap}>
            <View style={styles.logoInner}>
              <Text style={styles.logoM}>M</Text>
            </View>
            <View style={styles.ring1} />
            <View style={styles.ring2} />
          </View>
          <Text style={styles.heroTitle}>Meridian</Text>
          <Text style={styles.heroSub}>Dating for ambitious people</Text>
        </Animated.View>
      </View>

      {/* White card with features + CTA */}
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <SafeAreaView edges={['bottom']}>
          <Text style={styles.cardTitle}>Find someone who matches{'\n'}your ambition</Text>

          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon as any} size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureSub}>{f.sub}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              onGetStarted()
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Create account</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              onSignIn()
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>I already have an account</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>
        </SafeAreaView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  heroContent: { alignItems: 'center', gap: 16 },
  logoWrap: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center', marginBottom: 8, position: 'relative' },
  logoInner: { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  logoM: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -2 },
  ring1: { position: 'absolute', width: 94, height: 94, borderRadius: 28, borderWidth: 1.5, borderColor: 'rgba(110, 140, 255, 0.3)' },
  ring2: { position: 'absolute', width: 110, height: 110, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(110, 140, 255, 0.15)' },
  heroTitle: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1.5 },
  heroSub: { fontSize: 16, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.2 },
  card: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: Spacing.xl, paddingTop: 28,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.5, marginBottom: 24, lineHeight: 30 },
  features: { gap: 16, marginBottom: 28 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  featureIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  featureSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  secondaryBtn: { paddingVertical: 13, alignItems: 'center', marginBottom: 16 },
  secondaryBtnText: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  legal: { fontSize: 11, color: Colors.textTertiary, textAlign: 'center', lineHeight: 16 },
})
