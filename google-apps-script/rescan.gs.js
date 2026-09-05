// 這個檔案只是備份／版本紀錄用，實際要「執行」的地方是：
// 打開你的播放清單 Google Sheet → 擴充功能 → Apps Script → 貼上這整段內容
//
// 設定步驟請見 README.md 的「Google Apps Script 自動掃描設定」章節。

// 播放清單清單所在的分頁名稱（分頁下方的頁籤名稱），改過名稱要跟著改這裡
const PLAYLIST_SHEET_NAME = '工作表1'

// 掃描結果要寫入的分頁名稱，不存在的話腳本會自動建立
const TRACK_SHEET_NAME = '曲目資料'

// 開啟 Sheet 時，選單多一個手動觸發的入口：播放清單 → 重新掃描所有資料夾
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('播放清單')
    .addItem('重新掃描所有資料夾', 'rescanAllFolders')
    .addToUi()
}

// 部署成「網頁應用程式」後，網站的按鈕會打這個網址觸發掃描
function doGet(e) {
  const result = rescanAllFolders()
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  )
}

function extractFolderId_(url) {
  const match = String(url || '').match(/\/folders\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

// 主要邏輯：讀播放清單分頁的每一列資料夾連結，逐一掃描 Drive 資料夾內的音訊檔案，寫回「曲目資料」分頁
function rescanAllFolders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const playlistSheet = ss.getSheetByName(PLAYLIST_SHEET_NAME)
  if (!playlistSheet) {
    throw new Error('找不到分頁：' + PLAYLIST_SHEET_NAME)
  }

  const data = playlistSheet.getDataRange().getValues()
  const outputRows = []
  const errors = []
  let scannedFolders = 0

  for (let i = 1; i < data.length; i++) {
    const link = data[i][2] // C 欄：資料夾共享連結
    const folderId = extractFolderId_(link)
    if (!folderId) continue

    try {
      const folder = DriveApp.getFolderById(folderId)
      const files = []
      const iterator = folder.getFiles()
      while (iterator.hasNext()) {
        const file = iterator.next()
        if (/\.(mp3|m4a|wav|ogg|flac|aac)$/i.test(file.getName())) {
          files.push(file)
        }
      }
      // Drive 回傳的順序不保證，依檔名排序後再寫入
      files.sort(function (a, b) {
        return a.getName().localeCompare(b.getName(), 'zh-Hant')
      })
      files.forEach(function (file) {
        const cleanName = file.getName().replace(/\.(mp3|m4a|wav|ogg|flac|aac)$/i, '')
        outputRows.push([folderId, file.getId(), cleanName])
      })
      scannedFolders++
    } catch (err) {
      errors.push(folderId + '：' + err.message)
    }
  }

  let trackSheet = ss.getSheetByName(TRACK_SHEET_NAME)
  if (!trackSheet) {
    trackSheet = ss.insertSheet(TRACK_SHEET_NAME)
  }
  trackSheet.clearContents()
  trackSheet.appendRow(['資料夾ID', '檔案ID', '檔案名稱'])
  if (outputRows.length > 0) {
    trackSheet.getRange(2, 1, outputRows.length, 3).setValues(outputRows)
  }

  return {
    ok: true,
    scannedFolders: scannedFolders,
    totalTracks: outputRows.length,
    errors: errors,
    time: new Date().toISOString(),
  }
}
