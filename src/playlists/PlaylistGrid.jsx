import { useMemo, useState } from 'react'
import { usePlaylistSheet } from '../sheet/usePlaylistSheet.js'
import { triggerRescan } from '../sheet/rescan.js'

const ALL_CATEGORY = '全部'

export function PlaylistGrid({ onSelect }) {
  const { playlists, status, error, refresh } = usePlaylistSheet()
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY)
  const [rescanning, setRescanning] = useState(false)
  const [rescanMessage, setRescanMessage] = useState('')

  const categories = useMemo(() => {
    const set = new Set()
    playlists.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return [ALL_CATEGORY, ...Array.from(set)]
  }, [playlists])

  const filtered =
    selectedCategory === ALL_CATEGORY ? playlists : playlists.filter((p) => p.category === selectedCategory)

  async function handleRescan() {
    setRescanning(true)
    setRescanMessage('')
    try {
      await triggerRescan()
      setRescanMessage('已送出重新掃描請求，Google 需要一點時間處理（數秒到一兩分鐘），請稍後按「↻ 重新讀取清單」查看結果')
    } catch (e) {
      setRescanMessage('觸發失敗：' + e.message)
    } finally {
      setRescanning(false)
    }
  }

  return (
    <div>
      <div className="playlist-toolbar">
        <button className="refresh-btn" onClick={handleRescan} disabled={rescanning}>
          {rescanning ? '送出中…' : '🔄 重新掃描曲目'}
        </button>
        <button className="refresh-btn" onClick={refresh} disabled={status === 'loading'}>
          {status === 'loading' ? '讀取中…' : '↻ 重新讀取清單'}
        </button>
      </div>

      {rescanMessage && <div className="state-message">{rescanMessage}</div>}

      {categories.length > 1 && (
        <div className="category-tabs">
          {categories.map((c) => (
            <button
              key={c}
              className={`category-tab ${selectedCategory === c ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

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

      {status === 'ready' && filtered.length === 0 && (
        <div className="state-message">
          {playlists.length === 0 ? '播放清單表單目前是空的' : '這個類別目前沒有播放清單'}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="playlist-grid">
          {filtered.map((p) => {
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
