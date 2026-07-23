import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { WelcomeScreen } from './WelcomeScreen'
import { Colors, Spacing, Radius } from '../../lib/styles'

type Mode = 'welcome' | 'signup' | 'signin'

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('welcome')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSignUp() {
    if (!email || !password) { Alert.alert('Missing fields', 'Please enter your email and a password.'); return }
    if (password.length < 6) { Alert.alert('Password too short', 'Password must be at least 6 characters.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) Alert.alert('Sign up failed', error.message)
  }

  async function handleSignIn() {
    if (!email || !password) { Alert.alert('Missing fields', 'Please enter your email and password.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) Alert.alert('Sign in failed', error.message)
  }

  if (mode === 'welcome') {
    return (
      <WelcomeScreen
        onGetStarted={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode('signup') }}
        onSignIn={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode('signin') }}
      />
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setMode('welcome')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.logoSmall}>
              <Text style={styles.logoSmallText}>M</Text>
            </View>
          </View>

          <Text style={styles.title}>
            {mode === 'signup' ? 'Create your\naccount' : 'Welcome\nback'}
          </Text>
          <Text style={styles.sub}>
            {mode === 'signup'
              ? 'Join thousands of ambitious professionals finding meaningful connections.'
              : 'Sign in to continue building your connections.'}
          </Text>

          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Email address</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
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
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={mode === 'signup' ? '6+ characters' : 'Your password'}
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                mode === 'signup' ? handleSignUp() : handleSignIn()
              }}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Text style={styles.submitText}>
                      {mode === 'signup' ? 'Create account' : 'Sign in'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
          >
            <Text style={styles.switchText}>
              {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.switchLink}>
                {mode === 'signup' ? 'Sign in' : 'Create one'}
              </Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, padding: Spacing.xl, paddingTop: Spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  backBtn: { padding: 4 },
  logoSmall: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoSmallText: { fontSize: 18, fontFamily: 'DMSans_700Bold', color: '#fff', letterSpacing: -0.5 },
  title: { fontSize: 34, fontFamily: 'DMSans_700Bold', color: Colors.text, letterSpacing: -1, marginBottom: 8, lineHeight: 40 },
  sub: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 32 },
  form: { gap: Spacing.lg, marginBottom: Spacing.xl },
  inputWrap: { gap: 8 },
  inputLabel: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.text, marginLeft: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, backgroundColor: Colors.background, paddingHorizontal: Spacing.md },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.text, fontFamily: 'DMSans_400Regular' },
  eyeBtn: { padding: 4 },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  submitText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold', letterSpacing: 0.2 },
  switchBtn: { alignItems: 'center', marginBottom: Spacing.lg },
  switchText: { fontSize: 14, color: Colors.textSecondary },
  switchLink: { color: Colors.primary, fontFamily: 'DMSans_700Bold' },
  legal: { fontSize: 11, color: Colors.textTertiary, textAlign: 'center', lineHeight: 16 },
})
