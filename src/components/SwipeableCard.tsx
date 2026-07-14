import React, { useRef } from 'react'
import {
  Animated, PanResponder, Dimensions, View, StyleSheet,
} from 'react-native'
import { Colors } from '../lib/styles'
import * as Haptics from 'expo-haptics'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25
const SWIPE_OUT_DURATION = 250

type Props = {
  children: React.ReactNode
  onSwipeLeft: () => void
  onSwipeRight: () => void
}

export function SwipeableCard({ children, onSwipeLeft, onSwipeRight }: Props) {
  const position = useRef(new Animated.ValueXY()).current
  const swipeDirection = useRef<'left' | 'right' | null>(null)
  const likeOpacity = useRef(new Animated.Value(0)).current
  const nopeOpacity = useRef(new Animated.Value(0)).current

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-6deg', '0deg', '6deg'],
    extrapolate: 'clamp',
  })

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.3 })

        // Show like/nope labels
        if (gesture.dx > 0) {
          likeOpacity.setValue(Math.min(gesture.dx / 100, 1))
          nopeOpacity.setValue(0)
          if (gesture.dx > SWIPE_THRESHOLD && swipeDirection.current !== 'right') {
            swipeDirection.current = 'right'
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }
        } else {
          nopeOpacity.setValue(Math.min(Math.abs(gesture.dx) / 100, 1))
          likeOpacity.setValue(0)
          if (gesture.dx < -SWIPE_THRESHOLD && swipeDirection.current !== 'left') {
            swipeDirection.current = 'left'
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right')
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left')
        } else {
          resetPosition()
        }
      },
    })
  ).current

  function forceSwipe(direction: 'left' | 'right') {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 })
      likeOpacity.setValue(0)
      nopeOpacity.setValue(0)
      swipeDirection.current = null
      if (direction === 'right') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        onSwipeRight()
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onSwipeLeft()
      }
    })
  }

  function resetPosition() {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start()
    Animated.timing(likeOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start()
    Animated.timing(nopeOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start()
    swipeDirection.current = null
  }

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
  }

  return (
    <Animated.View style={[styles.container, cardStyle]} {...panResponder.panHandlers}>
      {/* Like label */}
      <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
        <View style={styles.likeLabelInner}>
          <Animated.Text style={styles.likeLabelText}>LIKE</Animated.Text>
        </View>
      </Animated.View>

      {/* Nope label */}
      <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
        <View style={styles.nopeLabelInner}>
          <Animated.Text style={styles.nopeLabelText}>PASS</Animated.Text>
        </View>
      </Animated.View>

      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  likeLabel: {
    position: 'absolute',
    top: 24,
    left: 20,
    zIndex: 10,
    transform: [{ rotate: '-15deg' }],
  },
  likeLabelInner: {
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  likeLabelText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2,
  },
  nopeLabel: {
    position: 'absolute',
    top: 24,
    right: 20,
    zIndex: 10,
    transform: [{ rotate: '15deg' }],
  },
  nopeLabelInner: {
    borderWidth: 3,
    borderColor: Colors.danger,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  nopeLabelText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.danger,
    letterSpacing: 2,
  },
})
