import { PLAYLIST_SHEET_ID } from '../config.js'
import { parseCsv } from './csv.js'

// 用 Google Sheet 的 CSV 匯出網址讀取「播放清單名稱／類別／資料夾連結／啟用」對照表。
// 這個端點對公開檢視的 Sheet 支援跨網域讀取，不需要 API Key。
function buildSheetUrl() {
  return `https://docs.google.com/spreadsheets/d/${PLAYLIST_SHEET_ID}/export?format=csv&gid=0&_=${Date.now()}`
}

function extractFolderId(url) {
  const match = (url || '').match(/\/folders\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

// 讀取 Sheet，回傳 [{ name, category, folderId }]（已濾掉「啟用」欄位為 N 的列）
// 欄位順序：A 清單名稱 / B 類別 / C 資料夾共享連結 / D 啟用
export async function fetchPlaylistSheet() {
  const res = await fetch(buildSheetUrl(), { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`無法讀取播放清單表單 (HTTP ${res.status})`)
  }
  const text = await res.text()
  const rows = parseCsv(text)

  return rows
    .slice(1) // 跳過標題列
    .filter((r) => r[0]?.trim())
    .map((r) => ({
      name: r[0].trim(),
      category: (r[1] || '').trim(),
      folderId: extractFolderId(r[2]),
      enabled: (r[3] || '').trim().toUpperCase() !== 'N',
    }))
    .filter((p) => p.enabled)
}
