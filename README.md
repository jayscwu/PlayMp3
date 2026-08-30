# 家庭音樂播放器（PlayMP3）

播放存放在 Google 雲端硬碟裡的 mp3 檔案的網頁播放器。每個 Google Drive 資料夾視為一個播放清單。純前端架構，部署在 GitHub Pages，不需要自建後端，也**不使用 Google Drive API / API Key**。

## 運作方式

- 每個播放清單就是一個 Google Drive 資料夾，資料夾底下直接放 mp3 檔案，資料夾與檔案都需設定為「知道連結的使用者可檢視」。
- 播放清單的名稱與曲目清單（檔名＋Drive 檔案 ID）寫死在 [src/data/playlists.js](src/data/playlists.js) 裡，屬於程式碼的一部分。新增/移除播放清單或曲目時，需要更新這個檔案並重新部署（見下方「新增／更新播放清單」）。
- 播放器實際上是嵌入 Google Drive 官方的檔案預覽播放器（iframe），不透過 Google Drive API，也不需要 API Key。網頁上的「上一首／下一首／隨機播放」按鈕是靠切換 iframe 載入的檔案做到的。
  - **已知限制**：因為是跨網域的 iframe，我們的網頁程式無法得知 Google 播放器何時播完一首歌，所以**沒有「自動播放下一首」也沒有「自動重複播放」**，只能手動按「下一首」切歌。播放/暫停、進度、音量都是 Google 播放器自己的介面。
  - 之所以不用 Google Drive API：實測過用 API Key 直接串流可以做到自動接歌與重複播放等完整需求，但需要在 Google Cloud Console 設定 API Key，稍微繁瑣；目前選擇的方案是設定完全免設定，但功能有前述限制。如果之後想要完整的自動播放/循環功能，可以再改回 API Key 方案。
- 登入用一組簡單密碼把關（僅雜湊值存在程式碼中，原始密碼不會進 git），**這不是真正的安全機制**，只能防止陌生人隨手點進網址，請勿存放機密或版權敏感內容並公開分享網址。

## 事前準備

### 1. 確認 Google Drive 分享權限

每個播放清單資料夾、以及裡面的 mp3 檔案，都需設定共用權限為「知道連結的使用者」可檢視（在 Drive 資料夾按右鍵 →「共用」→「一般access」改成「知道連結的使用者」，權限「檢視者」）。

### 2. 產生登入密碼的雜湊值

自訂一組密碼後，用以下任一方式算出 SHA-256 雜湊值（十六進位小寫），**不要把明文密碼放進程式碼或 git**：

PowerShell：
```powershell
$password = "你的密碼"
$hash = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($password))) -replace '-',''
$hash.ToLower()
```

或用 Node.js：
```bash
node -e "console.log(require('crypto').createHash('sha256').update('你的密碼').digest('hex'))"
```

## 本機開發

需要 Node.js 18 以上版本。

```bash
npm install
cp .env.example .env.local
```

編輯 `.env.local`，填入 `VITE_APP_PASSWORD_HASH`（密碼的 SHA-256 雜湊值）。

```bash
npm run dev
```

打開瀏覽器顯示的網址即可測試。

## 部署到 GitHub Pages

1. 將專案 push 到 GitHub repository
2. Repo 設定 → **Settings → Secrets and variables → Actions → New repository secret**，新增：
   - `APP_PASSWORD_HASH`
3. Repo 設定 → **Settings → Pages → Build and deployment → Source**，選擇 **GitHub Actions**
4. push 到 `main` 分支後，`.github/workflows/deploy.yml` 會自動建置並部署，完成後可在 Settings → Pages 看到正式網址

## 新增／更新播放清單

1. 打開該 Google Drive 資料夾（先確認權限已設定「知道連結可檢視」）
2. 按 F12 開開發人員工具 → Console，貼上 [scripts/scan-drive-folder.js](scripts/scan-drive-folder.js) 的內容並執行，會印出該資料夾所有檔案的 `{id, name}` JSON
3. 把印出的內容整理進 [src/data/playlists.js](src/data/playlists.js)（新增一個播放清單物件，或更新既有的 `tracks` 陣列）
4. commit、push 到 `main`，GitHub Actions 會自動重新部署

也可以直接請 Claude 幫忙做這件事：把 Drive 資料夾的分享連結給它，它可以自動掃描並更新 `playlists.js`。

## 安全性與已知限制（請詳閱）

- 密碼驗證完全在瀏覽器端進行，任何懂技術的人都可能繞過，只適合防止家人以外的人隨手誤入，**不是機密等級的保護**。
- 沒有自動播放下一首、沒有自動重複播放，只能手動按「下一首」切歌（見上方「運作方式」的說明）。
- 播放/暫停、進度條、音量都是 Google 內建播放器的介面，不是我們自己做的 UI。
- 曲目清單是建置時寫死的資料，不會即時同步 Drive 資料夾的變動；新增/刪除檔案後需要照上面步驟更新並重新部署。
