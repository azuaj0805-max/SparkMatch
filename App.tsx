import 'react-native-gesture-handler'
import React, { useState } from 'react'
import { View } from 'react-native'
import Navigation from './src/Navigation'
import { SplashScreen } from './src/screens/SplashScreen'
import { useNotifications } from './src/hooks/useNotifications'

function AppWithNotifications() {
  useNotifications()
  return <Navigation />
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <View style={{ flex: 1 }}>
      <AppWithNotifications />
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
    </View>
  )
}
