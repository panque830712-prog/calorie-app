export async function compressImage(
  file: File,
  maxDimension = 1024,
  quality = 0.75
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const { width, height } = img
      let newW = width, newH = height
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          newW = maxDimension; newH = Math.round(height * maxDimension / width)
        } else {
          newH = maxDimension; newW = Math.round(width * maxDimension / height)
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = newW; canvas.height = newH
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, newW, newH)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('壓縮失敗')),
        'image/webp', quality
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('圖片載入失敗')) }
    img.src = url
  })
}

export async function createThumbnail(blob: Blob, size = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const { width, height } = img
      const ratio = Math.min(size / width, size / height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/webp', 0.6))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('縮圖失敗')) }
    img.src = url
  })
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function base64ToBlob(base64: string): Blob {
  const [header, data] = base64.split(',')
  const mimeMatch = header.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/webp'
  const bytes = atob(data)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export function blobToUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}
