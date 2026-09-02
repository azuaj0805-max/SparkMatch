import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Switch, Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAuth } from '../../hooks/useAuth'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { supabase } from '../../lib/supabase'

export function SettingsScreen() {
  const { profile, signOut } = useAuth()
  const navigation = useNavigation<any>()
  const [showOrientation, setShowOrientation] = useState(profile?.show_orientation ?? true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

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

  async function toggleShowOrientation(value: boolean) {
    setShowOrientation(value)
    await supabase
      .from('profiles')
      .update({ show_orientation: value })
      .eq('id', profile?.id)
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="pencil-outline"
            label="Edit profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingsRow
            icon="eye-outline"
            label="Preview my profile"
            onPress={() => navigation.navigate('ProfilePreview')}
          />
          <SettingsRow
            icon="lock-closed-outline"
            label="Change password"
            onPress={() => Alert.alert('Change password', 'A password reset link will be sent to your email.', [
              { text: 'Cancel' },
              { text: 'Send link', onPress: async () => {
                if (profile) {
                  const { data } = await supabase.auth.getUser()
                  if (data.user?.email) {
                    await supabase.auth.resetPasswordForEmail(data.user.email)
                    Alert.alert('Email sent', 'Check your inbox for the reset link.')
                  }
                }
              }}
            ])}
            last
          />
        </View>

        {/* Privacy */}
        <Text style={styles.sectionLabel}>Privacy</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={styles.rowIcon}>
                <Ionicons name="radio-outline" size={18} color={Colors.textSecondary} />
              </View>
              <Text style={styles.rowLabel}>Show orientation on profile</Text>
            </View>
            <Switch
              value={showOrientation}
              onValueChange={toggleShowOrientation}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <SettingsRow
            icon="ban-outline"
            label="Block or report someone"
            onPress={() => Alert.alert('Block or report', 'Open a match, tap their name, then tap ⋯ to block or report.')}
            last
          />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={styles.toggleLeft}>
              <View style={styles.rowIcon}>
                <Ionicons name="notifications-outline" size={18} color={Colors.textSecondary} />
              </View>
              <Text style={styles.rowLabel}>Push notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Legal */}
        <Text style={styles.sectionLabel}>Legal</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="document-text-outline"
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://azuaj0805-max.github.io/SparkMatch/privacy.html')}
          />
          <SettingsRow
            icon="reader-outline"
            label="Terms of Service"
            onPress={() => Linking.openURL('https://azuaj0805-max.github.io/SparkMatch/terms.html')}
            last
          />
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionLabel}>Account actions</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="log-out-outline"
            label="Sign out"
            onPress={() => Alert.alert('Sign out', 'Are you sure?', [
              { text: 'Cancel' },
              { text: 'Sign out', style: 'destructive', onPress: signOut }
            ])}
          />
          <SettingsRow
            icon="trash-outline"
            label="Delete account"
            onPress={handleDeleteAccount}
            danger
            last
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>Meridian v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function SettingsRow({ icon, label, onPress, danger, last }: {
  icon: string
  label: string
  onPress: () => void
  danger?: boolean
  last?: boolean
}) {
  return (
    <TouchableOpacity
      style={[styles.row, last && { borderBottomWidth: 0 }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress() }}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Ionicons name={icon as any} size={18} color={danger ? Colors.danger : Colors.textSecondary} />
        </View>
        <Text style={[styles.rowLabel, danger && { color: Colors.danger }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.borderDark} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontFamily: 'DMSans_700Bold', color: Colors.text },
  scroll: { padding: Spacing.xl, gap: 8 },
  sectionLabel: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 16, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: Colors.background, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderColor: Colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 15, color: Colors.text, fontFamily: 'DMSans_400Regular' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderColor: Colors.border },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  version: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center', marginTop: 16 },
})
