import { createContext, useCallback, useContext, useState } from 'react'

const PlayerContext = createContext(null)

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function PlayerProvider({ children }) {
  const [playlistName, setPlaylistName] = useState(null)
  const [tracks, setTracks] = useState([])
  const [order, setOrder] = useState([])
  const [position, setPosition] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const currentIndex = order.length ? order[position] : -1
  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] : null

  const loadPlaylist = useCallback(
    (name, newTracks) => {
      const identity = newTracks.map((_, i) => i)
      setPlaylistName(name)
      setTracks(newTracks)
      setOrder(shuffle ? shuffleArray(identity) : identity)
      setPosition(0)
    },
    [shuffle]
  )

  const playTrackAt = useCallback(
    (index) => {
      const pos = order.indexOf(index)
      setPosition(pos === -1 ? 0 : pos)
      setIsExpanded(true) // 選新曲目時自動展開播放器，方便馬上按播放
    },
    [order]
  )

  const toggleExpanded = useCallback(() => {
    setIsExpanded((v) => !v)
  }, [])

  const next = useCallback(() => {
    setPosition((p) => (order.length ? (p + 1) % order.length : 0))
  }, [order.length])

  const prev = useCallback(() => {
    setPosition((p) => (order.length ? (p - 1 + order.length) % order.length : 0))
  }, [order.length])

  const toggleShuffle = useCallback(() => {
    setShuffle((prevShuffle) => {
      const next = !prevShuffle
      setOrder((prevOrder) => {
        const currentTrackIdx = prevOrder[position]
        let newOrder
        if (next) {
          const rest = tracks.map((_, i) => i).filter((i) => i !== currentTrackIdx)
          newOrder = currentTrackIdx === undefined ? shuffleArray(rest) : [currentTrackIdx, ...shuffleArray(rest)]
        } else {
          newOrder = tracks.map((_, i) => i)
        }
        setPosition(currentTrackIdx === undefined ? 0 : newOrder.indexOf(currentTrackIdx))
        return newOrder
      })
      return next
    })
  }, [tracks, position])

  const value = {
    playlistName,
    tracks,
    currentTrack,
    shuffle,
    isExpanded,
    loadPlaylist,
    playTrackAt,
    next,
    prev,
    toggleShuffle,
    toggleExpanded,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer 必須在 PlayerProvider 內使用')
  return ctx
}
