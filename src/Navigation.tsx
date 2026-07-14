import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useMatches } from './hooks/useMatches'
import { AuthScreen } from './screens/auth/AuthScreen'
import { OnboardingScreen } from './screens/onboarding/OnboardingScreen'
import { DiscoverScreen } from './screens/main/DiscoverScreen'
import { MatchesScreen, ChatScreen } from './screens/main/MatchesScreen'
import { LikesScreen, ProfileScreen } from './screens/main/ProfileScreen'
import { ViewProfileScreen } from './screens/main/ViewProfileScreen'
import { EditProfileScreen } from './screens/main/EditProfileScreen'
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
  const matches: any[] = []
  const unreadCount = matches.filter(m => m.last_message && !m.last_message_at).length
  const newMatchCount = matches.filter(m => !m.last_message).length
  const totalBadge = newMatchCount

  const tabs = [
    { name: 'Discover', icon: 'compass-outline',   iconActive: 'compass',        label: 'Discover', badge: 0 },
    { name: 'Likes',    icon: 'heart-outline',      iconActive: 'heart',          label: 'Likes',    badge: 0 },
    { name: 'Matches',  icon: 'chatbubble-outline', iconActive: 'chatbubble',     label: 'Matches',  badge: totalBadge },
    { name: 'Profile',  icon: 'person-outline',     iconActive: 'person',         label: 'Profile',  badge: 0 },
  ]

  return (
    <View style={tabStyles.bar}>
      {tabs.map((tab, i) => {
        const focused = state.index === i
        return (
          <TouchableOpacity
            key={tab.name}
            style={tabStyles.tabBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              navigation.navigate(tab.name)
            }}
            activeOpacity={0.7}
          >
            <View style={tabStyles.iconContainer}>
              <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
                <Ionicons
                  name={focused ? tab.iconActive as any : tab.icon as any}
                  size={24}
                  color={focused ? Colors.primary : Colors.textTertiary}
                />
              </View>
              {tab.badge > 0 && (
                <View style={tabStyles.badge}>
                  <Text style={tabStyles.badgeText}>
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
              {tab.label}
            </Text>
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
          <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
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
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  tabBtn: { flex: 1, alignItems: 'center', gap: 3 },
  iconContainer: { position: 'relative' },
  iconWrap: {
    width: 44, height: 34,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 17,
  },
  iconWrapActive: { backgroundColor: Colors.primaryLight },
  badge: {
    position: 'absolute',
    top: -2, right: -6,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  label: { fontSize: 10, color: Colors.textTertiary, fontWeight: '500' },
  labelActive: { color: Colors.primary, fontWeight: '700' },
})
