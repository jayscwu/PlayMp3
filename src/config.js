export const APP_PASSWORD_HASH = import.meta.env.VITE_APP_PASSWORD_HASH

// 播放清單設定表（Google Sheet）的 ID，不是機密資料，直接寫在程式碼裡。
// 這份表決定了「有哪些播放清單、對應哪個 Drive 資料夾」，可隨時編輯，網站會自動讀取最新內容。
export const PLAYLIST_SHEET_ID = '1boptt7izenzRh0x9dbY5YBMe6BVQPwU8QnAwptEB_tU'

// Google Apps Script 部署成「網頁應用程式」後的網址，網站的「重新掃描曲目」按鈕會打這個網址。
// 見 README「Google Apps Script 自動掃描設定」；部署完成前留空，按鈕會顯示錯誤訊息。
export const RESCAN_WEB_APP_URL = ''
