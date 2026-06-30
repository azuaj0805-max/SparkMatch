import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AuthScreen } from './screens/auth/AuthScreen'
import { OnboardingScreen } from './screens/onboarding/OnboardingScreen'
import { DiscoverScreen } from './screens/main/DiscoverScreen'
import { MatchesScreen, ChatScreen } from './screens/main/MatchesScreen'
import { LikesScreen, ProfileScreen } from './screens/main/ProfileScreen'
import { Colors } from './lib/styles'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Likes" component={LikesScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

function CustomTabBar({ state, navigation }: any) {
  const tabs = [
    { name: 'Discover', icon: '🔥', label: 'Discover' },
    { name: 'Likes',    icon: '♥',  label: 'Likes' },
    { name: 'Matches',  icon: '💬', label: 'Matches' },
    { name: 'Profile',  icon: '👤', label: 'Profile' },
  ]
  return (
    <View style={tabStyles.bar}>
      {tabs.map((tab, i) => {
        const focused = state.index === i
        return (
          <TouchableOpacity
            key={tab.name}
            style={tabStyles.tabBtn}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.7}
          >
            <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>{tab.icon}</Text>
            <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

function RootNavigator() {
  const { session, profile, loading } = useAuth()
  if (loading) return null

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : !profile ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function Navigation() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  )
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    paddingTop: 10,
    paddingBottom: 24,
  },
  tabBtn: { flex: 1, alignItems: 'center', gap: 3 },
  icon: { fontSize: 22, opacity: 0.4 },
  iconActive: { opacity: 1 },
  label: { fontSize: 10, color: Colors.textTertiary },
  labelActive: { color: Colors.primary, fontWeight: '600' },
})
