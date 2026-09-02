import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { Alert } from 'react-native'

export function usePhotoUpload() {
  const { session, refreshProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  async function pickAndUploadPhoto(): Promise<string | null> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photos in Settings.')
      return null
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: false,
      quality: 0.8,
      base64: true,
    })

    if (result.canceled) return null
    const asset = result.assets?.[0]
    if (!asset || !asset.base64) {
      Alert.alert('Error', 'Could not read photo. Please try again.')
      return null
    }

    return await uploadPhoto(asset.base64)
  }

  async function uploadPhoto(base64: string): Promise<string | null> {
    if (!session) return null
    setUploading(true)
    setUploadProgress(0)

    try {
      const fileName = `${session.user.id}/${Date.now()}.jpg`
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      setUploadProgress(30)

      const { error: uploadError } = await supabase.storage
        .from('Photos')
        .upload(fileName, byteArray, { contentType: 'image/jpeg', upsert: true })

      if (uploadError) {
        Alert.alert('Upload failed', uploadError.message)
        return null
      }

      setUploadProgress(70)

      const { data: { publicUrl } } = supabase.storage
        .from('Photos')
        .getPublicUrl(fileName)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('photos')
        .eq('id', session.user.id)
        .maybeSingle()

      const existingPhotos = profileData?.photos ?? []
      await supabase
        .from('profiles')
        .update({ photos: [...existingPhotos, publicUrl] })
        .eq('id', session.user.id)

      setUploadProgress(100)
      await refreshProfile()
      return publicUrl
    } catch (e) {
      Alert.alert('Upload failed', 'Something went wrong. Please try again.')
      return null
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  async function deletePhoto(url: string) {
    if (!session) return
    const { data: profileData } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', session.user.id)
      .maybeSingle()

    const updated = (profileData?.photos ?? []).filter((p: string) => p !== url)
    await supabase
      .from('profiles')
      .update({ photos: updated })
      .eq('id', session.user.id)

    await refreshProfile()
  }

  return { pickAndUploadPhoto, deletePhoto, uploading, uploadProgress }
}
