// 使用方式：
// 1. 用「登入你自己 Google 帳號」的瀏覽器打開該 Google Drive 資料夾
//    （匿名／未登入檢視最多只會載入前 50 個檔案，超過 50 首的資料夾一定要登入才能抓全）
// 2. 按 F12 打開開發人員工具，切到 Console 分頁
// 3. 貼上這整段程式碼並按 Enter 執行（過程會持續捲動載入，檔案越多跑越久，請耐心等待）
// 4. 執行完會印出 JSON，把裡面的陣列內容貼進 src/data/trackManifest.js，用該資料夾 ID 當 key

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
  if (!scroller) {
    console.error('找不到可捲動的清單容器')
    return
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

  // 持續捲到底部並等待新一批資料載入，直到連續多次都沒有新增項目才停止
  // （Google Drive 的清單是分批載入的，捲到目前的底部後，需要等待網路請求才會出現下一批）
  let stableRounds = 0
  let lastCount = collected.size
  for (let i = 0; i < 600 && stableRounds < 8; i++) {
    scroller.scrollTop = scroller.scrollHeight
    await new Promise((r) => setTimeout(r, 400))
    collect()
    if (collected.size === lastCount) {
      stableRounds++
    } else {
      stableRounds = 0
      lastCount = collected.size
      console.log(`已載入 ${collected.size} 個檔案...`)
    }
  }

  const out = Array.from(collected.entries()).map(([id, name]) => ({
    id,
    name: name.replace(/\.mp3$/i, ''),
  }))

  console.log(`共找到 ${out.length} 個檔案`)
  console.log(JSON.stringify(out, null, 2))
})()
