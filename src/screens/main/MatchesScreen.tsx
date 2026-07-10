import React from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
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
        <ActivityIndicator color={Colors.primary} size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>Meridian</Text>
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
                  contentContainerStyle={{ paddingHorizontal: Spacing.xl, gap: 16 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.newMatchItem}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        navigation.navigate('Chat', { matchId: item.id, otherUser: item.other_user })
                      }}
                    >
                      <View style={styles.newMatchAvatarWrap}>
                        <Avatar name={item.other_user?.first_name ?? '?'} photo={item.other_user?.photos?.[0]} size={56} />
                        <View style={styles.newMatchDot} />
                      </View>
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
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="chatbubble-outline" size={36} color={Colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No matches yet</Text>
                <Text style={styles.emptySub}>Like someone to get started. When you match, you can message each other here.</Text>
              </View>
            )}
          </>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.convoRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              navigation.navigate('Chat', { matchId: item.id, otherUser: item.other_user })
            }}
            activeOpacity={0.7}
          >
            <TouchableOpacity onPress={() => navigation.navigate('ViewProfile', { profile: item.other_user })}>
              <Avatar name={item.other_user?.first_name ?? '?'} photo={item.other_user?.photos?.[0]} size={52} />
            </TouchableOpacity>
            <View style={styles.convoInfo}>
              <View style={styles.convoTopRow}>
                <Text style={styles.convoName}>{item.other_user?.first_name}</Text>
                {item.last_message_at && (
                  <Text style={styles.convoTime}>{formatTime(item.last_message_at)}</Text>
                )}
              </View>
              <Text style={styles.convoPreview} numberOfLines={1}>{item.last_message}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.borderDark} />
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setText('')
    await sendMessage(msg)
  }

  const myId = session?.user.id ?? ''

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            navigation.goBack()
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chatHeaderInfo}
          onPress={() => navigation.navigate('ViewProfile', { profile: otherUser })}
          activeOpacity={0.7}
        >
          <Avatar name={otherUser.first_name} photo={otherUser.photos?.[0]} size={38} />
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>{otherUser.first_name}</Text>
            {otherUser.job_title && <Text style={styles.chatSub}>{otherUser.job_title}</Text>}
          </View>
          <View style={styles.viewProfileBtn}>
            <Text style={styles.viewProfileText}>Profile</Text>
            <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
          </View>
        </TouchableOpacity>
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
            <Avatar name={otherUser.first_name} photo={otherUser.photos?.[0]} size={80} />
            <Text style={styles.emptyChatTitle}>You matched with {otherUser.first_name}</Text>
            <Text style={styles.emptyChatSub}>Start the conversation — say something thoughtful.</Text>
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
              const nextMsg = messages[index + 1]
              const showAvatar = !isMe && (!nextMsg || nextMsg.sender_id !== item.sender_id)
              const isFirst = !prevMsg || prevMsg.sender_id !== item.sender_id
              const isLast = !nextMsg || nextMsg.sender_id !== item.sender_id

              return (
                <View style={[
                  styles.msgRow,
                  isMe ? styles.msgRowMe : styles.msgRowThem,
                  { marginBottom: isLast ? 8 : 2 }
                ]}>
                  {!isMe && (
                    <View style={styles.msgAvatarWrap}>
                      {showAvatar
                        ? <Avatar name={otherUser.first_name} photo={otherUser.photos?.[0]} size={30} />
                        : <View style={{ width: 30 }} />
                      }
                    </View>
                  )}
                  <View style={[styles.msgContent, isMe ? styles.msgContentMe : styles.msgContentThem]}>
                    <View style={[
                      styles.bubble,
                      isMe ? styles.bubbleMe : styles.bubbleThem,
                      isMe && isFirst && { borderTopRightRadius: 18 },
                      isMe && isLast && { borderBottomRightRadius: 4 },
                      !isMe && isFirst && { borderTopLeftRadius: 18 },
                      !isMe && isLast && { borderBottomLeftRadius: 4 },
                    ]}>
                      <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                        {item.content}
                      </Text>
                    </View>
                    {isLast && (
                      <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    )}
                  </View>
                </View>
              )
            }}
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
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!text.trim()}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.xl, paddingVertical: 14, borderBottomWidth: 1, borderColor: Colors.border },
  headerEyebrow: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  section: { paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  sectionHeader: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14, paddingHorizontal: Spacing.xl },
  newMatchItem: { alignItems: 'center', gap: 6, width: 64 },
  newMatchAvatarWrap: { position: 'relative' },
  newMatchDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.background },
  newMatchName: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500' },
  convoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.xl, paddingVertical: 14, borderBottomWidth: 1, borderColor: Colors.border },
  convoInfo: { flex: 1 },
  convoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  convoName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  convoPreview: { fontSize: 13, color: Colors.textSecondary },
  convoTime: { fontSize: 11, color: Colors.textTertiary },
  empty: { padding: 40, alignItems: 'center', paddingTop: 60 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border },
  backBtn: { padding: 4 },
  chatHeaderInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  chatName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  chatSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  viewProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewProfileText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 14 },
  emptyChatTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, textAlign: 'center', letterSpacing: -0.3 },
  emptyChatSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  messageList: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },
  msgAvatarWrap: { marginBottom: 4 },
  msgContent: { maxWidth: '72%', gap: 2 },
  msgContentMe: { alignItems: 'flex-end' },
  msgContentThem: { alignItems: 'flex-start' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 4 },
  bubbleMe: { backgroundColor: Colors.primary },
  bubbleThem: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { fontSize: 15, color: Colors.text, lineHeight: 21 },
  bubbleTextMe: { color: '#fff' },
  msgTime: { fontSize: 10, color: Colors.textTertiary, marginLeft: 4, marginTop: 2 },
  msgTimeMe: { marginRight: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: Spacing.md, paddingBottom: Spacing.lg, borderTopWidth: 1, borderColor: Colors.border },
  chatInput: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11, fontSize: 15, color: Colors.text, maxHeight: 100, backgroundColor: Colors.surface },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.borderDark },
})
