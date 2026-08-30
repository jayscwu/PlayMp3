import { useCallback, useState } from 'react'
import { APP_PASSWORD_HASH } from '../config.js'

const STORAGE_KEY = 'playmp3_authed'

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function useAuth() {
  const [isAuthed, setIsAuthed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  )

  const login = useCallback(async (password) => {
    const hash = await sha256Hex(password)
    const ok = hash === APP_PASSWORD_HASH
    if (ok) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setIsAuthed(true)
    }
    return ok
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setIsAuthed(false)
  }, [])

  return { isAuthed, login, logout }
}
