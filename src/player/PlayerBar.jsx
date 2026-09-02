import { useEffect, useRef } from 'react'
import { usePlayer } from './PlayerContext.jsx'
import { getPreviewUrl } from '../drive/driveApi.js'

export function PlayerBar() {
  const { currentTrack, playlistName, shuffle, next, prev, toggleShuffle, isExpanded, toggleExpanded } = usePlayer()
  const barRef = useRef(null)

  // 動態量測播放列實際高度，寫入 CSS 變數，讓內容區的下方留白永遠等於播放列真正的高度
  // （不同手機/瀏覽器的字體與縮放會讓播放列高度不同，寫死的數字容易蓋住內容）
  useEffect(() => {
    const el = barRef.current
    if (!el) {
      document.documentElement.style.setProperty('--player-bar-height', '0px')
      return
    }
    const updateHeight = () => {
      document.documentElement.style.setProperty('--player-bar-height', `${el.offsetHeight}px`)
    }
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(el)
    return () => observer.disconnect()
  }, [currentTrack, isExpanded])

  if (!currentTrack) return null

  return (
    <div className="player-bar" ref={barRef}>
      <div className="player-bar-row">
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
          <button
            className="icon-btn"
            onClick={toggleExpanded}
            title={isExpanded ? '收合播放器' : '展開播放器'}
          >
            {isExpanded ? '︾' : '︽'}
          </button>
        </div>
      </div>

      <div className={`player-bar-frame-wrap ${isExpanded ? '' : 'collapsed'}`}>
        <iframe
          key={currentTrack.id}
          className="player-bar-frame"
          src={getPreviewUrl(currentTrack.id)}
          title={currentTrack.name}
          allow="autoplay"
        />
      </div>
    </div>
  )
}
