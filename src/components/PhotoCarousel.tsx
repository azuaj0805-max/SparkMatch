import React, { useState } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { Colors } from '../lib/styles'

const { width } = Dimensions.get('window')

type Props = {
  photos: string[]
  height?: number
  name: string
}

export function PhotoCarousel({ photos, height = width * 1.15, name }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!photos || photos.length === 0) {
    const initial = name?.[0]?.toUpperCase() ?? '?'
    return (
      <View style={[styles.placeholder, { height }]}>
        <View style={styles.initialsCircle}>
          <Text style={styles.initialsText}>{initial}</Text>
        </View>
      </View>
    )
  }

  function handleTap(x: number) {
    const mid = width / 2
    if (x > mid && activeIndex < photos.length - 1) {
      setActiveIndex(i => i + 1)
    } else if (x < mid && activeIndex > 0) {
      setActiveIndex(i => i - 1)
    }
  }

  return (
    <View style={[styles.container, { height }]}>
      <Image
        source={{ uri: photos[activeIndex] }}
        style={styles.photo}
        contentFit="cover"
        transition={150}
      />
      <TouchableOpacity style={styles.tapLeft} onPress={(e) => handleTap(e.nativeEvent.pageX)} activeOpacity={1} />
      <TouchableOpacity style={styles.tapRight} onPress={(e) => handleTap(e.nativeEvent.pageX)} activeOpacity={1} />
      {photos.length > 1 && (
        <View style={styles.dots}>
          {photos.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: '100%', position: 'relative' },
  photo: { width: '100%', height: '100%' },
  placeholder: { backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  initialsCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 36, fontFamily: 'DMSans_700Bold', color: Colors.primary },
  tapLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%' },
  tapRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%' },
  dots: { position: 'absolute', top: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 20 },
})
