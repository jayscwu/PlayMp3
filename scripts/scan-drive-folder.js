// 使用方式：
// 1. 用瀏覽器打開該 Google Drive 資料夾的分享連結（資料夾與檔案需設定「知道連結的使用者可檢視」）
// 2. 按 F12 打開開發人員工具，切到 Console 分頁
// 3. 貼上這整段程式碼並按 Enter 執行
// 4. 執行完會印出 JSON，把裡面的陣列內容貼進 src/data/playlists.js 對應播放清單的 tracks

;(async function scanDriveFolder() {
  const row = document.querySelector('[role="row"][data-id]')
  if (!row) {
    console.error('找不到檔案列表，請確認頁面已完整載入資料夾內容')
    return
  }

  let el = row
  let scroller = null
  while (el && el !== document.body) {
    const style = getComputedStyle(el)
    if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      scroller = el
      break
    }
    el = el.parentElement
  }

  const collected = new Map()
  function collect() {
    document.querySelectorAll('[role="row"][data-id]').forEach((r) => {
      const id = r.getAttribute('data-id')
      const name = r.innerText.split('\n')[0]
      if (name && name.trim()) collected.set(id, name.trim())
    })
  }
  collect()

  if (scroller) {
    const step = 300
    for (let y = 0; y <= scroller.scrollHeight; y += step) {
      scroller.scrollTop = y
      await new Promise((r) => setTimeout(r, 150))
      collect()
    }
    scroller.scrollTop = scroller.scrollHeight
    await new Promise((r) => setTimeout(r, 200))
    collect()
  }

  const out = Array.from(collected.entries()).map(([id, name]) => ({
    id,
    name: name.replace(/\.mp3$/i, ''),
  }))

  console.log(`共找到 ${out.length} 個檔案`)
  console.log(JSON.stringify(out, null, 2))
})()
