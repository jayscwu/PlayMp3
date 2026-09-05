import { useState } from 'react'
import { useAuth } from './auth/useAuth.js'
import { PasswordGate } from './auth/PasswordGate.jsx'
import { PlayerProvider } from './player/PlayerContext.jsx'
import { PlayerBar } from './player/PlayerBar.jsx'
import { PlaylistGrid } from './playlists/PlaylistGrid.jsx'
import { TrackList } from './playlists/TrackList.jsx'
import { useTheme } from './theme/useTheme.js'

const APP_TITLE = 'Mason與Emily睡前故事'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { isAuthed, login, logout } = useAuth()
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)

  const themeButton = (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={theme === 'dark' ? '切換成淺色模式' : '切換成深色模式'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )

  if (!isAuthed) {
    return <PasswordGate login={login} title={APP_TITLE} themeButton={themeButton} />
  }

  return (
    <PlayerProvider>
      <div className="app">
        <header className="app-header">
          <h1>{APP_TITLE}</h1>
          <div className="app-header-actions">
            {themeButton}
            <button className="logout-btn" onClick={logout}>
              登出
            </button>
          </div>
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
