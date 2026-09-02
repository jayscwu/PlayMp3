import { useCallback, useEffect, useState } from 'react'
import { fetchPlaylistSheet } from './playlistSheet.js'

export function usePlaylistSheet() {
  const [playlists, setPlaylists] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const list = await fetchPlaylistSheet()
      setPlaylists(list)
      setStatus('ready')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { playlists, status, error, refresh }
}
