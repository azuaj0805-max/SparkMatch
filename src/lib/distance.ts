import * as Location from 'expo-location'
import { supabase } from './supabase'

export function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

export function formatDistance(miles: number): string {
  if (miles < 1) return 'Less than a mile away'
  if (miles === 1) return '1 mile away'
  return `${miles} miles away`
}

export async function updateUserLocation(userId: string) {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })

    await supabase
      .from('profiles')
      .update({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      })
      .eq('id', userId)

    return location.coords
  } catch (e) {
    console.log('Location error:', e)
  }
}
