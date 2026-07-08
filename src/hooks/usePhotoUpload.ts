import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePhotoUpload() {
  const { session, refreshProfile } = useAuth()
  const [uploading, setUploading] = useState(false)

  async function pickAndUploadPhoto(): Promise<string | null> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return null

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
      base64: true,
    })

    if (result.canceled) return null
    const asset = result.assets[0]
    if (!asset || !asset.base64) return null

    setUploading(true)
    try {
      const fileName = `${session?.user.id}/${Date.now()}.jpg`

      const base64 = asset.base64
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)

      const { error: uploadError } = await supabase.storage
        .from('Photos')
        .upload(fileName, byteArray, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('Photos')
        .getPublicUrl(fileName)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('photos')
        .eq('id', session?.user.id)
        .single()

      const existingPhotos = profileData?.photos ?? []
      await supabase
        .from('profiles')
        .update({ photos: [...existingPhotos, publicUrl] })
        .eq('id', session?.user.id)

      await refreshProfile()
      return publicUrl
    } finally {
      setUploading(false)
    }
  }

  async function deletePhoto(url: string) {
    if (!session) return
    const { data: profileData } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', session.user.id)
      .single()

    const updated = (profileData?.photos ?? []).filter((p: string) => p !== url)
    await supabase
      .from('profiles')
      .update({ photos: updated })
      .eq('id', session.user.id)

    await refreshProfile()
  }

  return { pickAndUploadPhoto, deletePhoto, uploading }
}
