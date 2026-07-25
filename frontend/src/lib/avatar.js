/**
 * Profile pictures are stored client-side only: the backend has no upload
 * endpoint, and keeping the image on the device avoids transmitting personal
 * data. Images are downscaled and re-encoded before storage so a phone photo
 * costs a few tens of KB instead of several MB.
 */
const AVATAR_KEY = 'dungoo.avatars'
const MAX_EDGE = 320
const QUALITY = 0.82

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

function readAll() {
  try {
    const raw = localStorage.getItem(AVATAR_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(AVATAR_KEY, JSON.stringify(map))
    return true
  } catch {
    return false
  }
}

/** Stable per-user key that survives profile edits. */
export function avatarKeyFor(user) {
  return String(user?.id ?? user?.email ?? 'anonymous').toLowerCase()
}

export function getAvatar(user) {
  return readAll()[avatarKeyFor(user)] ?? ''
}

export function saveAvatar(user, dataUrl) {
  const map = readAll()
  map[avatarKeyFor(user)] = dataUrl
  return writeAll(map)
}

export function removeAvatar(user) {
  const map = readAll()
  delete map[avatarKeyFor(user)]
  return writeAll(map)
}

/**
 * Centre-crops to a square and downscales to at most MAX_EDGE px, returning a
 * JPEG data URL.
 */
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const edge = Math.min(image.width, image.height)
      const size = Math.min(edge, MAX_EDGE)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size

      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Your browser could not process this image.'))
        return
      }

      context.drawImage(
        image,
        (image.width - edge) / 2,
        (image.height - edge) / 2,
        edge,
        edge,
        0,
        0,
        size,
        size
      )

      resolve(canvas.toDataURL('image/jpeg', QUALITY))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('That file could not be read as an image.'))
    }

    image.src = objectUrl
  })
}

export function validateImageFile(file) {
  if (!file) return 'Choose an image first.'
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Use a PNG, JPG, or WebP image.'
  if (file.size > MAX_UPLOAD_BYTES) return 'Images must be smaller than 5MB.'
  return null
}
