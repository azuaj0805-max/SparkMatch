import React from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useMatches, useMessages } from '../../hooks/useMatches'
import { useAuth } from '../../hooks/useAuth'
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
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Conversations</Text>
              </View>
            )}
            {newMatches.length === 0 && conversations.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No matches yet</Text>
                <Text style={styles.emptySub}>Like someone to get started. When you match you can message each other here.</Text>
              </View>
            )}
          </>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.convoRow}
            onPress={() => navigation.navigate('Chat', { matchId: item.id, otherUser: item.other_user })}
            activeOpacity={0.7}
          >
            <Avatar name={item.other_user?.first_name ?? '?'} photo={item.other_user?.photos?.[0]} size={50} />
            <View style={styles.convoInfo}>
              <View style={styles.convoTopRow}>
                <Text style={styles.convoName}>{item.other_user?.first_name}</Text>
                {item.last_message_at && (
                  <Text style={styles.convoTime}>{formatTime(item.last_message_at)}</Text>
                )}
              </View>
              <Text style={styles.convoPreview} numberOfLines={1}>{item.last_message}</Text>
            </View>
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
  const { session } = useAuth()
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

  const myId = session?.user.id ?? ''

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Avatar name={otherUser.first_name} photo={otherUser.photos?.[0]} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>{otherUser.first_name}</Text>
          {otherUser.job_title && <Text style={styles.chatSub}>{otherUser.job_title}</Text>}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Avatar name={otherUser.first_name} photo={otherUser.photos?.[0]} size={72} />
            <Text style={styles.emptyChatTitle}>You matched with {otherUser.first_name}!</Text>
            <Text style={styles.emptyChatSub}>Send a message to get the conversation started.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const isMe = item.sender_id === myId
              const prevMsg = messages[index - 1]
              const showAvatar = !isMe && (!prevMsg || prevMsg.sender_id !== item.sender_id)
              const showName = showAvatar

              return (
                <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
                  {/* Their avatar */}
                  {!isMe && (
                    <View style={styles.msgAvatarWrap}>
                      {showAvatar
                        ? <Avatar name={otherUser.first_name} photo={otherUser.photos?.[0]} size={28} />
                        : <View style={{ width: 28 }} />
                      }
                    </View>
                  )}

                  <View style={[styles.msgContent, isMe ? styles.msgContentMe : styles.msgContentThem]}>
                    {showName && !isMe && (
                      <Text style={styles.msgSenderName}>{otherUser.first_name}</Text>
                    )}
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                      <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                        {item.content}
                      </Text>
                    </View>
                    <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              )
            }}
          />
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Message..."
            placeholderTextColor={Colors.textTertiary}
            value={text}
            onChangeText={setText}
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!text.trim()}
          >
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
  sectionHeader: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12, paddingHorizontal: Spacing.xl },
  newMatchItem: { alignItems: 'center', gap: 6, width: 60 },
  newMatchName: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  convoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.xl, paddingVertical: 12 },
  convoInfo: { flex: 1 },
  convoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  convoName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  convoPreview: { fontSize: 13, color: Colors.textSecondary },
  convoTime: { fontSize: 11, color: Colors.textTertiary },
  empty: { padding: 40, alignItems: 'center' },
  emptyIcon: { fontSize: 36, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  // Chat
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: Colors.border },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 20, color: Colors.textSecondary },
  chatName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  chatSub: { fontSize: 11, color: Colors.textSecondary },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyChatTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  emptyChatSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  messageList: { padding: Spacing.lg, paddingBottom: Spacing.xl, gap: 2 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4, gap: 6 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },
  msgAvatarWrap: { marginBottom: 4 },
  msgContent: { maxWidth: '72%', gap: 2 },
  msgContentMe: { alignItems: 'flex-end' },
  msgContentThem: { alignItems: 'flex-start' },
  msgSenderName: { fontSize: 11, color: Colors.textTertiary, marginLeft: 4, marginBottom: 2 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4, borderWidth: 0.5, borderColor: Colors.border },
  bubbleText: { fontSize: 15, color: Colors.text, lineHeight: 21 },
  bubbleTextMe: { color: '#fff' },
  msgTime: { fontSize: 10, color: Colors.textTertiary, marginLeft: 4 },
  msgTimeMe: { marginRight: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: Spacing.md, paddingBottom: Spacing.lg, borderTopWidth: 0.5, borderColor: Colors.border },
  chatInput: { flex: 1, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: Colors.text, maxHeight: 100, backgroundColor: Colors.surface },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.borderDark },
})
