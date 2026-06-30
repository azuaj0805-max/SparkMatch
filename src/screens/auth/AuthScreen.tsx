import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
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
    <SafeAreaView style={GlobalStyles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>✦</Text>
            </View>
            <Text style={styles.appName}>SparkMatch</Text>
            <Text style={styles.tagline}>Dating for ambitious people</Text>
          </View>

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

          <View style={styles.form}>
            <TextInput
              style={[GlobalStyles.input, styles.input]}
              placeholder="Email address"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={[GlobalStyles.input, styles.input]}
              placeholder="Password"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[GlobalStyles.primaryButton, styles.submitBtn]}
              onPress={mode === 'signup' ? handleSignUp : handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={GlobalStyles.primaryButtonText}>
                    {mode === 'signup' ? 'Create account' : 'Sign in'}
                  </Text>
              }
            </TouchableOpacity>
          </View>

          <Text style={styles.legal}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { padding: Spacing.xl, paddingTop: 40, flexGrow: 1 },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoIcon: { fontSize: 30, color: Colors.primary },
  appName: { fontSize: 28, fontWeight: '700', color: Colors.text, letterSpacing: -0.5, marginBottom: 4 },
  tagline: { fontSize: 14, color: Colors.textSecondary },
  tabRow: {
    flexDirection: 'row', borderRadius: Radius.md,
    backgroundColor: Colors.surface, padding: 4, marginBottom: Spacing.xl,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.background },
  tabText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.text, fontWeight: '600' },
  form: { gap: Spacing.md },
  input: { marginBottom: 0 },
  submitBtn: { marginTop: Spacing.sm },
  legal: { fontSize: 11, color: Colors.textTertiary, textAlign: 'center', marginTop: 24, lineHeight: 16 },
})
