import React from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useMatches, useMessages } from '../../hooks/useMatches'
import { Avatar } from '../../components/Avatar'
import { Colors, Spacing, Radius, GlobalStyles } from '../../lib/styles'
import { Profile } from '../../types'

export function MatchesScreen() {
  const { matches, loading } = useMatches()
  const navigation = useNavigation<any>()

  const newMatches = matches.filter(m => !m.last_message)
  const conversations = matches.filter(m => !!m.last_message)

  if (loading) {
    return (
      <SafeAreaView style={[GlobalStyles.safeArea, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={m => m.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        ListHeaderComponent={() => (
          <>
            {newMatches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>New matches</Text>
                <FlatList
                  horizontal
                  data={newMatches}
                  keyExtractor={m => m.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: Spacing.xl, gap: 14 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.newMatchItem}
                      onPress={() => navigation.navigate('Chat', { matchId: item.id, otherUser: item.other_user })}
                    >
                      <Avatar name={item.other_user?.first_name ?? '?'} photo={item.other_user?.photos?.[0]} size={54} bordered />
                      <Text style={styles.newMatchName} numberOfLines={1}>{item.other_user?.first_name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
            {conversations.length > 0 && (
              <Text style={[styles.sectionTitle, { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg }]}>Conversations</Text>
            )}
          </>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySub}>Like someone to get started.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.convoRow}
            onPress={() => navigation.navigate('Chat', { matchId: item.id, otherUser: item.other_user })}
            activeOpacity={0.7}
          >
            <Avatar name={item.other_user?.first_name ?? '?'} photo={item.other_user?.photos?.[0]} size={50} />
            <View style={styles.convoInfo}>
              <Text style={styles.convoName}>{item.other_user?.first_name}</Text>
              <Text style={styles.convoPreview} numberOfLines={1}>{item.last_message ?? 'New match!'}</Text>
            </View>
            {item.last_message_at && (
              <Text style={styles.convoTime}>{formatTime(item.last_message_at)}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return `${Math.floor(diff / 86400000)}d`
}

export function ChatScreen({ route }: any) {
  const { matchId, otherUser } = route.params as { matchId: string; otherUser: Profile }
  const { messages, loading, sendMessage } = useMessages(matchId)
  const [text, setText] = React.useState('')
  const flatRef = React.useRef<FlatList>(null)
  const navigation = useNavigation<any>()

  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages.length])

  async function handleSend() {
    const msg = text.trim()
    if (!msg) return
    setText('')
    await sendMessage(msg)
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Text style={{ fontSize: 20, color: Colors.textSecondary }}>←</Text>
        </TouchableOpacity>
        <Avatar name={otherUser.first_name} photo={otherUser.photos?.[0]} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>{otherUser.first_name}</Text>
          <Text style={styles.chatSub}>{otherUser.job_title ?? ''}</Text>
        </View>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.bubbleWrap, item.sender_id === '' ? styles.bubbleWrapMe : styles.bubbleWrapThem]}>
                <View style={[styles.bubble, item.sender_id === '' ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={[styles.bubbleText, item.sender_id === '' && { color: '#fff' }]}>{item.content}</Text>
                </View>
              </View>
            )}
          />
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Message..."
            placeholderTextColor={Colors.textTertiary}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.8}>
            <Text style={{ color: '#fff', fontSize: 16 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: 14, borderBottomWidth: 0.5, borderColor: Colors.border },
  headerTitle: { fontSize: 22, fontWeight: '600', color: Colors.text },
  section: { paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  newMatchItem: { alignItems: 'center', gap: 6, width: 60 },
  newMatchName: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  convoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.xl, paddingVertical: 12 },
  convoInfo: { flex: 1 },
  convoName: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  convoPreview: { fontSize: 13, color: Colors.textSecondary },
  convoTime: { fontSize: 11, color: Colors.textTertiary },
  empty: { padding: 40, alignItems: 'center' },
  emptyIcon: { fontSize: 36, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: Colors.border },
  chatName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  chatSub: { fontSize: 11, color: Colors.textSecondary },
  messageList: { padding: Spacing.lg, gap: 8 },
  bubbleWrap: { flexDirection: 'row', marginBottom: 4 },
  bubbleWrapMe: { justifyContent: 'flex-end' },
  bubbleWrapThem: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '75%', padding: 11, borderRadius: 16 },
  bubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: Spacing.md, paddingBottom: Spacing.lg, borderTopWidth: 0.5, borderColor: Colors.border },
  chatInput: { flex: 1, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.text, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
})
