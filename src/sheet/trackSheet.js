import { PLAYLIST_SHEET_ID } from '../config.js'
import { parseCsv } from './csv.js'

// 「曲目資料」分頁是 Google Apps Script 掃描 Drive 資料夾後自動寫入的，
// 用分頁名稱（而非 gid）讀取，這樣分頁順序改變也不受影響。
const TRACK_SHEET_NAME = '曲目資料'

function buildTrackSheetUrl() {
  const params = new URLSearchParams({ tqx: 'out:csv', sheet: TRACK_SHEET_NAME })
  return `https://docs.google.com/spreadsheets/d/${PLAYLIST_SHEET_ID}/gviz/tq?${params.toString()}&_=${Date.now()}`
}

// 讀取「曲目資料」分頁，回傳 { [資料夾ID]: [{ id, name }, ...] }
// 分頁還沒建立（尚未跑過掃描）或讀取失敗時回傳空物件，讓播放清單顯示「尚未同步」而不是整頁報錯
export async function fetchTrackSheet() {
  let text
  try {
    const res = await fetch(buildTrackSheetUrl(), { cache: 'no-store' })
    if (!res.ok) return {}
    text = await res.text()
  } catch {
    return {}
  }

  const rows = parseCsv(text)
  const map = {}
  rows.slice(1).forEach((r) => {
    const folderId = r[0]?.trim()
    const fileId = r[1]?.trim()
    const name = (r[2] || '').trim()
    if (!folderId || !fileId) return
    if (!map[folderId]) map[folderId] = []
    map[folderId].push({ id: fileId, name: name || fileId })
  })
  return map
}
