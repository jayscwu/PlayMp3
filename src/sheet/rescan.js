import { RESCAN_WEB_APP_URL } from '../config.js'

// 觸發 Google Apps Script（部署成網頁應用程式）重新掃描所有資料夾。
// Apps Script 網頁應用程式的回應通常無法跨網域讀取，所以這裡用 no-cors 模式單純送出請求，
// 不等待、也讀不到掃描結果——實際完成後要靠使用者手動按「重新讀取清單」查看。
export async function triggerRescan() {
  if (!RESCAN_WEB_APP_URL) {
    throw new Error('尚未設定 RESCAN_WEB_APP_URL（見 src/config.js）')
  }
  await fetch(RESCAN_WEB_APP_URL, { mode: 'no-cors', cache: 'no-store' })
}
