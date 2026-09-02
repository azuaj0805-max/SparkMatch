import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Image } from 'react-native'

type Props = {
  onFinish: () => void
}

export function SplashScreen({ onFinish }: Props) {
  const logoScale = useRef(new Animated.Value(0.85)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
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
      Animated.delay(1000),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish())
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
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
  logoWrap: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 40,
  },
})
