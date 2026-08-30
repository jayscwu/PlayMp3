import { usePlayer } from './PlayerContext.jsx'
import { getPreviewUrl } from '../drive/driveApi.js'

export function PlayerBar() {
  const { currentTrack, playlistName, shuffle, next, prev, toggleShuffle } = usePlayer()

  if (!currentTrack) return null

  return (
    <div className="player-bar">
      <div className="player-bar-info">
        <div className="player-bar-title">{currentTrack.name}</div>
        <div className="player-bar-subtitle">{playlistName}</div>
      </div>

      <div className="player-bar-buttons">
        <button className={`icon-btn ${shuffle ? 'active' : ''}`} onClick={toggleShuffle} title="隨機播放">
          🔀
        </button>
        <button className="icon-btn" onClick={prev} title="上一首">
          ⏮
        </button>
        <button className="icon-btn" onClick={next} title="下一首">
          ⏭
        </button>
      </div>

      <iframe
        key={currentTrack.id}
        className="player-bar-frame"
        src={getPreviewUrl(currentTrack.id)}
        title={currentTrack.name}
        allow="autoplay"
      />
    </div>
  )
}
