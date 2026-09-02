# 家庭音樂播放器（PlayMP3）

播放存放在 Google 雲端硬碟裡的音訊檔案（mp3/m4a）的網頁播放器。每個 Google Drive 資料夾視為一個播放清單。純前端架構，部署在 GitHub Pages，不需要自建後端，也**不使用 Google Drive API / API Key**。

## 運作方式

- 每個播放清單就是一個 Google Drive 資料夾，資料夾底下直接放音訊檔案，資料夾與檔案都需設定為「知道連結的使用者可檢視」。
- **播放清單的名稱與對應的 Drive 資料夾，由一份 Google Sheet 管理**（見下方「管理播放清單（Google Sheet）」），網站載入時會自動讀取這份表單，改表單不需要重新部署網站。
- **曲目清單（每個資料夾裡實際有哪些檔案）寫在 [src/data/trackManifest.js](src/data/trackManifest.js)**，以資料夾 ID 為 key。這部分還是需要離線掃描＋commit＋重新部署（原因見下方「新增全新資料夾的曲目」）。
- 播放器實際上是嵌入 Google Drive 官方的檔案預覽播放器（iframe），不透過 Google Drive API，也不需要 API Key。網頁上的「上一首／下一首／隨機播放」按鈕是靠切換 iframe 載入的檔案做到的。
  - **已知限制**：因為是跨網域的 iframe，我們的網頁程式無法得知 Google 播放器何時播完一首歌，所以**沒有「自動播放下一首」也沒有「自動重複播放」**，只能手動按「下一首」切歌。播放/暫停、進度、音量都是 Google 播放器自己的介面。
- 登入用一組簡單密碼把關（僅雜湊值存在程式碼中，原始密碼不會進 git），**這不是真正的安全機制**，只能防止陌生人隨手點進網址，請勿存放機密或版權敏感內容並公開分享網址。

## 管理播放清單（Google Sheet）

網站會讀取一份 Google Sheet 來決定「有哪些播放清單、對應哪個資料夾」，格式是兩欄：

| 清單名稱 | 資料夾共享連結 |
|---|---|
| 葛洛莉英文-GE 2 | https://drive.google.com/drive/folders/xxxxx |
| 歡樂三國志 | https://drive.google.com/drive/folders/xxxxx |

- 第一列是標題列（會被忽略），從第二列開始才是實際資料
- Sheet 需設定共用權限為「知道連結的使用者可檢視」
- Sheet 的 ID 寫在 [src/config.js](src/config.js) 的 `PLAYLIST_SHEET_ID`（不是機密資料，直接寫在程式碼裡）
- 之後**新增列、改名字、調整順序、刪除列**，網站重新整理（或按畫面上的「↻ 重新讀取清單」按鈕）就會立刻反映，**不需要重新部署**
- 如果新增的資料夾之前從沒被掃描過曲目（`trackManifest.js` 裡沒有這個資料夾 ID），播放清單會顯示成「⏳ 尚未同步曲目」，點了沒反應——這時要照下面「新增全新資料夾的曲目」補上曲目資料

## 事前準備

### 1. 確認 Google Drive 分享權限

每個播放清單資料夾、以及裡面的音訊檔案，都需設定共用權限為「知道連結的使用者」可檢視（在 Drive 資料夾按右鍵 →「共用」→「一般access」改成「知道連結的使用者」，權限「檢視者」）。

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

## 新增全新資料夾的曲目

這一步是「幫某個資料夾建立曲目資料」，跟上面「管理播放清單」不同——管理播放清單（改名字/顯示哪些清單）改 Sheet 就好，但一個資料夾**第一次**被加入時，需要先掃描它裡面有哪些檔案：

1. **用登入你自己 Google 帳號的瀏覽器**打開該 Google Drive 資料夾（先確認權限已設定「知道連結可檢視」）
   - ⚠️ 重要：資料夾檔案數超過 50 個時，一定要登入才能看到全部檔案。用「無痕視窗」或登出狀態開啟公開連結，Drive 最多只會載入前 50 個檔案，捲到底也不會載入更多，這是 Google 匿名檢視的限制，不是程式的 bug。
2. 按 F12 開開發人員工具 → Console，貼上 [scripts/scan-drive-folder.js](scripts/scan-drive-folder.js) 的內容並執行（檔案數多的話，程式會自動持續捲動載入，需要一點時間，Console 會印出進度）
3. 執行完會印出該資料夾所有檔案的 `{id, name}` JSON，把內容整理進 [src/data/trackManifest.js](src/data/trackManifest.js)，用該資料夾的 ID 當 key 新增一筆
4. commit、push 到 `main`，GitHub Actions 會自動重新部署
5. 到 Google Sheet 新增一列（清單名稱＋這個資料夾的分享連結），存檔後網站重新整理就會出現（不用再重新部署）

也可以直接請 Claude 幫忙做這件事：把 Drive 資料夾的分享連結給它，它可以自動掃描並更新 `trackManifest.js`（但如果資料夾超過 50 個檔案，Claude 只能看到匿名檢視的前 50 個，需要你自己登入帳號跑一次上面的步驟，把結果貼給它）。Sheet 那一列（清單名稱＋連結）也可以請 Claude 幫忙產生內容，但實際填入 Sheet 需要你自己動手（Claude 不會幫你編輯 Google Sheet）。

## 安全性與已知限制（請詳閱）

- 密碼驗證完全在瀏覽器端進行，任何懂技術的人都可能繞過，只適合防止家人以外的人隨手誤入，**不是機密等級的保護**。
- 沒有自動播放下一首、沒有自動重複播放，只能手動按「下一首」切歌（見上方「運作方式」的說明）。
- 播放/暫停、進度條、音量都是 Google 內建播放器的介面，不是我們自己做的 UI。
- 曲目清單（`trackManifest.js`）是建置時寫死的資料，不會即時同步 Drive 資料夾的變動；新增/刪除檔案後需要照上面步驟更新並重新部署。播放清單的名稱/順序/顯示與否則是即時從 Sheet 讀取的，不受此限制。
