import { useCallback, useEffect, useState } from 'react'
import { fetchPlaylistSheet } from './playlistSheet.js'
import { fetchTrackSheet } from './trackSheet.js'

export function usePlaylistSheet() {
  const [playlists, setPlaylists] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const [rows, tracksByFolder] = await Promise.all([fetchPlaylistSheet(), fetchTrackSheet()])
      const list = rows.map((row) => ({
        name: row.name,
        category: row.category,
        folderId: row.folderId,
        tracks: row.folderId ? (tracksByFolder[row.folderId] ?? null) : null,
      }))
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
