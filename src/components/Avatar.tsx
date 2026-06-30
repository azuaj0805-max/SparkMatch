import React from 'react'
import { View, Text, Image } from 'react-native'
import { Colors } from '../lib/styles'

const AVATAR_COLORS = [
  { bg: '#FAECE7', text: '#D85A30' },
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#EEEDFE', text: '#534AB7' },
  { bg: '#FBEAF0', text: '#993556' },
  { bg: '#FAEEDA', text: '#854F0B' },
]

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

type Props = {
  name: string
  photo?: string | null
  size?: number
  bordered?: boolean
}

export function Avatar({ name, photo, size = 48, bordered = false }: Props) {
  const { bg, text } = getAvatarColor(name)
  const fontSize = size * 0.35

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: bg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...(bordered ? { borderWidth: 2, borderColor: Colors.primary } : {}),
  }

  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={[containerStyle, { backgroundColor: bg }]}
        resizeMode="cover"
      />
    )
  }

  return (
    <View style={containerStyle}>
      <Text style={{ fontSize, fontWeight: '600', color: text }}>
        {getInitials(name)}
      </Text>
    </View>
  )
}
