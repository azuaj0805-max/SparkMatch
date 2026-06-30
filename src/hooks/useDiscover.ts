import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'
import { useAuth } from './useAuth'

export function useDiscover() {
  const { session, profile } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) fetchProfiles()
  }, [profile])

  async function fetchProfiles() {
    if (!session || !profile) return

    const { data: alreadySeen } = await supabase
      .from('likes')
      .select('liked_id')
      .eq('liker_id', session.user.id)

    const seenIds = (alreadySeen ?? []).map((l: any) => l.liked_id)
    seenIds.push(session.user.id)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${seenIds.join(',') || 'null'})`)
      .limit(20)

    if (!error && data) setProfiles(data as Profile[])
    setLoading(false)
  }

  async function likeProfile(likedId: string, message?: string): Promise<'match' | 'liked'> {
    if (!session) return 'liked'

    await supabase.from('likes').insert({
      liker_id: session.user.id,
      liked_id: likedId,
      message: message ?? null,
      passed: false,
    })

    const { data: theirLike } = await supabase
      .from('likes')
      .select('id')
      .eq('liker_id', likedId)
      .eq('liked_id', session.user.id)
      .single()

    if (theirLike) {
      await supabase.from('matches').insert({
        user1_id: session.user.id,
        user2_id: likedId,
      })
      removeFromStack(likedId)
      return 'match'
    }

    removeFromStack(likedId)
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
    removeFromStack(passedId)
  }

  function removeFromStack(id: string) {
    setProfiles(prev => prev.filter(p => p.id !== id))
  }

  return { profiles, loading, likeProfile, passProfile, refresh: fetchProfiles }
}

export function useLikesReceived() {
  const { session } = useAuth()
  const [likes, setLikes] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    fetchLikes()
  }, [session])

  async function fetchLikes() {
    if (!session) return

    const { data, count: total } = await supabase
      .from('likes')
      .select('*, liker:profiles!likes_liker_id_fkey(*)', { count: 'exact' })
      .eq('liked_id', session.user.id)
      .eq('passed', false)

    if (data) setLikes(data)
    if (total) setCount(total)
    setLoading(false)
  }

  return { likes, count, loading }
}
