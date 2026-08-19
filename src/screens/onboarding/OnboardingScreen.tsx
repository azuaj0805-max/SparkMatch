import React, { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Animated, Dimensions, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { ChipGroup } from '../../components/Chip'
import { Colors, Spacing, Radius } from '../../lib/styles'
import { SalaryRange, SALARY_LABELS, LookingFor, LOOKING_FOR_LABELS } from '../../types'

const { width, height } = Dimensions.get('window')

const TOTAL_STEPS = 12
const INDUSTRIES = ['Tech','Finance','Consulting','Healthcare','Law','Media','Real Estate','Education','Other']
const WORK_STYLES = ['High growth','Work-life balance','Startup minded','Corporate path','Remote first','In-office','Open to relocate','Entrepreneur']
const GENDERS = ['Man','Woman','Non-binary','Genderqueer / Genderfluid','Prefer to self-describe']
const ORIENTATIONS = ['Straight','Gay','Lesbian','Bisexual','Pansexual','Asexual','Queer','Prefer not to say']
const INTERESTED_IN = ['Men','Women','Non-binary people','Everyone']
const REL_STYLES = ['Monogamous','Ethically non-monogamous','Still figuring it out']
const SALARY_OPTIONS = Object.entries(SALARY_LABELS) as [SalaryRange, string][]
const LOOKING_FOR_OPTIONS = Object.entries(LOOKING_FOR_LABELS) as [LookingFor, string][]
const PROMPT_CATEGORIES = [
  {
    name: "About me",
    prompts: [
      "A fun fact about me",
      "I get way too excited about",
      "The most spontaneous thing I have done",
      "My most controversial opinion",
      "The way to win me over is",
      "I am known for",
      "My love language is",
      "I promise I am not like other people who",
    ],
  },
  {
    name: "What I am looking for",
    prompts: [
      "I am looking for someone who",
      "The relationship I am looking for",
      "Green flags I look for",
      "My ideal Sunday looks like",
      "I know it is a match when",
      "The first thing I notice about someone",
      "I fall for people who",
      "Non-negotiables for me",
    ],
  },
  {
    name: "Professional",
    prompts: [
      "My 5-year goal",
      "The most ambitious thing I have done",
      "Best career advice I have received",
      "My work style in three words",
      "I am really good at",
      "A skill I am currently building",
      "The problem I want to solve",
      "What drives me professionally",
    ],
  },
  {
    name: "Date preferences",
    prompts: [
      "The perfect first date",
      "Best date I have ever been on",
      "I am a better date when",
      "Something I want to do on a first date",
      "Date idea I am waiting to try",
      "I show affection by",
      "My idea of a perfect night",
      "Dinner or adventure",
    ],
  },
  {
    name: "Outside of work",
    prompts: [
      "My free time looks like",
      "I am currently obsessed with",
      "A hobby I would love to share with someone",
      "The show I am rewatching for the 3rd time",
      "My go-to workout",
      "Best trip I have ever taken",
      "I am happiest when",
      "Hidden talent",
    ],
  },
  {
    name: "Story time",
    prompts: [
      "Craziest thing that has ever happened to me",
      "A story my friends always ask me to tell",
      "Most embarrassing thing that turned into a great story",
      "The time I completely surprised myself",
      "A lesson I learned the hard way",
      "Plot twist in my life",
      "The best decision I ever made on a whim",
      "Something that changed my perspective",
    ],
  },
]

const PROMPT_QUESTIONS = PROMPT_CATEGORIES.flatMap(c => c.prompts)
const STEPS = [
  { tag: 'Welcome', title: "Let's build\nyour profile.", sub: null },
  { tag: 'About you', title: "What's your\nname?", sub: null },
  { tag: 'Career', title: "What do\nyou do?", sub: "This is what sets Meridian apart." },
  { tag: 'Career', title: "Your salary\nrange", sub: "Only shown to verified matches." },
  { tag: 'Identity', title: "How do you\nidentify?", sub: null },
  { tag: 'Preferences', title: "Who do you\nwant to meet?", sub: null },
  { tag: 'Dating goals', title: "What are you\nlooking for?", sub: "Be honest. It helps." },
  { tag: 'Work style', title: "Your work\nstyle", sub: null },
  { tag: 'Photos', title: "Add 5 photos.", sub: "Required. Profiles with photos get 10× more matches." },
  { tag: 'Prompts', title: "Answer 3\nprompts.", sub: "Required. Let people know who you are." },
  { tag: 'Prompts', title: null, sub: null },
  { tag: 'Prompts', title: null, sub: null },
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
  const [interestedIn, setInterestedIn] = useState<string[]>([])
  const [lookingFor, setLookingFor] = useState<LookingFor | null>(null)
  const [relStyle, setRelStyle] = useState<string[]>([])
  const [workStyle, setWorkStyle] = useState<string[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [photoBase64s, setPhotoBase64s] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [prompts, setPrompts] = useState([
    { question: PROMPT_QUESTIONS[0], answer: '' },
    { question: PROMPT_QUESTIONS[1], answer: '' },
    { question: PROMPT_QUESTIONS[2], answer: '' },
  ])

  function animateToStep(next: number) {
    const direction = next > step ? 1 : -1
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -24 * direction, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setStep(next)
      slideAnim.setValue(24 * direction)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 3 }),
      ]).start()
    })
  }

  function validateStep(): boolean {
    if (step === 1 && (!firstName.trim() || !age || !city.trim())) {
      Alert.alert('Required', 'Please fill in your name, age, and city.')
      return false
    }
    if (step === 2 && !jobTitle.trim()) {
      Alert.alert('Required', 'Please enter your job title.')
      return false
    }
    if (step === 8 && photos.length < 5) {
      Alert.alert('5 photos required', `Please add ${5 - photos.length} more photo${5 - photos.length !== 1 ? 's' : ''}.`)
      return false
    }
    if (step === 9 && !prompts[0].answer.trim()) {
      Alert.alert('Required', 'Please answer this prompt.')
      return false
    }
    if (step === 10 && !prompts[1].answer.trim()) {
      Alert.alert('Required', 'Please answer this prompt.')
      return false
    }
    if (step === 11 && !prompts[2].answer.trim()) {
      Alert.alert('Required', 'Please answer this prompt.')
      return false
    }
    return true
  }

  function nextStep() {
    if (!validateStep()) return
    if (step < TOTAL_STEPS - 1) animateToStep(step + 1)
    else saveProfile()
  }

  function prevStep() {
    if (step > 0) animateToStep(step - 1)
  }

  async function pickPhoto() {
    if (photos.length >= 6) { Alert.alert('Maximum 6 photos'); return }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) { Alert.alert('Permission required', 'Please allow photo access.'); return }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      selectionLimit: 1,
      quality: 0.8,
      base64: true,
    })

    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    if (!asset.base64) return

    setPhotos(prev => [...prev, asset.uri])
    setPhotoBase64s(prev => [...prev, asset.base64!])
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoBase64s(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadPhotos(): Promise<string[]> {
    const urls: string[] = []
    for (let i = 0; i < photoBase64s.length; i++) {
      const base64 = photoBase64s[i]
      const fileName = `${session?.user.id}/${Date.now()}_${i}.jpg`
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let j = 0; j < byteCharacters.length; j++) {
        byteNumbers[j] = byteCharacters.charCodeAt(j)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const { error } = await supabase.storage
        .from('Photos')
        .upload(fileName, byteArray, { contentType: 'image/jpeg', upsert: true })
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('Photos').getPublicUrl(fileName)
        urls.push(publicUrl)
      }
    }
    return urls
  }

  async function saveProfile() {
    if (!session) return
    setSaving(true)
    setUploading(true)

    let photoUrls: string[] = []
    try {
      photoUrls = await uploadPhotos()
    } catch (e) {
      Alert.alert('Photo upload failed', 'Please try again.')
      setSaving(false)
      setUploading(false)
      return
    }
    setUploading(false)

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      first_name: firstName.trim(),
      age: parseInt(age) || 0,
      city: city.trim(),
      job_title: jobTitle.trim(),
      company: company.trim(),
      industry: industry[0] ?? null,
      salary_range: salaryRange,
      work_style: workStyle,
      gender: gender[0] ?? null,
      orientation,
      show_orientation: true,
      interested_in: interestedIn,
      looking_for: lookingFor,
      relationship_style: relStyle,
      prompts,
      photos: photoUrls,
      salary_verified: false,
      updated_at: new Date().toISOString(),
    })

    setSaving(false)
    if (error) { Alert.alert('Error', error.message); return }
    await refreshProfile()
  }

  const progress = step / (TOTAL_STEPS - 1)
  const currentStep = STEPS[step]

  const isPromptStep = step >= 9
  const promptIndex = step - 9

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Progress bar */}
      <View style={styles.topBar}>
        {step > 0 && (
          <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step header */}
        {!isPromptStep && (
          <Animated.View style={[styles.stepHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.stepTag}>{currentStep.tag}</Text>
            <Text style={styles.title}>{currentStep.title}</Text>
            {currentStep.sub && <Text style={styles.sub}>{currentStep.sub}</Text>}
          </Animated.View>
        )}

        {/* Step content */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Step 0 — Welcome */}
          {step === 0 && (
            <View style={styles.welcomeWrap}>
              <View style={styles.logoWrap}>
                <Text style={styles.logoLetter}>M</Text>
              </View>
              <Text style={styles.welcomeTitle}>Welcome to{'\n'}Meridian.</Text>
              <Text style={styles.welcomeSub}>
                The dating app built for ambitious people. We take 5 minutes to set up — and it's worth it.
              </Text>
              <View style={styles.requirementCards}>
                <View style={styles.requirementCard}>
                  <Ionicons name="camera-outline" size={20} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>5 photos required</Text>
                    <Text style={styles.reqSub}>So people know who they're talking to</Text>
                  </View>
                </View>
                <View style={styles.requirementCard}>
                  <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>3 prompts required</Text>
                    <Text style={styles.reqSub}>So your personality comes through</Text>
                  </View>
                </View>
                <View style={styles.requirementCard}>
                  <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>Career details</Text>
                    <Text style={styles.reqSub}>What makes Meridian different</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Step 1 — Name/Age/City */}
          {step === 1 && (
            <View style={styles.fields}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor={Colors.textTertiary}
                  autoFocus
                />
              </View>
              <View style={styles.inputRow2}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="25"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textTertiary}
                    maxLength={2}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Austin, TX"
                    value={city}
                    onChangeText={setCity}
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Step 2 — Career */}
          {step === 2 && (
            <View style={styles.fields}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Software Engineer"
                  value={jobTitle}
                  onChangeText={setJobTitle}
                  placeholderTextColor={Colors.textTertiary}
                  autoFocus
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company <Text style={styles.optional}>(optional)</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Google"
                  value={company}
                  onChangeText={setCompany}
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              <Text style={styles.fieldSectionLabel}>Industry</Text>
              <ChipGroup options={INDUSTRIES} selected={industry} onChange={(v) => setIndustry(v.slice(-1))} single />
            </View>
          )}

          {/* Step 3 — Salary */}
          {step === 3 && (
            <View style={styles.fields}>
              {SALARY_OPTIONS.map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.optRow, salaryRange === key && styles.optRowOn]}
                  onPress={() => setSalaryRange(key)}
                >
                  <Text style={[styles.optText, salaryRange === key && styles.optTextOn]}>{label}</Text>
                  {salaryRange === key && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 4 — Identity */}
          {step === 4 && (
            <View style={styles.fields}>
              <Text style={styles.fieldSectionLabel}>Gender</Text>
              <ChipGroup options={GENDERS} selected={gender} onChange={(v) => setGender(v.slice(-1))} single columns={1} />
              <Text style={[styles.fieldSectionLabel, { marginTop: 16 }]}>Orientation <Text style={styles.optional}>(optional)</Text></Text>
              <ChipGroup options={ORIENTATIONS} selected={orientation} onChange={setOrientation} />
            </View>
          )}

          {/* Step 5 — Preferences */}
          {step === 5 && (
            <ChipGroup options={INTERESTED_IN} selected={interestedIn} onChange={setInterestedIn} columns={1} />
          )}

          {/* Step 6 — Looking for */}
          {step === 6 && (
            <View style={styles.fields}>
              {LOOKING_FOR_OPTIONS.map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.optRow, lookingFor === key && styles.optRowOn]}
                  onPress={() => setLookingFor(key)}
                >
                  <Text style={[styles.optText, lookingFor === key && styles.optTextOn]}>{label}</Text>
                  {lookingFor === key && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 7 — Work style */}
          {step === 7 && (
            <ChipGroup options={WORK_STYLES} selected={workStyle} onChange={setWorkStyle} />
          )}

          {/* Step 8 — Photos */}
          {step === 8 && (
            <View style={styles.fields}>
              <View style={styles.photoRequirement}>
                <Text style={styles.photoCount}>{photos.length}/5</Text>
                <Text style={styles.photoCountLabel}>photos added{photos.length >= 5 ? ' ✓' : ' required'}</Text>
              </View>
              <View style={styles.photoGrid}>
                {photos.map((uri, i) => (
                  <View key={i} style={styles.photoThumb}>
                    <Image source={{ uri }} style={styles.photoThumbImg} resizeMode="cover" />
                    <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(i)}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {photos.length < 6 && (
                  <TouchableOpacity style={styles.photoAdd} onPress={pickPhoto}>
                    <Ionicons name="camera-outline" size={24} color={Colors.primary} />
                    <Text style={styles.photoAddText}>Add photo</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.photoHint}>
                Add at least 5 photos. Clear, recent photos with your face visible perform best.
              </Text>
            </View>
          )}

          {/* Steps 9-11 — 3 Prompts */}
          {isPromptStep && (
            <View style={styles.fields}>
              <Text style={styles.stepTag}>Prompt {promptIndex + 1} of 3</Text>
              <Text style={styles.title}>Answer a{'\n'}prompt.</Text>
              <Text style={styles.sub}>Required. Choose a question and write your answer.</Text>

              <Text style={styles.fieldSectionLabel}>Choose a category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {PROMPT_CATEGORIES.map((cat, ci) => (
                  <TouchableOpacity
                    key={ci}
                    style={[styles.promptChip, prompts[promptIndex].question && PROMPT_CATEGORIES[ci].prompts.includes(prompts[promptIndex].question) && styles.promptChipOn]}
                    onPress={() => {
                      const updated = [...prompts]
                      updated[promptIndex] = { ...updated[promptIndex], question: cat.prompts[0] }
                      setPrompts(updated)
                    }}
                  >
                    <Text style={[styles.promptChipText, prompts[promptIndex].question && PROMPT_CATEGORIES[ci].prompts.includes(prompts[promptIndex].question) && styles.promptChipTextOn]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.fieldSectionLabel}>Choose a question</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptScroll}>
                {(PROMPT_CATEGORIES.find(c => c.prompts.includes(prompts[promptIndex].question)) ?? PROMPT_CATEGORIES[0]).prompts.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.promptChip, prompts[promptIndex].question === q && styles.promptChipOn]}
                    onPress={() => {
                      const updated = [...prompts]
                      updated[promptIndex] = { ...updated[promptIndex], question: q }
                      setPrompts(updated)
                    }}
                  >
                    <Text style={[styles.promptChipText, prompts[promptIndex].question === q && styles.promptChipTextOn]}>
                      {q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.promptAnswerWrap}>
                <Text style={styles.promptQuestion}>{prompts[promptIndex].question}</Text>
                <TextInput
                  style={styles.promptInput}
                  placeholder="Write your answer..."
                  placeholderTextColor={Colors.textTertiary}
                  value={prompts[promptIndex].answer}
                  onChangeText={(text) => {
                    const updated = [...prompts]
                    updated[promptIndex] = { ...updated[promptIndex], answer: text }
                    setPrompts(updated)
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={300}
                />
                <Text style={styles.charCount}>{prompts[promptIndex].answer.length}/300</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.nextBtn, step === 0 && styles.nextBtnLarge]}
          onPress={nextStep}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.nextBtnText}>{uploading ? 'Uploading photos...' : 'Saving...'}</Text>
            </View>
          ) : (
            <Text style={styles.nextBtnText}>
              {step === 0 ? "Let's go" : step === TOTAL_STEPS - 1 ? 'Finish' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>

        {step >= 3 && step <= 7 && (
          <TouchableOpacity style={styles.skipBtn} onPress={nextStep}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6, gap: 12 },
  backBtn: { padding: 4 },
  progressTrack: { flex: 1, height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  body: { padding: 24, paddingBottom: 40 },

  stepHeader: { marginBottom: 28 },
  stepTag: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 },
  title: { fontSize: 38, fontFamily: 'DMSans_700Bold', color: Colors.navy, letterSpacing: -1.2, lineHeight: 44, marginBottom: 8 },
  sub: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },

  // Welcome
  welcomeWrap: { alignItems: 'flex-start', marginBottom: 8 },
  logoWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  logoLetter: { fontSize: 28, fontFamily: 'DMSans_700Bold', color: '#fff', letterSpacing: -1 },
  welcomeTitle: { fontSize: 42, fontFamily: 'DMSans_700Bold', color: Colors.navy, letterSpacing: -1.5, lineHeight: 48, marginBottom: 12 },
  welcomeSub: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24, marginBottom: 32 },
  requirementCards: { width: '100%', gap: 10 },
  requirementCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  reqTitle: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: Colors.text, marginBottom: 2 },
  reqSub: { fontSize: 12, color: Colors.textSecondary },

  // Fields
  fields: { gap: 6, marginBottom: 8 },
  inputGroup: { gap: 6, marginBottom: 8 },
  inputRow2: { flexDirection: 'row', gap: 10 },
  inputLabel: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.text },
  optional: { fontFamily: 'DMSans_400Regular', color: Colors.textTertiary },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: Colors.text, backgroundColor: '#fff', fontFamily: 'DMSans_400Regular' },
  fieldSectionLabel: { fontSize: 12, fontFamily: 'DMSans_700Bold', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 8 },
  optRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff', marginBottom: 8 },
  optRowOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optText: { fontSize: 15, color: Colors.text, fontFamily: 'DMSans_400Regular' },
  optTextOn: { color: Colors.primaryDark, fontFamily: 'DMSans_600SemiBold' },

  // Photos
  photoRequirement: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  photoCount: { fontSize: 32, fontFamily: 'DMSans_700Bold', color: Colors.primary },
  photoCountLabel: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'DMSans_500Medium' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  photoThumb: { width: (width - 48 - 16) / 3, height: (width - 48 - 16) / 3 * 1.3, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoThumbImg: { width: '100%', height: '100%' },
  photoRemove: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  photoAdd: { width: (width - 48 - 16) / 3, height: (width - 48 - 16) / 3 * 1.3, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fff' },
  photoAddText: { fontSize: 12, color: Colors.primary, fontFamily: 'DMSans_500Medium' },
  photoHint: { fontSize: 13, color: Colors.textTertiary, lineHeight: 18 },

  // Prompts
  promptScroll: { marginBottom: 16 },
  promptChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, marginRight: 8, backgroundColor: '#fff' },
  promptChipOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  promptChipText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'DMSans_400Regular' },
  promptChipTextOn: { color: Colors.primaryDark, fontFamily: 'DMSans_600SemiBold' },
  promptAnswerWrap: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: Colors.border, gap: 10 },
  promptQuestion: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: Colors.text },
  promptInput: { fontSize: 15, color: Colors.text, lineHeight: 22, minHeight: 100, fontFamily: 'DMSans_400Regular' },
  charCount: { fontSize: 11, color: Colors.textTertiary, textAlign: 'right', fontFamily: 'DMSans_400Regular' },

  // CTA
  nextBtn: { backgroundColor: Colors.navy, borderRadius: 50, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  nextBtnLarge: { paddingVertical: 18 },
  nextBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold', letterSpacing: 0.2 },
  skipBtn: { alignItems: 'center', marginTop: 12, padding: 10 },
  skipText: { fontSize: 14, color: Colors.textTertiary },
})
