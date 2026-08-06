import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'

function getCompanyFromEmail(email: string): string {
  const domain = email.split('@')[1]
  if (!domain) return ''
  const company = domain.split('.')[0]
  return company.charAt(0).toUpperCase() + company.slice(1)
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function VerifyWorkEmailScreen() {
  const { session, refreshProfile } = useAuth()
  const navigation = useNavigation<any>()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [workEmail, setWorkEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentCode, setSentCode] = useState('')

  function isValidWorkEmail(email: string): boolean {
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'me.com', 'aol.com']
    const domain = email.split('@')[1]
    if (!domain) return false
    if (personalDomains.includes(domain.toLowerCase())) return false
    return email.includes('@') && email.includes('.')
  }

  async function handleSendCode() {
    if (!workEmail) { Alert.alert('Enter your work email'); return }
    if (!isValidWorkEmail(workEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid work email address. Personal emails like Gmail are not accepted.')
      return
    }

    setLoading(true)
    const code = generateCode()
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    // Store code in profile
    await supabase
      .from('profiles')
      .update({
        work_email: workEmail,
        work_email_code: code,
        work_email_code_expires_at: expires,
      })
      .eq('id', session?.user.id)

    // Send code via Supabase Edge Function
    try {
      await supabase.functions.invoke('send-verification-email', {
        body: {
          email: workEmail,
          code,
          company: getCompanyFromEmail(workEmail),
        },
      })
      setSentCode(code)
      setStep('code')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (e) {
      // For now just set the code directly (until edge function is deployed)
      setSentCode(code)
      setStep('code')
      Alert.alert('Code sent', `For testing: your code is ${code}`)
    }
    setLoading(false)
  }

  async function handleVerifyCode() {
    if (!code || code.length < 6) { Alert.alert('Enter the 6-digit code'); return }
    setLoading(true)

    const { data: profile } = await supabase
      .from('profiles')
      .select('work_email_code, work_email_code_expires_at')
      .eq('id', session?.user.id)
      .maybeSingle()

    if (!profile) { setLoading(false); Alert.alert('Error', 'Profile not found'); return }

    const expired = new Date(profile.work_email_code_expires_at) < new Date()
    if (expired) {
      setLoading(false)
      Alert.alert('Code expired', 'Please request a new code.')
      setStep('email')
      return
    }

    if (profile.work_email_code !== code) {
      setLoading(false)
      Alert.alert('Wrong code', 'The code you entered is incorrect. Please try again.')
      return
    }

    // Mark as verified
    await supabase
      .from('profiles')
      .update({
        work_email_verified: true,
        salary_verified: true,
        work_email_code: null,
        work_email_code_expires_at: null,
      })
      .eq('id', session?.user.id)

    await refreshProfile()
    setLoading(false)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    Alert.alert(
      'Verified! ✓',
      `Your work email at ${getCompanyFromEmail(workEmail)} has been verified. A verified badge will now show on your profile.`,
      [{ text: 'Great!', onPress: () => navigation.goBack() }]
    )
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark-outline" size={36} color={Colors.primary} />
          </View>

          {step === 'email' ? (
            <>
              <Text style={styles.title}>Verify your{'\n'}workplace</Text>
              <Text style={styles.sub}>
                Enter your work email to get a verified badge on your profile. Personal emails are not accepted.
              </Text>

              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Work email</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@company.com"
                    placeholderTextColor={Colors.textTertiary}
                    value={workEmail}
                    onChangeText={setWorkEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {workEmail.includes('@') && (
                <View style={styles.companyPreview}>
                  <Ionicons name="business-outline" size={16} color={Colors.primary} />
                  <Text style={styles.companyPreviewText}>
                    {getCompanyFromEmail(workEmail) || 'Your company'}
                  </Text>
                </View>
              )}

              <View style={styles.benefits}>
                <BenefitRow icon="checkmark-circle-outline" text="Verified badge on your profile" />
                <BenefitRow icon="trending-up-outline" text="3× more matches than unverified profiles" />
                <BenefitRow icon="lock-closed-outline" text="Your work email stays private" />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleSendCode() }}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Text style={styles.submitText}>Send verification code</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </>
                }
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Enter the{'\n'}code</Text>
              <Text style={styles.sub}>
                We sent a 6-digit code to{'\n'}
                <Text style={styles.emailHighlight}>{workEmail}</Text>
              </Text>

              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Verification code</Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="000000"
                  placeholderTextColor={Colors.textTertiary}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleVerifyCode() }}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Text style={styles.submitText}>Verify</Text>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    </>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendBtn} onPress={() => setStep('email')}>
                <Text style={styles.resendText}>Change email or resend code</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function BenefitRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <Ionicons name={icon as any} size={18} color={Colors.primary} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: Spacing.xl },
  header: { marginBottom: Spacing.xl },
  backBtn: { padding: 4 },
  iconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  title: { fontSize: 34, fontFamily: 'DMSans_700Bold', color: Colors.text, letterSpacing: -1, marginBottom: 8, lineHeight: 40 },
  sub: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },
  emailHighlight: { fontFamily: 'DMSans_600SemiBold', color: Colors.text },
  inputWrap: { gap: 8, marginBottom: Spacing.lg },
  inputLabel: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.text },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, backgroundColor: Colors.background, paddingHorizontal: Spacing.md },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.text, fontFamily: 'DMSans_400Regular' },
  codeInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, paddingVertical: 16, fontSize: 28, fontFamily: 'DMSans_700Bold', color: Colors.text, textAlign: 'center', letterSpacing: 8 },
  companyPreview: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primaryLight, padding: Spacing.md, borderRadius: Radius.lg, marginBottom: Spacing.lg },
  companyPreviewText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: Colors.primary },
  benefits: { gap: 12, marginBottom: 28 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold' },
  resendBtn: { alignItems: 'center', marginTop: 16, padding: 10 },
  resendText: { fontSize: 14, color: Colors.primary, fontFamily: 'DMSans_600SemiBold' },
})
