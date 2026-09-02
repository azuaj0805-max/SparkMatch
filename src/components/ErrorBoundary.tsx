import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../lib/styles'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Ionicons name="wifi-outline" size={36} color={Colors.textTertiary} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.sub}>Please check your connection and try again.</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.btnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#FAFAFA' },
  iconWrap: { width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontFamily: 'DMSans_700Bold', color: Colors.text, marginBottom: 8, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  btn: { backgroundColor: Colors.primary, borderRadius: 50, paddingVertical: 14, paddingHorizontal: 32 },
  btnText: { color: '#fff', fontSize: 15, fontFamily: 'DMSans_700Bold' },
})
