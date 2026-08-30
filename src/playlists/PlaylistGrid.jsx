import { PLAYLISTS } from '../data/playlists.js'

export function PlaylistGrid({ onSelect }) {
  if (PLAYLISTS.length === 0) {
    return <div className="state-message error">尚未設定任何播放清單（src/data/playlists.js）</div>
  }

  return (
    <div className="playlist-grid">
      {PLAYLISTS.map((p) => (
        <button key={p.name} className="playlist-card" onClick={() => onSelect(p)}>
          <div className="playlist-card-icon">🎵</div>
          <div className="playlist-card-name">{p.name}</div>
        </button>
      ))}
    </div>
  )
}
