/** Generate a 6-character base32 ID (no ambiguous chars). */
export function generateId(len = 6) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  let id = ''
  for (let i = 0; i < len; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}
