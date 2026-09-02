import 'react-native-gesture-handler'
import React, { useState } from 'react'
import { View } from 'react-native'
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans'
import Navigation from './src/Navigation'
import { SplashScreen } from './src/screens/SplashScreen'
import { useNotifications, registerForPushNotifications } from './src/hooks/useNotifications'
import { NotificationPrompt } from './src/components/NotificationPrompt'
import { useAuth } from './src/hooks/useAuth'
import { AuthProvider } from './src/hooks/useAuth'

function AppInner() {
  useNotifications()
  const { session, profile } = useAuth()
  const [showNotifPrompt, setShowNotifPrompt] = useState(false)
  const [notifShown, setNotifShown] = useState(false)

  React.useEffect(() => {
    if (session && profile && !notifShown) {
      setTimeout(() => {
        setShowNotifPrompt(true)
        setNotifShown(true)
      }, 3000)
    }
  }, [session, profile])

  async function handleAllowNotifications() {
    setShowNotifPrompt(false)
    if (session) await registerForPushNotifications(session.user.id)
  }

  return (
    <>
      <Navigation />
      <NotificationPrompt
        visible={showNotifPrompt}
        onAllow={handleAllowNotifications}
        onSkip={() => setShowNotifPrompt(false)}
      />
    </>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  })

  if (!fontsLoaded) return null

  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <AppInner />
        {showSplash && (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        )}
      </View>
    </AuthProvider>
  )
}
