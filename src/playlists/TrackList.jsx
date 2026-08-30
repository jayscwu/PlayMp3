import { useEffect } from 'react'
import { usePlayer } from '../player/PlayerContext.jsx'

export function TrackList({ playlist, onBack }) {
  const { playlistName, currentTrack, loadPlaylist, playTrackAt } = usePlayer()

  useEffect(() => {
    // 若這個播放清單已經是目前播放中的清單，就不要重新載入，避免打斷播放進度
    if (playlistName !== playlist.name) {
      loadPlaylist(playlist.name, playlist.tracks)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist.name])

  return (
    <div className="track-list-page">
      <div className="track-list-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回播放清單
        </button>
        <h2>{playlist.name}</h2>
      </div>

      {playlist.tracks.length === 0 && <div className="state-message">這個播放清單目前沒有 mp3 檔案</div>}

      {playlist.tracks.length > 0 && (
        <ul className="track-list">
          {playlist.tracks.map((track, index) => {
            const isCurrent = playlistName === playlist.name && currentTrack?.id === track.id
            return (
              <li
                key={track.id}
                className={`track-item ${isCurrent ? 'active' : ''}`}
                onClick={() => playTrackAt(index)}
              >
                <span className="track-item-status">{isCurrent ? '🎵' : index + 1}</span>
                <span className="track-item-name">{track.name}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
