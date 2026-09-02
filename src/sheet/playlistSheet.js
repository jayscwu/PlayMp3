import { PLAYLIST_SHEET_ID } from '../config.js'
import { TRACKS_BY_FOLDER } from '../data/trackManifest.js'

// 用 Google Sheet 的 CSV 匯出網址讀取「播放清單名稱／資料夾連結」對照表。
// 這個端點對公開檢視的 Sheet 支援跨網域讀取，不需要 API Key。
function buildSheetUrl() {
  return `https://docs.google.com/spreadsheets/d/${PLAYLIST_SHEET_ID}/export?format=csv&gid=0&_=${Date.now()}`
}

// 簡易 CSV 解析（支援雙引號包住的欄位、欄位內逗號、"" 轉義）
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\r') {
      // skip
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function extractFolderId(url) {
  const match = (url || '').match(/\/folders\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

// 讀取 Sheet，回傳 [{ name, folderId, tracks }]
// tracks 為 null 代表這個資料夾還沒被掃描過（見 src/data/trackManifest.js）
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
    .map((r) => {
      const name = r[0].trim()
      const folderId = extractFolderId(r[1])
      return {
        name,
        folderId,
        tracks: folderId ? (TRACKS_BY_FOLDER[folderId] ?? null) : null,
      }
    })
}
