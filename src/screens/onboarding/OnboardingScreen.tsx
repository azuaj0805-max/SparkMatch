import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { ChipGroup } from '../../components/Chip'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { SalaryRange, SALARY_LABELS, LookingFor, LOOKING_FOR_LABELS } from '../../types'

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

export function OnboardingScreen() {
  const { session, refreshProfile } = useAuth()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

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

  function nextStep() {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1)
    else saveProfile()
  }
  function prevStep() { if (step > 0) setStep(s => s - 1) }

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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Progress header */}
      <View style={styles.progressHeader}>
        {step > 0 && (
          <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.stepCount}>{step + 1}/{TOTAL_STEPS}</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step 0 — Name */}
        {step === 0 && (
          <View>
            <Text style={styles.stepTag}>About you</Text>
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.sub}>This is how you'll appear on Meridian.</Text>
            <TextInput style={styles.input} placeholder="First name" value={firstName} onChangeText={setFirstName} placeholderTextColor={Colors.textTertiary} />
            <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="number-pad" placeholderTextColor={Colors.textTertiary} />
            <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} placeholderTextColor={Colors.textTertiary} />
          </View>
        )}

        {/* Step 1 — Career */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTag}>Career</Text>
            <Text style={styles.title}>Your career</Text>
            <Text style={styles.sub}>This is what sets Meridian apart from every other dating app.</Text>
            <TextInput style={styles.input} placeholder="Job title" value={jobTitle} onChangeText={setJobTitle} placeholderTextColor={Colors.textTertiary} />
            <TextInput style={styles.input} placeholder="Company" value={company} onChangeText={setCompany} placeholderTextColor={Colors.textTertiary} />
            <Text style={styles.fieldLabel}>Industry</Text>
            <ChipGroup options={INDUSTRIES} selected={industry} onChange={(v) => setIndustry(v.slice(-1))} single />
            <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Salary range</Text>
            {SALARY_OPTIONS.map(([key, label]) => (
              <TouchableOpacity key={key} style={[styles.optRow, salaryRange === key && styles.optRowOn]} onPress={() => setSalaryRange(key)}>
                <Text style={[styles.optText, salaryRange === key && styles.optTextOn]}>{label}</Text>
                {salaryRange === key && <Text style={{ color: Colors.primary }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2 — Gender */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTag}>Identity</Text>
            <Text style={styles.title}>How do you identify?</Text>
            <Text style={styles.sub}>Helps us show you to the right people. Change anytime in settings.</Text>
            <ChipGroup options={GENDERS} selected={gender} onChange={(v) => setGender(v.slice(-1))} single columns={1} />
          </View>
        )}

        {/* Step 3 — Orientation */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTag}>Identity</Text>
            <Text style={styles.title}>Sexual orientation</Text>
            <Text style={styles.sub}>Select all that apply. You choose what's visible on your profile.</Text>
            <ChipGroup options={ORIENTATIONS} selected={orientation} onChange={setOrientation} columns={1} />
            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.toggle, showOrientation && styles.toggleOn]} onPress={() => setShowOrientation(v => !v)}>
                <View style={[styles.toggleThumb, showOrientation && styles.toggleThumbOn]} />
              </TouchableOpacity>
              <Text style={styles.toggleLabel}>Show orientation on my profile</Text>
            </View>
          </View>
        )}

        {/* Step 4 — Interested in */}
        {step === 4 && (
          <View>
            <Text style={styles.stepTag}>Preferences</Text>
            <Text style={styles.title}>Who do you want to see?</Text>
            <Text style={styles.sub}>Select all you're open to.</Text>
            <ChipGroup options={INTERESTED_IN} selected={interestedIn} onChange={setInterestedIn} columns={1} />
          </View>
        )}

        {/* Step 5 — Looking for */}
        {step === 5 && (
          <View>
            <Text style={styles.stepTag}>Dating goals</Text>
            <Text style={styles.title}>What are you looking for?</Text>
            <Text style={styles.sub}>Be honest — it helps match you with people on the same page.</Text>
            {LOOKING_FOR_OPTIONS.map(([key, label]) => (
              <TouchableOpacity key={key} style={[styles.optRow, lookingFor === key && styles.optRowOn]} onPress={() => setLookingFor(key)}>
                <Text style={[styles.optText, lookingFor === key && styles.optTextOn]}>{label}</Text>
                {lookingFor === key && <Text style={{ color: Colors.primary }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 6 — Relationship style */}
        {step === 6 && (
          <View>
            <Text style={styles.stepTag}>Dating goals</Text>
            <Text style={styles.title}>Relationship style</Text>
            <Text style={styles.sub}>Select all that apply.</Text>
            <ChipGroup options={REL_STYLES} selected={relStyle} onChange={setRelStyle} columns={1} />
          </View>
        )}

        {/* Step 7 — Lifestyle */}
        {step === 7 && (
          <View>
            <Text style={styles.stepTag}>Lifestyle</Text>
            <Text style={styles.title}>A few more about you</Text>
            <Text style={styles.sub}>These help filter for compatibility — not judgment.</Text>
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

        {/* Step 8 — Work style */}
        {step === 8 && (
          <View>
            <Text style={styles.stepTag}>Career preferences</Text>
            <Text style={styles.title}>Your work style</Text>
            <Text style={styles.sub}>Pick all that describe you.</Text>
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

        {/* Step 9 — Prompt */}
        {step === 9 && (
          <View>
            <Text style={styles.stepTag}>Your voice</Text>
            <Text style={styles.title}>Answer a prompt</Text>
            <Text style={styles.sub}>Prompts get 3× more engagement than photos alone.</Text>
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

        {/* Step 10 — Done */}
        {step === 10 && (
          <View style={styles.successWrap}>
            <View style={styles.successIcon}>
              <Text style={{ fontSize: 36 }}>✦</Text>
            </View>
            <Text style={styles.successTitle}>Welcome to Meridian</Text>
            <Text style={styles.successSub}>Your profile is live. Start discovering people who match your ambition and your vibe.</Text>
          </View>
        )}

        {/* Button */}
        <TouchableOpacity style={styles.nextBtn} onPress={nextStep} disabled={saving} activeOpacity={0.85}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.nextBtnText}>{step === TOTAL_STEPS - 1 ? 'Start discovering' : 'Continue'}</Text>
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
  backArrow: { fontSize: 20, color: Colors.textSecondary },
  progressTrack: { flex: 1, height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  stepCount: { fontSize: 12, color: Colors.textTertiary, fontWeight: '500', minWidth: 32, textAlign: 'right' },
  body: { padding: Spacing.xl, paddingBottom: 40 },
  stepTag: { fontSize: 11, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 8, letterSpacing: -0.5, lineHeight: 32 },
  sub: { fontSize: 15, color: Colors.textSecondary, marginBottom: 24, lineHeight: 22 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    fontSize: 15, color: Colors.text, backgroundColor: Colors.background, marginBottom: 10,
  },
  textarea: { height: 110, paddingTop: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  optRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background, marginBottom: 8,
  },
  optRowOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optText: { fontSize: 14, color: Colors.text },
  optTextOn: { color: Colors.primaryDark, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, marginTop: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  toggle: { width: 38, height: 22, borderRadius: 11, backgroundColor: Colors.border, justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: Colors.primary },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', alignSelf: 'flex-start' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  toggleLabel: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  salarySteps: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  stepBtnOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  stepBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  stepBtnTextOn: { color: Colors.primaryDark, fontWeight: '700' },
  successWrap: { alignItems: 'center', paddingTop: 60, paddingBottom: 32 },
  successIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 },
  successSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  nextBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 15, alignItems: 'center', marginTop: 28 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  skipBtn: { alignItems: 'center', marginTop: 14, padding: 10 },
  skipText: { fontSize: 14, color: Colors.textTertiary },
})
