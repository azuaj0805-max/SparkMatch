import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'

export function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp() {
    if (!email || !password) { Alert.alert('Please enter email and password'); return }
    if (password.length < 6) { Alert.alert('Password must be at least 6 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) Alert.alert('Error', error.message)
  }

  async function handleSignIn() {
    if (!email || !password) { Alert.alert('Please enter email and password'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) Alert.alert('Sign in failed', error.message)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoM}>M</Text>
            </View>
            <Text style={styles.appName}>Meridian</Text>
            <Text style={styles.tagline}>Where ambition meets connection</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tab switcher */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, mode === 'signup' && styles.tabActive]}
                onPress={() => setMode('signup')}
              >
                <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Create account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === 'signin' && styles.tabActive]}
                onPress={() => setMode('signin')}
              >
                <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>Sign in</Text>
              </TouchableOpacity>
            </View>

            {/* Fields */}
            <View style={styles.form}>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="6+ characters"
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={mode === 'signup' ? handleSignUp : handleSignIn}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitText}>
                      {mode === 'signup' ? 'Get started' : 'Sign in'}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.legal}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>

          {/* Value props */}
          <View style={styles.props}>
            <PropRow icon="💼" text="Career-first matching with salary transparency" />
            <PropRow icon="🎯" text="Filter by ambition, industry, and goals" />
            <PropRow icon="🔒" text="Verified profiles, real connections" />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function PropRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.propRow}>
      <Text style={styles.propIcon}>{icon}</Text>
      <Text style={styles.propText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.navy },
  container: { flexGrow: 1, padding: Spacing.xl },
  hero: { alignItems: 'center', paddingTop: 40, paddingBottom: 32 },
  logoWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  logoM: { fontSize: 36, fontWeight: '700', color: '#fff', letterSpacing: -1 },
  appName: { fontSize: 32, fontWeight: '700', color: '#fff', letterSpacing: -0.5, marginBottom: 6 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.1 },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.full },
  tabActive: { backgroundColor: Colors.background },
  tabText: { fontSize: 14, color: Colors.textTertiary, fontWeight: '500' },
  tabTextActive: { color: Colors.text, fontWeight: '600' },
  form: { gap: Spacing.md },
  inputWrap: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, marginLeft: 2 },
  input: {
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.lg,
    paddingVertical: 13, fontSize: 15, color: Colors.text,
    backgroundColor: Colors.background,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  legal: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 16 },
  props: { gap: Spacing.md, paddingBottom: 40 },
  propRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  propIcon: { fontSize: 20, width: 32, textAlign: 'center' },
  propText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', flex: 1, lineHeight: 20 },
})
