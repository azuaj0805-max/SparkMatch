import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { ChipGroup } from '../../components/Chip'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { SalaryRange, SALARY_LABELS, LookingFor, LOOKING_FOR_LABELS } from '../../types'

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

export function EditProfileScreen() {
  const { profile, refreshProfile } = useAuth()
  const navigation = useNavigation<any>()
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState(profile?.first_name ?? '')
  const [age, setAge] = useState(String(profile?.age ?? ''))
  const [city, setCity] = useState(profile?.city ?? '')
  const [jobTitle, setJobTitle] = useState(profile?.job_title ?? '')
  const [company, setCompany] = useState(profile?.company ?? '')
  const [industry, setIndustry] = useState<string[]>(profile?.industry ? [profile.industry] : [])
  const [salaryRange, setSalaryRange] = useState<SalaryRange | null>(profile?.salary_range ?? null)
  const [gender, setGender] = useState<string[]>(profile?.gender ? [profile.gender] : [])
  const [orientation, setOrientation] = useState<string[]>(profile?.orientation ?? [])
  const [showOrientation, setShowOrientation] = useState(profile?.show_orientation ?? true)
  const [interestedIn, setInterestedIn] = useState<string[]>(profile?.interested_in ?? [])
  const [lookingFor, setLookingFor] = useState<LookingFor | null>(profile?.looking_for ?? null)
  const [relStyle, setRelStyle] = useState<string[]>(profile?.relationship_style ?? [])
  const [kids, setKids] = useState<string[]>(profile?.has_kids ? [profile.has_kids] : [])
  const [drinking, setDrinking] = useState<string[]>(profile?.drinking ? [profile.drinking] : [])
  const [smoking, setSmoking] = useState<string[]>(profile?.smoking ? [profile.smoking] : [])
  const [religion, setReligion] = useState<string[]>(profile?.religion ? [profile.religion] : [])
  const [workStyle, setWorkStyle] = useState<string[]>(profile?.work_style ?? [])
  const [minPartnerSalary, setMinPartnerSalary] = useState(profile?.min_partner_salary ?? 0)
  const [promptQuestion, setPromptQuestion] = useState(profile?.prompts?.[0]?.question ?? PROMPT_QUESTIONS[0])
  const [promptAnswer, setPromptAnswer] = useState(profile?.prompts?.[0]?.answer ?? '')

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      first_name: firstName,
      age: parseInt(age) || profile?.age,
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
      updated_at: new Date().toISOString(),
    }).eq('id', profile?.id)

    setSaving(false)
    if (error) { Alert.alert('Error', error.message); return }
    await refreshProfile()
    Alert.alert('Saved!', 'Your profile has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ])
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          {saving ? <ActivityIndicator color={Colors.primary} size="small" /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Basic info</Text>
        <TextInput style={styles.input} placeholder="First name" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="number-pad" />
        <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />

        <Text style={styles.sectionTitle}>Career</Text>
        <TextInput style={styles.input} placeholder="Job title" value={jobTitle} onChangeText={setJobTitle} />
        <TextInput style={styles.input} placeholder="Company" value={company} onChangeText={setCompany} />
        <Text style={styles.label}>Industry</Text>
        <ChipGroup options={INDUSTRIES} selected={industry} onChange={(v) => setIndustry(v.slice(-1))} single />
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>Salary range</Text>
        {SALARY_OPTIONS.map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.salRow, salaryRange === key && styles.salRowOn]} onPress={() => setSalaryRange(key)}>
            <Text style={[styles.salText, salaryRange === key && styles.salTextOn]}>{label}</Text>
            {salaryRange === key && <Text style={{ color: Colors.primary }}>✓</Text>}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Identity</Text>
        <Text style={styles.label}>Gender</Text>
        <ChipGroup options={GENDERS} selected={gender} onChange={(v) => setGender(v.slice(-1))} single columns={1} />
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>Sexual orientation</Text>
        <ChipGroup options={ORIENTATIONS} selected={orientation} onChange={setOrientation} columns={1} />
        <View style={styles.toggleRow}>
          <TouchableOpacity style={[styles.toggle, showOrientation && styles.toggleOn]} onPress={() => setShowOrientation(v => !v)}>
            <View style={[styles.toggleThumb, showOrientation && styles.toggleThumbOn]} />
          </TouchableOpacity>
          <Text style={styles.toggleLabel}>Show orientation on my profile</Text>
        </View>

        <Text style={styles.sectionTitle}>Dating preferences</Text>
        <Text style={styles.label}>Interested in</Text>
        <ChipGroup options={INTERESTED_IN} selected={interestedIn} onChange={setInterestedIn} columns={1} />
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>Looking for</Text>
        {LOOKING_FOR_OPTIONS.map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.salRow, lookingFor === key && styles.salRowOn]} onPress={() => setLookingFor(key)}>
            <Text style={[styles.salText, lookingFor === key && styles.salTextOn]}>{label}</Text>
            {lookingFor === key && <Text style={{ color: Colors.primary }}>✓</Text>}
          </TouchableOpacity>
        ))}
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>Relationship style</Text>
        <ChipGroup options={REL_STYLES} selected={relStyle} onChange={setRelStyle} columns={1} />

        <Text style={styles.sectionTitle}>Lifestyle</Text>
        <Text style={styles.label}>Kids</Text>
        <ChipGroup options={KIDS_OPTIONS} selected={kids} onChange={(v) => setKids(v.slice(-1))} single />
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>Drinking</Text>
        <ChipGroup options={DRINKING_OPTIONS} selected={drinking} onChange={(v) => setDrinking(v.slice(-1))} single />
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>Smoking / cannabis</Text>
        <ChipGroup options={SMOKING_OPTIONS} selected={smoking} onChange={(v) => setSmoking(v.slice(-1))} single />
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>Religion</Text>
        <ChipGroup options={RELIGIONS} selected={religion} onChange={(v) => setReligion(v.slice(-1))} single />

        <Text style={styles.sectionTitle}>Work style</Text>
        <ChipGroup options={WORK_STYLES} selected={workStyle} onChange={setWorkStyle} />
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>Minimum salary preference in a partner</Text>
        <View style={styles.salarySteps}>
          {[0,40,60,80,100,150,200].map(val => (
            <TouchableOpacity key={val} style={[styles.stepBtn, minPartnerSalary === val && styles.stepBtnOn]} onPress={() => setMinPartnerSalary(val)}>
              <Text style={[styles.stepBtnText, minPartnerSalary === val && styles.stepBtnTextOn]}>{val === 0 ? 'Any' : `$${val}k`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Prompt</Text>
        <ChipGroup options={PROMPT_QUESTIONS} selected={[promptQuestion]} onChange={(v) => setPromptQuestion(v[0])} single columns={1} />
        <TextInput style={[styles.input, styles.textarea]} placeholder="Write your answer..." value={promptAnswer} onChangeText={setPromptAnswer} multiline numberOfLines={4} textAlignVertical="top" />

        <TouchableOpacity style={[GlobalStyles.primaryButton, { marginTop: Spacing.xl, marginBottom: 40 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={GlobalStyles.primaryButtonText}>Save changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: Colors.border },
  backBtn: { padding: 4, width: 40 },
  backArrow: { fontSize: 20, color: Colors.textSecondary },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  saveBtn: { width: 40, alignItems: 'flex-end' },
  saveText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  scroll: { padding: Spacing.xl, paddingBottom: 60 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: Spacing.xl, marginBottom: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 0.5, borderColor: Colors.border },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  input: { borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: 13, fontSize: 15, color: Colors.text, backgroundColor: Colors.background, marginBottom: 10 },
  textarea: { height: 100, paddingTop: 12 },
  salRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.background, marginBottom: 7 },
  salRowOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  salText: { fontSize: 14, color: Colors.text },
  salTextOn: { color: Colors.primaryDark, fontWeight: '500' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.md, marginTop: Spacing.lg },
  toggle: { width: 36, height: 20, borderRadius: 10, backgroundColor: Colors.border, justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: Colors.primary },
  toggleThumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', alignSelf: 'flex-start' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  toggleLabel: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  salarySteps: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.border },
  stepBtnOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  stepBtnText: { fontSize: 13, color: Colors.textSecondary },
  stepBtnTextOn: { color: Colors.primaryDark, fontWeight: '500' },
})
