import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'
import { useAuth } from './useAuth'

const MAX_LIKES_PER_DAY = 4
const MAX_CONVERSATIONS = 4

export function useDiscover() {
  const { session, profile } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [likesRemaining, setLikesRemaining] = useState(MAX_LIKES_PER_DAY)

  useEffect(() => {
    if (profile) {
      fetchProfiles()
      fetchLikesRemaining()
    }
  }, [profile])

  async function fetchLikesRemaining() {
    if (!session) return
    const { data } = await supabase
      .from('daily_like_counts')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      const today = new Date().toISOString().split('T')[0]
      if (data.like_date === today) {
        setLikesRemaining(Math.max(0, MAX_LIKES_PER_DAY - data.count))
      } else {
        setLikesRemaining(MAX_LIKES_PER_DAY)
      }
    }
  }

  async function fetchProfiles() {
    if (!session || !profile) return

    const { data: alreadySeen } = await supabase
      .from('likes')
      .select('liked_id')
      .eq('liker_id', session.user.id)

    const seenIds = (alreadySeen ?? []).map((l: any) => l.liked_id)
    seenIds.push(session.user.id)

    const myElo = (profile as any).elo_score ?? 1000

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${seenIds.join(',') || 'null'})`)
      .limit(50)

    if (!error && data) {
      // Sort by Elo proximity to current user
      const sorted = (data as any[]).sort((a, b) => {
        const distA = Math.abs((a.elo_score ?? 1000) - myElo)
        const distB = Math.abs((b.elo_score ?? 1000) - myElo)
        return distA - distB
      })
      setProfiles(sorted as Profile[])
    }
    setLoading(false)
  }

  async function checkConversationLimit(): Promise<boolean> {
    if (!session) return false
    const { data } = await supabase
      .from('matches')
      .select('id')
      .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
    return (data?.length ?? 0) < MAX_CONVERSATIONS
  }

  async function incrementDailyLikes() {
    if (!session) return
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('daily_like_counts')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (data && data.like_date === today) {
      await supabase
        .from('daily_like_counts')
        .update({ count: data.count + 1 })
        .eq('user_id', session.user.id)
    } else {
      await supabase
        .from('daily_like_counts')
        .upsert({ user_id: session.user.id, like_date: today, count: 1 })
    }
    setLikesRemaining(prev => Math.max(0, prev - 1))
  }

  async function updateElo(likedId: string, isPass: boolean) {
    if (!session) return
    await supabase.rpc('update_elo_on_like', {
      liker: session.user.id,
      liked: likedId,
      is_pass: isPass,
    })
  }

  async function likeProfile(likedId: string, message?: string): Promise<'match' | 'liked' | 'no_likes' | 'conversation_limit'> {
    if (!session) return 'liked'
    if (likesRemaining <= 0) return 'no_likes'

    const canConverse = await checkConversationLimit()
    if (!canConverse) return 'conversation_limit'

    await supabase.from('likes').insert({
      liker_id: session.user.id,
      liked_id: likedId,
      message: message ?? null,
      passed: false,
    })

    await incrementDailyLikes()
    await updateElo(likedId, false)

    const { data: theirLike } = await supabase
      .from('likes')
      .select('id')
      .eq('liker_id', likedId)
      .eq('liked_id', session.user.id)
      .eq('passed', false)
      .single()

    if (theirLike) {
      await supabase.from('matches').insert({
        user1_id: session.user.id,
        user2_id: likedId,
      })
      return 'match'
    }

    return 'liked'
  }

  async function passProfile(passedId: string) {
    if (!session) return
    await supabase.from('likes').insert({
      liker_id: session.user.id,
      liked_id: passedId,
      message: null,
      passed: true,
    })
    await updateElo(passedId, true)
  }

  return { profiles, loading, likesRemaining, likeProfile, passProfile, refresh: fetchProfiles }
}

export function useLikesReceived() {
  const { session } = useAuth()
  const [likes, setLikes] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!session) return
    fetchLikes()
  }, [session])

  async function fetchLikes() {
    if (!session) return

    const { data: matchedUsers } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)

    const matchedIds = (matchedUsers ?? [])
      .flatMap((m: any) => [m.user1_id, m.user2_id])
      .filter((id: string) => id !== session.user.id)

    const query = supabase
      .from('likes')
      .select('*, liker:profiles!likes_liker_id_fkey(*)', { count: 'exact' })
      .eq('liked_id', session.user.id)
      .eq('passed', false)
      .order('created_at', { ascending: true })

    const { data, count: total } = matchedIds.length > 0
      ? await query.not('liker_id', 'in', `(${matchedIds.join(',')})`)
      : await query

    if (data) setLikes(data)
    if (total) setCount(total)
    setLoading(false)
  }

  function nextLike() {
    setCurrentIndex(prev => Math.min(prev + 1, likes.length - 1))
  }

  function prevLike() {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  const currentLike = likes[currentIndex] ?? null

  return { likes, currentLike, currentIndex, count, loading, nextLike, prevLike }
}
