import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const MAX_WIDTH = 1024
const JPEG_QUALITY = 0.72

export async function pickReceiptPhoto(): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    const { photos } = await Camera.pickImages({ quality: 80, limit: 1 })
    if (!photos.length) return null
    const response = await fetch(photos[0].webPath!)
    const blob = await response.blob()
    return compressImage(await blobToBase64(blob))
  }

  return new Promise(resolve => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      resolve(compressImage(await blobToBase64(file)))
    }
    input.click()
  })
}

export async function takeReceiptPhoto(): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    })
    return photo.dataUrl ? compressImage(photo.dataUrl) : null
  }
  return pickReceiptPhoto()
}

// Resize to MAX_WIDTH and re-encode as JPEG — shrinks 900KB → ~50-80KB
function compressImage(dataUrl: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.src = dataUrl
  })
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}
