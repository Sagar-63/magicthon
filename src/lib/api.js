/**
 * Frontend → backend API client.
 *
 * Lives in src/lib so React code can import it cleanly. Wraps the /api/*
 * endpoints with sane defaults (resizing photos before upload, error handling,
 * etc).
 */

const MAX_IMAGE_DIM = 1280 // longest side; Claude vision recommends ≤ 1.5MP
const JPEG_QUALITY = 0.85

/**
 * Resize a File/Blob to fit within MAX_IMAGE_DIM, then return its base64 data
 * (without the "data:image/...;base64," prefix) and the media type.
 */
async function resizePhotoToBase64(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })

  const img = await new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image failed to load'))
    image.src = dataUrl
  })

  const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(img, 0, 0, w, h)

  const jpeg = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  const [, b64] = jpeg.split(',', 2)
  return { data: b64, mediaType: 'image/jpeg', width: w, height: h }
}

/**
 * Call POST /api/suggest with the user's uploaded file.
 * Resizes the photo client-side first so the payload stays small.
 *
 * Returns the suggestions array on success. Throws on network/server errors.
 */
export async function fetchSuggestions(file, { signal } = {}) {
  const { data, mediaType } = await resizePhotoToBase64(file)

  const res = await fetch('/api/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData: data, mediaType }),
    signal,
  })

  if (!res.ok) {
    let detail
    try { detail = await res.json() } catch { detail = { error: res.statusText } }
    const err = new Error(detail.error || `suggest failed (${res.status})`)
    err.code = detail.code
    err.status = res.status
    throw err
  }

  const { suggestions, meta } = await res.json()
  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    throw new Error('no suggestions returned')
  }
  return { suggestions, meta }
}
