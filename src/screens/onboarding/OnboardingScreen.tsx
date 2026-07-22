import React, { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Animated, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { ChipGroup } from '../../components/Chip'
import { Colors, Spacing, Radius } from '../../lib/styles'
import { SalaryRange, SALARY_LABELS, LookingFor, LOOKING_FOR_LABELS } from '../../types'

const { width } = Dimensions.get('window')

const TOTAL_STEPS = 11
const INDUSTRIES = ['Tech','Finance','Consulting','Healthcare','Law','Media','Real Estate','Education','Other']
const WORK_STYLES = ['High growth','Work-life balance','Startup minded','Corporate path','Remote first','In-office','Open to relocate','Entrepreneur']
const GENDERS = ['Man','Woman','Non-binary','Genderqueer / Genderfluid','Prefer to self-describe']
const ORIENTATIONS = ['Straight / Heterosexual','Gay','Lesbian','Bisexual','Pansexual','Asexual','Queer','Prefer not to say']
const INTERESTED_IN = ['Men','Women','Non-binary people','Everyone']
const REL_STYLES = ['Monogamous','Ethically non-monogamous','Still figuring it out']
const KIDS_OPTIONS = ["Don't have, don't want","Don't have, open to it","Have kids","Want kids someday"]
const DRINKING_OPTIONS = ['Never','Rarely','Socially','Regularly']
const SMOKING_OPTIONS = ['Never','Socially','Yes','Prefer not to say']
const RELIGIONS = ['Christian','Jewish','Muslim','Hindu','Spiritual','Agnostic / Atheist','Buddhist','Other','Not important']
const SALARY_OPTIONS = Object.entries(SALARY_LABELS) as [SalaryRange, string][]
const LOOKING_FOR_OPTIONS = Object.entries(LOOKING_FOR_LABELS) as [LookingFor, string][]
const PROMPT_QUESTIONS = ["My 5-year goal","I'm looking for","Most ambitious thing I've done","Best career advice I got"]

const STEPS = [
  { tag: 'About you', title: "What's your\nname?", sub: "This is how you'll appear on Meridian." },
  { tag: 'Career', title: 'Your career', sub: "This is what sets Meridian apart from every other dating app." },
  { tag: 'Identity', title: 'How do you\nidentify?', sub: "Helps us show you to the right people." },
  { tag: 'Identity', title: 'Sexual\norientation', sub: "Select all that apply." },
  { tag: 'Preferences', title: 'Who do you\nwant to see?', sub: "Select all you're open to." },
  { tag: 'Dating goals', title: 'What are you\nlooking for?', sub: "Be honest — it helps match you with people on the same page." },
  { tag: 'Dating goals', title: 'Relationship\nstyle', sub: "Select all that apply." },
  { tag: 'Lifestyle', title: 'A few more\nabout you', sub: "These help filter for compatibility." },
  { tag: 'Work style', title: 'Your work\nstyle', sub: "Pick all that describe you." },
  { tag: 'Your voice', title: 'Answer a\nprompt', sub: "Prompts get 3× more engagement than photos alone." },
  { tag: 'Welcome', title: "You're all\nset! 🎉", sub: "Start discovering people who match your ambition." },
]

export function OnboardingScreen() {
  const { session, refreshProfile } = useAuth()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(1)).current

  const [firstName, setFirstName] = useState('')
  const [age, setAge] = useState('')
  const [city, setCity] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState<string[]>([])
  const [salaryRange, setSalaryRange] = useState<SalaryRange | null>(null)
  const [gender, setGender] = useState<string[]>([])
  const [orientation, setOrientation] = useState<string[]>([])
  const [showOrientation, setShowOrientation] = useState(true)
  const [interestedIn, setInterestedIn] = useState<string[]>([])
  const [lookingFor, setLookingFor] = useState<LookingFor | null>(null)
  const [relStyle, setRelStyle] = useState<string[]>([])
  const [kids, setKids] = useState<string[]>([])
  const [drinking, setDrinking] = useState<string[]>([])
  const [smoking, setSmoking] = useState<string[]>([])
  const [religion, setReligion] = useState<string[]>([])
  const [workStyle, setWorkStyle] = useState<string[]>([])
  const [minPartnerSalary, setMinPartnerSalary] = useState(0)
  const [promptQuestion, setPromptQuestion] = useState(PROMPT_QUESTIONS[0])
  const [promptAnswer, setPromptAnswer] = useState('')

  function animateToStep(next: number) {
    const direction = next > step ? 1 : -1
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30 * direction, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next)
      slideAnim.setValue(30 * direction)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 4 }),
      ]).start()
    })
  }

  function nextStep() {
    if (step < TOTAL_STEPS - 1) animateToStep(step + 1)
    else saveProfile()
  }

  function prevStep() {
    if (step > 0) animateToStep(step - 1)
  }

  async function saveProfile() {
    if (!session) return
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      first_name: firstName,
      age: parseInt(age) || 0,
      city, job_title: jobTitle, company,
      industry: industry[0] ?? null,
      salary_range: salaryRange,
      work_style: workStyle,
      gender: gender[0] ?? null,
      orientation, show_orientation: showOrientation,
      interested_in: interestedIn,
      looking_for: lookingFor,
      relationship_style: relStyle,
      has_kids: kids[0] ?? null,
      drinking: drinking[0] ?? null,
      smoking: smoking[0] ?? null,
      religion: religion[0] ?? null,
      min_partner_salary: minPartnerSalary,
      prompts: [{ question: promptQuestion, answer: promptAnswer }],
      photos: [], salary_verified: false,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) { Alert.alert('Error saving profile', error.message); return }
    await refreshProfile()
  }

  const progress = (step / (TOTAL_STEPS - 1)) * 100
  const currentStep = STEPS[step]

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Progress bar */}
      <View style={styles.progressHeader}>
        {step > 0 && (
          <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        )}
        <View style={[styles.progressTrack, step === 0 && { marginLeft: 0 }]}>
          <Animated.View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Animated step header */}
        <Animated.View style={[styles.stepHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.stepTag}>{currentStep.tag}</Text>
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.sub}>{currentStep.sub}</Text>
        </Animated.View>

        {/* Step content */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {step === 0 && (
            <View style={styles.fields}>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>First name</Text>
                <TextInput style={styles.input} placeholder="Your name" value={firstName} onChangeText={setFirstName} placeholderTextColor={Colors.textTertiary} />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput style={styles.input} placeholder="Your age" value={age} onChangeText={setAge} keyboardType="number-pad" placeholderTextColor={Colors.textTertiary} />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput style={styles.input} placeholder="Where you live" value={city} onChangeText={setCity} placeholderTextColor={Colors.textTertiary} />
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.fields}>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Job title</Text>
                <TextInput style={styles.input} placeholder="What you do" value={jobTitle} onChangeText={setJobTitle} placeholderTextColor={Colors.textTertiary} />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Company</Text>
                <TextInput style={styles.input} placeholder="Where you work" value={company} onChangeText={setCompany} placeholderTextColor={Colors.textTertiary} />
              </View>
              <Text style={styles.fieldLabel}>Industry</Text>
              <ChipGroup options={INDUSTRIES} selected={industry} onChange={(v) => setIndustry(v.slice(-1))} single />
              <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Salary range</Text>
              {SALARY_OPTIONS.map(([key, label]) => (
                <TouchableOpacity key={key} style={[styles.optRow, salaryRange === key && styles.optRowOn]} onPress={() => setSalaryRange(key)}>
                  <Text style={[styles.optText, salaryRange === key && styles.optTextOn]}>{label}</Text>
                  {salaryRange === key && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 2 && (
            <ChipGroup options={GENDERS} selected={gender} onChange={(v) => setGender(v.slice(-1))} single columns={1} />
          )}

          {step === 3 && (
            <View>
              <ChipGroup options={ORIENTATIONS} selected={orientation} onChange={setOrientation} columns={1} />
              <TouchableOpacity style={styles.toggleRow} onPress={() => setShowOrientation(v => !v)}>
                <View style={[styles.toggle, showOrientation && styles.toggleOn]}>
                  <View style={[styles.toggleThumb, showOrientation && styles.toggleThumbOn]} />
                </View>
                <Text style={styles.toggleLabel}>Show orientation on my profile</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 4 && (
            <ChipGroup options={INTERESTED_IN} selected={interestedIn} onChange={setInterestedIn} columns={1} />
          )}

          {step === 5 && (
            <View>
              {LOOKING_FOR_OPTIONS.map(([key, label]) => (
                <TouchableOpacity key={key} style={[styles.optRow, lookingFor === key && styles.optRowOn]} onPress={() => setLookingFor(key)}>
                  <Text style={[styles.optText, lookingFor === key && styles.optTextOn]}>{label}</Text>
                  {lookingFor === key && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 6 && (
            <ChipGroup options={REL_STYLES} selected={relStyle} onChange={setRelStyle} columns={1} />
          )}

          {step === 7 && (
            <View style={styles.fields}>
              <Text style={styles.fieldLabel}>Kids</Text>
              <ChipGroup options={KIDS_OPTIONS} selected={kids} onChange={(v) => setKids(v.slice(-1))} single />
              <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Drinking</Text>
              <ChipGroup options={DRINKING_OPTIONS} selected={drinking} onChange={(v) => setDrinking(v.slice(-1))} single />
              <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Smoking / cannabis</Text>
              <ChipGroup options={SMOKING_OPTIONS} selected={smoking} onChange={(v) => setSmoking(v.slice(-1))} single />
              <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Religion</Text>
              <ChipGroup options={RELIGIONS} selected={religion} onChange={(v) => setReligion(v.slice(-1))} single />
            </View>
          )}

          {step === 8 && (
            <View style={styles.fields}>
              <ChipGroup options={WORK_STYLES} selected={workStyle} onChange={setWorkStyle} />
              <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Minimum salary preference in a partner</Text>
              <View style={styles.salarySteps}>
                {[0,40,60,80,100,150,200].map(val => (
                  <TouchableOpacity key={val} style={[styles.stepBtn, minPartnerSalary === val && styles.stepBtnOn]} onPress={() => setMinPartnerSalary(val)}>
                    <Text style={[styles.stepBtnText, minPartnerSalary === val && styles.stepBtnTextOn]}>
                      {val === 0 ? 'Any' : `$${val}k`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 9 && (
            <View style={styles.fields}>
              <ChipGroup options={PROMPT_QUESTIONS} selected={[promptQuestion]} onChange={(v) => setPromptQuestion(v[0])} single columns={1} />
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Write your answer here..."
                placeholderTextColor={Colors.textTertiary}
                value={promptAnswer}
                onChangeText={setPromptAnswer}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {step === 10 && (
            <View style={styles.successWrap}>
              <View style={styles.successIconWrap}>
                <Ionicons name="heart" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.successNote}>
                Add photos and fill out your profile to get the most out of Meridian. Profiles with photos get 10× more likes.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={nextStep}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.nextBtnText}>
                {step === TOTAL_STEPS - 1 ? 'Start discovering' : 'Continue'}
              </Text>
          }
        </TouchableOpacity>

        {step >= 7 && step < 10 && (
          <TouchableOpacity style={styles.skipBtn} onPress={nextStep}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  progressHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.md },
  backBtn: { padding: 4 },
  progressTrack: { flex: 1, height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  body: { padding: Spacing.xl, paddingBottom: 40 },
  stepHeader: { marginBottom: 28 },
  stepTag: { fontSize: 12, fontFamily: 'DMSans_700Bold', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  title: { fontSize: 34, fontFamily: 'DMSans_700Bold', color: Colors.text, marginBottom: 8, letterSpacing: -1, lineHeight: 40 },
  sub: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  fields: { gap: 4 },
  inputWrap: { gap: 6, marginBottom: 12 },
  inputLabel: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.text },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, paddingVertical: 14, fontSize: 15, color: Colors.text, backgroundColor: Colors.background, fontFamily: 'DMSans_400Regular' },
  textarea: { height: 110, paddingTop: 14 },
  fieldLabel: { fontSize: 12, fontFamily: 'DMSans_700Bold', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  optRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, marginBottom: 8 },
  optRowOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optText: { fontSize: 14, color: Colors.text, fontFamily: 'DMSans_400Regular' },
  optTextOn: { color: Colors.primaryDark, fontFamily: 'DMSans_600SemiBold' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, marginTop: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  toggle: { width: 38, height: 22, borderRadius: 11, backgroundColor: Colors.border, justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: Colors.primary },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', alignSelf: 'flex-start' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  toggleLabel: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  salarySteps: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  stepBtnOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  stepBtnText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'DMSans_500Medium' },
  stepBtnTextOn: { color: Colors.primaryDark, fontFamily: 'DMSans_700Bold' },
  successWrap: { alignItems: 'center', paddingVertical: 20, gap: 16 },
  successIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  successNote: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  nextBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  nextBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold', letterSpacing: 0.2 },
  skipBtn: { alignItems: 'center', marginTop: 14, padding: 10 },
  skipText: { fontSize: 14, color: Colors.textTertiary },
})
