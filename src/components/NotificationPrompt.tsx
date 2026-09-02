import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Colors, Spacing, Radius } from '../lib/styles'

type Props = {
  visible: boolean
  onAllow: () => void
  onSkip: () => void
}

export function NotificationPrompt({ visible, onAllow, onSkip }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="notifications-outline" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Don't miss a match</Text>
          <Text style={styles.sub}>
            Get notified when someone likes you, sends a message, or you get a new match.
          </Text>

          <View style={styles.features}>
            <FeatureRow icon="heart-outline" text="New likes and matches" />
            <FeatureRow icon="chatbubble-outline" text="Messages from your matches" />
            <FeatureRow icon="star-outline" text="Profile activity updates" />
          </View>

          <TouchableOpacity
            style={styles.allowBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onAllow() }}
            activeOpacity={0.85}
          >
            <Text style={styles.allowBtnText}>Allow notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
            <Text style={styles.skipText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon as any} size={16} color={Colors.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 28, paddingBottom: 40, margin: 16 },
  iconWrap: { width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontFamily: 'DMSans_700Bold', color: Colors.navy, letterSpacing: -0.8, marginBottom: 8 },
  sub: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  features: { gap: 12, marginBottom: 28 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 15, color: Colors.text, fontFamily: 'DMSans_500Medium' },
  allowBtn: { backgroundColor: Colors.primary, borderRadius: 50, paddingVertical: 15, alignItems: 'center', marginBottom: 10 },
  allowBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold' },
  skipBtn: { alignItems: 'center', padding: 10 },
  skipText: { fontSize: 14, color: Colors.textTertiary },
})
