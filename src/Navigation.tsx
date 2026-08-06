import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AuthScreen } from './screens/auth/AuthScreen'
import { OnboardingScreen } from './screens/onboarding/OnboardingScreen'
import { DiscoverScreen } from './screens/main/DiscoverScreen'
import { MatchesScreen, ChatScreen } from './screens/main/MatchesScreen'
import { LikesScreen, ProfileScreen } from './screens/main/ProfileScreen'
import { ViewProfileScreen } from './screens/main/ViewProfileScreen'
import { EditProfileScreen } from './screens/main/EditProfileScreen'
import { LegalScreen } from './screens/legal/LegalScreen'
import { Colors } from './lib/styles'
import { supabase } from './lib/supabase'

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
  const { session } = useAuth()
  const [newMatchCount, setNewMatchCount] = React.useState(0)

  React.useEffect(() => {
    if (!session) return
    async function fetchCount() {
      const { data } = await supabase
        .from('matches')
        .select('id, last_message')
        .or(`user1_id.eq.${session!.user.id},user2_id.eq.${session!.user.id}`)
      const count = (data ?? []).filter((m: any) => !m.last_message).length
      setNewMatchCount(count)
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [session])

  const tabs = [
    { name: 'Discover', icon: 'compass-outline',   iconActive: 'compass',      label: 'Discover', badge: 0 },
    { name: 'Likes',    icon: 'heart-outline',      iconActive: 'heart',        label: 'Likes',    badge: 0 },
    { name: 'Matches',  icon: 'chatbubble-outline', iconActive: 'chatbubble',   label: 'Matches',  badge: newMatchCount },
    { name: 'Profile',  icon: 'person-outline',     iconActive: 'person',       label: 'Profile',  badge: 0 },
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
                <View style={tabStyles.badgeDot}>
                  <Text style={tabStyles.badgeText}>{tab.badge > 9 ? '9+' : String(tab.badge)}</Text>
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
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      {!session ? (
        <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'fade' }} />
      ) : !profile ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ animation: 'slide_from_right', animationDuration: 200 }} />
          <Stack.Screen name="ViewProfile" component={ViewProfileScreen} options={{ animation: 'slide_from_bottom', animationDuration: 300 }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ animation: 'slide_from_bottom', animationDuration: 300 }} />
          <Stack.Screen name="Legal" component={LegalScreen} options={{ animation: 'slide_from_right', animationDuration: 200 }} />
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
    borderColor: '#E8ECF4',
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  tabBtn: { flex: 1, alignItems: 'center', gap: 3 },
  iconContainer: { position: 'relative' },
  iconWrap: { width: 44, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17 },
  iconWrapActive: { backgroundColor: '#EEF1FF' },
  badgeDot: {
    position: 'absolute', top: -2, right: -4,
    backgroundColor: Colors.danger,
    borderRadius: 10, minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4, borderWidth: 2, borderColor: Colors.background,
  },
  badgeText: { fontSize: 10, fontFamily: 'DMSans_700Bold', color: '#fff' },
  label: { fontSize: 10, color: '#8896AB', fontFamily: 'DMSans_500Medium' },
  labelActive: { color: '#6E8CFF', fontFamily: 'DMSans_700Bold' },
})
