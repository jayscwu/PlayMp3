import { useState } from 'react'
import { useAuth } from './auth/useAuth.js'
import { PasswordGate } from './auth/PasswordGate.jsx'
import { PlayerProvider } from './player/PlayerContext.jsx'
import { PlayerBar } from './player/PlayerBar.jsx'
import { PlaylistGrid } from './playlists/PlaylistGrid.jsx'
import { TrackList } from './playlists/TrackList.jsx'

export default function App() {
  const { isAuthed, login, logout } = useAuth()
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)

  if (!isAuthed) {
    return <PasswordGate login={login} />
  }

  return (
    <PlayerProvider>
      <div className="app">
        <header className="app-header">
          <h1>家庭音樂播放器</h1>
          <button className="logout-btn" onClick={logout}>
            登出
          </button>
        </header>

        <main className="app-main">
          {selectedPlaylist ? (
            <TrackList playlist={selectedPlaylist} onBack={() => setSelectedPlaylist(null)} />
          ) : (
            <PlaylistGrid onSelect={setSelectedPlaylist} />
          )}
        </main>

        <PlayerBar />
      </div>
    </PlayerProvider>
  )
}
