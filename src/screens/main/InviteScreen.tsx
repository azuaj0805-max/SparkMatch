import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Share, Alert, Clipboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAuth } from '../../hooks/useAuth'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'

export function InviteScreen() {
  const { profile } = useAuth()
  const navigation = useNavigation<any>()
  const [copied, setCopied] = useState(false)

  const inviteCode = profile?.invite_code ?? '------'
  const inviteLink = `https://azuaj0805-max.github.io/SparkMatch/?ref=${inviteCode}`
  const inviteMessage = `I'm on Meridian — the dating app built for ambitious professionals in NYC. Use my code ${inviteCode} to join: ${inviteLink}`

  async function handleCopy() {
    Clipboard.setString(inviteCode)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      await Share.share({
        message: inviteMessage,
        url: inviteLink,
      })
    } catch (e) {}
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite friends</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.heroWrap}>
          <View style={styles.heroIcon}>
            <Ionicons name="people-outline" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Invite your network</Text>
          <Text style={styles.heroSub}>
            Meridian is better when your people are on it. Share your invite code with ambitious friends in NYC.
          </Text>
        </View>

        {/* Invite code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your invite code</Text>
          <Text style={styles.code}>{inviteCode}</Text>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={16} color={Colors.primary} />
            <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy code'}</Text>
          </TouchableOpacity>
        </View>

        {/* Perks */}
        <View style={styles.perksCard}>
          <Text style={styles.perksTitle}>When your friends join</Text>
          <View style={styles.perkRow}>
            <View style={styles.perkIcon}>
              <Ionicons name="star-outline" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.perkText}>They get early access to Meridian NYC</Text>
          </View>
          <View style={styles.perkRow}>
            <View style={styles.perkIcon}>
              <Ionicons name="heart-outline" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.perkText}>You get 2 bonus likes per referral</Text>
          </View>
          <View style={styles.perkRow}>
            <View style={styles.perkIcon}>
              <Ionicons name="trending-up-outline" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.perkText}>Your profile gets boosted for 24 hours</Text>
          </View>
        </View>

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.shareBtnText}>Share invite link</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Meridian is currently invite-only in NYC. Help us build the right community.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontFamily: 'DMSans_700Bold', color: Colors.text },
  body: { flex: 1, padding: Spacing.xl, gap: 16 },
  heroWrap: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  heroIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroTitle: { fontSize: 24, fontFamily: 'DMSans_700Bold', color: Colors.navy, letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  codeCard: { backgroundColor: Colors.navy, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', gap: 8 },
  codeLabel: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.2 },
  code: { fontSize: 42, fontFamily: 'DMSans_700Bold', color: '#fff', letterSpacing: 8 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(110,140,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, marginTop: 4 },
  copyBtnText: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.primary },
  perksCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, gap: 12, borderWidth: 1, borderColor: Colors.border },
  perksTitle: { fontSize: 13, fontFamily: 'DMSans_700Bold', color: Colors.text, marginBottom: 4 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  perkText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  shareBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  shareBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold' },
  note: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center', lineHeight: 18 },
})
