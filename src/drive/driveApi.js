// Google Drive 檔案的內嵌預覽播放器網址，可放進 <iframe src>
// 不需要 Google Drive API 或 API Key，前提是檔案已設定「知道連結的使用者可檢視」
export function getPreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`
}
