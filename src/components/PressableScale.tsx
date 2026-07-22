import React, { useRef } from 'react'
import { Animated, TouchableOpacity, StyleProp, ViewStyle } from 'react-native'

type Props = {
  children: React.ReactNode
  onPress: () => void
  style?: StyleProp<ViewStyle>
  scale?: number
  disabled?: boolean
}

export function PressableScale({ children, onPress, style, scale = 0.94, disabled = false }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  function handlePressIn() {
    Animated.spring(scaleAnim, { toValue: scale, useNativeDriver: true, speed: 50, bounciness: 4 }).start()
  }

  function handlePressOut() {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start()
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  )
}
