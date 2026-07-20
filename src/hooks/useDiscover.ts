import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'
import { useAuth } from './useAuth'
import { getDistanceMiles } from '../lib/distance'
import { AppState } from 'react-native'

const MAX_LIKES_PER_DAY = 4
const MAX_MATCHES = 5

export type DiscoverFilters = {
  minAge: number
  maxAge: number
  maxDistance: number
}

const DEFAULT_FILTERS: DiscoverFilters = {
  minAge: 18,
  maxAge: 50,
  maxDistance: 50,
}

export function useDiscover() {
  const { session, profile } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [likesRemaining, setLikesRemaining] = useState(MAX_LIKES_PER_DAY)
  const [filters, setFilters] = useState<DiscoverFilters>(DEFAULT_FILTERS)

  useEffect(() => {
    if (profile) {
      fetchProfiles()
      fetchLikesRemaining()
    }
  }, [profile, filters])

  // Reset likes when app comes back to foreground (handles midnight reset)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        fetchLikesRemaining()
      }
    })
    return () => subscription.remove()
  }, [session])

  async function fetchLikesRemaining() {
    if (!session) return
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('daily_like_counts')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      if (data.like_date === today) {
        setLikesRemaining(Math.max(0, MAX_LIKES_PER_DAY - data.count))
      } else {
        // New day — reset the count
        await supabase
          .from('daily_like_counts')
          .update({ like_date: today, count: 0 })
          .eq('user_id', session.user.id)
        setLikesRemaining(MAX_LIKES_PER_DAY)
      }
    } else {
      setLikesRemaining(MAX_LIKES_PER_DAY)
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
      .gte('age', filters.minAge)
      .lte('age', filters.maxAge)
      .limit(50)

    if (!error && data) {
      let filtered = data as Profile[]

      if ((profile as any).lat && (profile as any).lng) {
        filtered = filtered.filter(p => {
          if (!(p as any).lat || !(p as any).lng) return true
          const dist = getDistanceMiles(
            (profile as any).lat, (profile as any).lng,
            (p as any).lat, (p as any).lng
          )
          return dist <= filters.maxDistance
        })
      }

      const sorted = filtered.sort((a, b) => {
        const distA = Math.abs(((a as any).elo_score ?? 1000) - myElo)
        const distB = Math.abs(((b as any).elo_score ?? 1000) - myElo)
        return distA - distB
      })

      setProfiles(sorted)
    }
    setLoading(false)
  }

  async function checkMatchLimit(): Promise<boolean> {
    if (!session) return false
    const { data } = await supabase
      .from('matches')
      .select('id')
      .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
    return (data?.length ?? 0) < MAX_MATCHES
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

    const canMatch = await checkMatchLimit()
    if (!canMatch) return 'conversation_limit'

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

  return { profiles, loading, likesRemaining, filters, setFilters, likeProfile, passProfile, refresh: fetchProfiles }
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

  function nextLike() { setCurrentIndex(prev => Math.min(prev + 1, likes.length - 1)) }
  function prevLike() { setCurrentIndex(prev => Math.max(prev - 1, 0)) }

  return { likes, currentLike: likes[currentIndex] ?? null, currentIndex, count, loading, nextLike, prevLike }
}
