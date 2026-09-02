export const APP_PASSWORD_HASH = import.meta.env.VITE_APP_PASSWORD_HASH

// 播放清單設定表（Google Sheet）的 ID，不是機密資料，直接寫在程式碼裡。
// 這份表決定了「有哪些播放清單、對應哪個 Drive 資料夾」，可隨時編輯，網站會自動讀取最新內容。
export const PLAYLIST_SHEET_ID = '1boptt7izenzRh0x9dbY5YBMe6BVQPwU8QnAwptEB_tU'
