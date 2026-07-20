import * as Location from 'expo-location'
import { supabase } from './supabase'

export function getDistanceMiles(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3958.8
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
  if (miles > 100) return 'Over 100 miles away'
  return `${miles} miles away`
}

export function getDistanceLabel(
  myLat: number | null, myLng: number | null,
  theirLat: number | null, theirLng: number | null,
  fallbackCity: string | null
): string {
  if (myLat && myLng && theirLat && theirLng) {
    const miles = getDistanceMiles(myLat, myLng, theirLat, theirLng)
    return formatDistance(miles)
  }
  return fallbackCity ?? ''
}

export async function updateUserLocation(userId: string) {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return null

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
    return null
  }
}
