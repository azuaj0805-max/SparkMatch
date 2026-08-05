import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Match, Message } from '../types'
import { useAuth } from './useAuth'

async function sendPushNotification(userId: string, title: string, body: string, data?: any) {
  try {
    await supabase.functions.invoke('send-push-notification', {
      body: { user_id: userId, title, body, data },
    })
  } catch (e) {
    console.log('Push notification error:', e)
  }
}

export function useMatches() {
  const { session } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    fetchMatches()
    updateLastActive()

    const sub = supabase
      .channel(`matches-${session.user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches',
      }, () => fetchMatches())
      .subscribe()

    const interval = setInterval(updateLastActive, 120000)

    return () => {
      supabase.removeChannel(sub)
      clearInterval(interval)
    }
  }, [session])

  async function updateLastActive() {
    if (!session) return
    await supabase
      .from('profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('id', session.user.id)
  }

  async function fetchMatches() {
    if (!session) return
    const userId = session.user.id

    const { data, error } = await supabase
      .from('matches')
      .select(`*, user1:profiles!matches_user1_id_fkey(*), user2:profiles!matches_user2_id_fkey(*)`)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (!error && data) {
      const formatted = data.map((m: any) => ({
        ...m,
        other_user: m.user1_id === userId ? m.user2 : m.user1,
      }))
      setMatches(formatted)
    }
    setLoading(false)
  }

  return { matches, loading, refresh: fetchMatches }
}

export function useMessages(matchId: string) {
  const { session } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const typingTimeout = useRef<any>(null)

  useEffect(() => {
    fetchMessages()

    const sub = supabase
      .channel(`messages-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
        markMessagesAsRead(matchId)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`,
      }, (payload) => {
        // Check if other user is typing
        if (!session) return
        const match = payload.new as any
        const isUser1 = match.user1_id === session.user.id
        const otherTyping = isUser1 ? match.user2_typing : match.user1_typing
        setIsOtherTyping(otherTyping)
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [matchId])

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data as Message[])
      markMessagesAsRead(matchId)
    }
    setLoading(false)
  }

  async function markMessagesAsRead(matchId: string) {
    if (!session) return
    await supabase
      .from('messages')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('match_id', matchId)
      .neq('sender_id', session.user.id)
      .eq('read', false)
  }

  async function setTyping(isTyping: boolean) {
    if (!session) return
    const { data: match } = await supabase
      .from('matches')
      .select('user1_id')
      .eq('id', matchId)
      .maybeSingle()

    if (!match) return
    const isUser1 = match.user1_id === session.user.id
    const field = isUser1 ? 'user1_typing' : 'user2_typing'

    await supabase
      .from('matches')
      .update({ [field]: isTyping })
      .eq('id', matchId)
  }

  function handleTyping() {
    setTyping(true)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => setTyping(false), 3000)
  }

  async function sendMessage(content: string) {
    if (!session) return

    // Stop typing indicator
    setTyping(false)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)

    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: session.user.id,
      content,
      read: false,
    })

    if (!error) {
      await supabase
        .from('matches')
        .update({ last_message: content, last_message_at: new Date().toISOString() })
        .eq('id', matchId)

      const { data: match } = await supabase
        .from('matches')
        .select('user1_id, user2_id, user1:profiles!matches_user1_id_fkey(first_name), user2:profiles!matches_user2_id_fkey(first_name)')
        .eq('id', matchId)
        .maybeSingle()

      if (match) {
        const otherId = match.user1_id === session.user.id ? match.user2_id : match.user1_id
        const myName = match.user1_id === session.user.id ? (match.user1 as any).first_name : (match.user2 as any).first_name

        await sendPushNotification(
          otherId,
          `New message from ${myName}`,
          content.length > 50 ? content.substring(0, 50) + '...' : content,
          { matchId, type: 'message' }
        )
      }
    }

    return error
  }

  return { messages, loading, isOtherTyping, sendMessage, handleTyping }
}
