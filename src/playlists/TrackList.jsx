import { useEffect, useMemo, useState } from 'react'
import { usePlayer } from '../player/PlayerContext.jsx'

const PAGE_SIZE = 30

export function TrackList({ playlist, onBack }) {
  const { playlistName, currentTrack, loadPlaylist, playTrackAt } = usePlayer()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    // 若這個播放清單已經是目前播放中的清單，就不要重新載入，避免打斷播放進度
    if (playlistName !== playlist.name) {
      loadPlaylist(playlist.name, playlist.tracks)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist.name])

  useEffect(() => {
    setPage(1)
  }, [search, playlist.name])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return playlist.tracks.map((track, index) => ({ track, index }))
    return playlist.tracks
      .map((track, index) => ({ track, index }))
      .filter(({ track }) => track.name.toLowerCase().includes(q))
  }, [playlist.tracks, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

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
        <>
          <div className="track-search">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`搜尋曲目（共 ${playlist.tracks.length} 首）`}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="state-message">找不到符合「{search}」的曲目</div>
          ) : (
            <>
              <ul className="track-list">
                {pageItems.map(({ track, index }) => {
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

              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                    ← 上一頁
                  </button>
                  <span className="pagination-info">
                    第 {currentPage} / {totalPages} 頁
                  </span>
                  <button disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
                    下一頁 →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
