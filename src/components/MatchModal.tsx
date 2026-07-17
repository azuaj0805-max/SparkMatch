import React, { useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Colors, Radius, Spacing } from '../lib/styles'

const { width } = Dimensions.get('window')

type Props = {
  visible: boolean
  onSendMessage: () => void
  onKeepDiscovering: () => void
}

export function MatchModal({ visible, onSendMessage, onKeepDiscovering }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const heartScale = useRef(new Animated.Value(0)).current
  const ring1Scale = useRef(new Animated.Value(0)).current
  const ring2Scale = useRef(new Animated.Value(0)).current
  const ring1Opacity = useRef(new Animated.Value(0)).current
  const ring2Opacity = useRef(new Animated.Value(0)).current
  const titleSlide = useRef(new Animated.Value(30)).current
  const titleOpacity = useRef(new Animated.Value(0)).current
  const btnOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Reset
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)
      heartScale.setValue(0)
      ring1Scale.setValue(0)
      ring2Scale.setValue(0)
      ring1Opacity.setValue(0)
      ring2Opacity.setValue(0)
      titleSlide.setValue(30)
      titleOpacity.setValue(0)
      btnOpacity.setValue(0)

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      Animated.sequence([
        // Fade in overlay
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        // Card pops in
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
        // Heart appears with bounce
        Animated.spring(heartScale, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }),
        // Rings pulse out
        Animated.parallel([
          Animated.spring(ring1Scale, { toValue: 1.4, tension: 40, friction: 6, useNativeDriver: true }),
          Animated.timing(ring1Opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
          Animated.spring(ring2Scale, { toValue: 1.8, tension: 30, friction: 6, useNativeDriver: true }),
          Animated.timing(ring2Opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
        // Title slides up
        Animated.parallel([
          Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(titleSlide, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        // Buttons appear
        Animated.timing(btnOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
    }
  }, [visible])

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>

          {/* Heart with rings */}
          <View style={styles.heartContainer}>
            <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]} />
            <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: ring1Scale }], opacity: ring1Opacity }]} />
            <Animated.View style={[styles.heartWrap, { transform: [{ scale: heartScale }] }]}>
              <Ionicons name="heart" size={40} color={Colors.primary} />
            </Animated.View>
          </View>

          {/* Text */}
          <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleSlide }] }}>
            <Text style={styles.title}>It's a match! 🎉</Text>
            <Text style={styles.sub}>You and this person both liked each other. Don't leave them waiting — say something!</Text>
          </Animated.View>

          {/* Buttons */}
          <Animated.View style={[styles.buttons, { opacity: btnOpacity }]}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onSendMessage() }}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Send a message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onKeepDiscovering}>
              <Text style={styles.secondaryBtnText}>Keep discovering</Text>
            </TouchableOpacity>
          </Animated.View>

        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.xxl,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  heartContainer: {
    width: 100, height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
  },
  ring1: {
    width: 80, height: 80,
    borderColor: Colors.primary,
  },
  ring2: {
    width: 80, height: 80,
    borderColor: Colors.primaryLight,
  },
  heartWrap: {
    width: 80, height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttons: { width: '100%', gap: 10, marginTop: 8 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
})
