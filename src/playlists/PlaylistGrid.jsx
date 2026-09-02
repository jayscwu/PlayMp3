import { usePlaylistSheet } from '../sheet/usePlaylistSheet.js'

export function PlaylistGrid({ onSelect }) {
  const { playlists, status, error, refresh } = usePlaylistSheet()

  return (
    <div>
      <div className="playlist-toolbar">
        <button className="refresh-btn" onClick={refresh} disabled={status === 'loading'}>
          {status === 'loading' ? '讀取中…' : '↻ 重新讀取清單'}
        </button>
      </div>

      {status === 'loading' && playlists.length === 0 && <div className="state-message">載入播放清單中…</div>}

      {status === 'error' && (
        <div className="state-message error">
          無法讀取播放清單表單：{error}
          <div>
            <button className="refresh-btn" onClick={refresh}>
              重試
            </button>
          </div>
        </div>
      )}

      {status === 'ready' && playlists.length === 0 && (
        <div className="state-message">播放清單表單目前是空的</div>
      )}

      {playlists.length > 0 && (
        <div className="playlist-grid">
          {playlists.map((p) => {
            const synced = Array.isArray(p.tracks)
            return (
              <button
                key={p.folderId ?? p.name}
                className={`playlist-card ${synced ? '' : 'pending'}`}
                onClick={() => synced && onSelect(p)}
                disabled={!synced}
                title={synced ? undefined : '這個資料夾還沒有同步曲目資料'}
              >
                <div className="playlist-card-icon">{synced ? '🎵' : '⏳'}</div>
                <div className="playlist-card-name">{p.name}</div>
                {!synced && <div className="playlist-card-hint">尚未同步曲目</div>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
