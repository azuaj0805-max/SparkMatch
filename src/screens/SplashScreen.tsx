import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native'
import { Colors } from '../lib/styles'

const { width, height } = Dimensions.get('window')

type Props = {
  onFinish: () => void
}

export function SplashScreen({ onFinish }: Props) {
  const logoScale = useRef(new Animated.Value(0.8)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const textOpacity = useRef(new Animated.Value(0)).current
  const taglineOpacity = useRef(new Animated.Value(0)).current
  const screenOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.delay(900),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish())
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoInner}>
            <Text style={styles.logoM}>M</Text>
          </View>
          <View style={styles.ring1} />
          <View style={styles.ring2} />
        </Animated.View>

        <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
          Meridian
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Where ambition meets connection
        </Animated.Text>
      </View>

      <Animated.View style={[styles.bottomDot, { opacity: taglineOpacity }]} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#101E3B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  content: { alignItems: 'center', gap: 14 },
  logoWrap: {
    width: 110, height: 110,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  logoInner: {
    width: 84, height: 84,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  logoM: {
    fontSize: 46,
    fontFamily: 'DMSans_700Bold',
    color: '#fff',
    letterSpacing: -2,
  },
  ring1: {
    position: 'absolute',
    width: 96, height: 96,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(110, 140, 255, 0.3)',
  },
  ring2: {
    position: 'absolute',
    width: 110, height: 110,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(110, 140, 255, 0.12)',
  },
  appName: {
    fontSize: 38,
    fontFamily: 'DMSans_700Bold',
    color: '#fff',
    letterSpacing: -1.2,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.3,
  },
  bottomDot: {
    position: 'absolute',
    bottom: 52,
    width: 5, height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
})
