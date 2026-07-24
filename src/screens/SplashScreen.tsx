import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native'
import { Colors } from '../lib/styles'

const { width, height } = Dimensions.get('window')

type Props = {
  onFinish: () => void
}

export function SplashScreen({ onFinish }: Props) {
  const logoScale = useRef(new Animated.Value(0.3)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const textOpacity = useRef(new Animated.Value(0)).current
  const taglineOpacity = useRef(new Animated.Value(0)).current
  const screenOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.sequence([
      // Logo appears
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // App name appears
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Tagline appears
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(800),
      // Fade out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish())
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <View style={styles.content}>
        {/* Logo mark */}
        <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoInner}>
            <Text style={styles.logoM}>M</Text>
          </View>
          {/* Decorative rings */}
          <View style={styles.ring1} />
          <View style={styles.ring2} />
        </Animated.View>

        {/* App name */}
        <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
          Meridian
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Where ambition meets connection
        </Animated.Text>
      </View>

      {/* Bottom dot */}
      <Animated.View style={[styles.bottomDot, { opacity: taglineOpacity }]} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "#101E3B",
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  content: { alignItems: 'center', gap: 16 },
  logoWrap: {
    width: 100, height: 100,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  logoInner: {
    width: 80, height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  logoM: {
    fontSize: 44, fontWeight: '800',
    color: '#fff', letterSpacing: -2,
  },
  ring1: {
    position: 'absolute',
    width: 92, height: 92,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(110, 140, 255, 0.3)',
  },
  ring2: {
    position: 'absolute',
    width: 106, height: 106,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(110, 140, 255, 0.15)',
  },
  appName: {
    fontSize: 36, fontWeight: '800',
    color: '#fff', letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.2,
  },
  bottomDot: {
    position: 'absolute',
    bottom: 48,
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
})
