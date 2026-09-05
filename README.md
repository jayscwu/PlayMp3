# Mason與Emily睡前故事（PlayMP3）

播放存放在 Google 雲端硬碟裡的音訊檔案（mp3/m4a）的網頁播放器。每個 Google Drive 資料夾視為一個播放清單。純前端架構，部署在 GitHub Pages，不需要自建後端，也**不使用 Google Drive API / API Key**。

## 運作方式

- 每個播放清單就是一個 Google Drive 資料夾，資料夾底下直接放音訊檔案，資料夾與檔案都需設定為「知道連結的使用者可檢視」。
- **播放清單的名稱、類別、對應的 Drive 資料夾，由一份 Google Sheet 管理**（見下方「管理播放清單（Google Sheet）」），網站載入時會自動讀取這份表單，改表單不需要重新部署網站。
- **曲目清單（每個資料夾裡實際有哪些檔案）由一個 Google Apps Script 自動掃描並寫進同一份 Sheet 的另一個分頁**（見下方「Google Apps Script 自動掃描設定」），網站一樣即時讀取這個分頁，**不需要重新部署**。
- 播放器實際上是嵌入 Google Drive 官方的檔案預覽播放器（iframe），不透過 Google Drive API，也不需要 API Key。網頁上的「上一首／下一首／隨機播放」按鈕是靠切換 iframe 載入的檔案做到的。
  - **已知限制**：因為是跨網域的 iframe，我們的網頁程式無法得知 Google 播放器何時播完一首歌，所以**沒有「自動播放下一首」也沒有「自動重複播放」**，只能手動按「下一首」切歌。播放/暫停、進度、音量都是 Google 播放器自己的介面。
- 登入用一組簡單密碼把關（僅雜湊值存在程式碼中，原始密碼不會進 git），**這不是真正的安全機制**，只能防止陌生人隨手點進網址，請勿存放機密或版權敏感內容並公開分享網址。

## 管理播放清單（Google Sheet）

網站會讀取一份 Google Sheet 來決定「有哪些播放清單、屬於什麼類別、對應哪個資料夾」，格式是四欄：

| 清單名稱 | 類別 | 資料夾共享連結 | 啟用 |
|---|---|---|---|
| 葛洛莉英文-GE 2 | 葛洛莉 | https://drive.google.com/drive/folders/xxxxx | Y |
| 歡樂三國志001-050 | 故事 | https://drive.google.com/drive/folders/xxxxx | Y |
| 復旦地理 | 復旦地理 | | N |

- 第一列是標題列（會被忽略），從第二列開始才是實際資料
- **類別**：網站會在播放清單上方自動列出所有出現過的類別當篩選按鈕，不用另外設定
- **啟用**：填 `N` 的列不會顯示在網站上（可以用來暫存還沒準備好的項目），其他值（含空白）都視為啟用
- Sheet 需設定共用權限為「知道連結的使用者可檢視」
- Sheet 的 ID 寫在 [src/config.js](src/config.js) 的 `PLAYLIST_SHEET_ID`（不是機密資料，直接寫在程式碼裡）
- 新增列、改名字、改類別、調整順序、刪除列、切換啟用，網站重新整理（或按畫面上的「↻ 重新讀取清單」按鈕）就會立刻反映，**不需要重新部署**
- 如果資料夾還沒被掃描過曲目，播放清單會顯示成「⏳ 尚未同步曲目」，點了沒反應——按「🔄 重新掃描曲目」（見下一節）或等自動排程跑過就會補上

## Google Apps Script 自動掃描設定

這是解決「Drive 資料夾內容變動、網站曲目沒跟著更新」的機制：用一個綁在你 Sheet 上的 Apps Script，以你自己的 Google 帳號權限去真正掃描資料夾（不受匿名檢視 50 筆上限影響），把結果寫進 Sheet，網站再讀取。只需要設定一次。

### 設定步驟

1. 打開播放清單 Google Sheet → 選單「**擴充功能 → Apps Script**」
2. 把 [google-apps-script/rescan.gs.js](google-apps-script/rescan.gs.js) 的完整內容貼進編輯器（清掉原本的預設內容），儲存
3. 上方工具列選函式 `rescanAllFolders`，按「執行」，會跳出授權畫面：
   - 選你自己的 Google 帳號 → 可能會看到「Google 尚未驗證這個應用程式」的警告，這是正常的（因為是你自己寫的腳本，不是正式上架的公開應用），點「**進階**」→「**前往...(不安全)**」→ 允許權限
   - 執行成功後，Sheet 會多一個「曲目資料」分頁，裡面是掃描結果
4. 回到 Sheet 重新整理頁面，選單會多一個「**播放清單**」選單，裡面有「重新掃描所有資料夾」，之後要手動重掃可以直接點這裡，不用再進 Apps Script 編輯器

### 部署成網頁應用程式（讓網站上的按鈕可以觸發）

5. 在 Apps Script 編輯器右上角「**部署 → 新增部署作業**」
6. 類型選「**網頁應用程式**」，設定：
   - 執行身分：**我**
   - 具有存取權的使用者：**所有人**（這樣網站上任何訪客按按鈕都能觸發，不需要登入 Google）
7. 部署後會拿到一個網址（`https://script.google.com/macros/s/.../exec`），把它填進 [src/config.js](src/config.js) 的 `RESCAN_WEB_APP_URL`，commit、push 讓網站重新部署

完成後，播放清單頁面的「🔄 重新掃描曲目」按鈕就會真的觸發 Google 端重新掃描所有資料夾。

⚠️ 按下按鈕後**看不到即時的完成通知或進度**（Apps Script 網頁應用程式的回應無法跨網域讀取，這是 Google 端的限制），畫面只會顯示「已送出請求」，實際掃描通常數秒到一兩分鐘內完成，之後手動按「↻ 重新讀取清單」查看結果。

### （選用）設定每天自動掃描一次

在 Apps Script 編輯器左側「**觸發條件**」（鬧鐘圖示）→「新增觸發條件」→ 函式選 `rescanAllFolders` → 事件來源選「時間驅動」→ 選「日計時器」，設定你想要的時間。設定後不用手動按按鈕，Drive 資料夾的異動最晚隔天就會自動反映到網站上。

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

## 新增全新的播放清單

1. 確認 Drive 資料夾權限已設定「知道連結可檢視」
2. 到 Google Sheet 新增一列：清單名稱、類別、資料夾分享連結、啟用填 Y
3. 按 Sheet 選單「播放清單 → 重新掃描所有資料夾」（或等自動排程），把這個新資料夾的曲目掃進「曲目資料」分頁
4. 網站重新整理（或按「↻ 重新讀取清單」）就會出現，**全程不需要重新部署、不需要碰程式碼**

## 安全性與已知限制（請詳閱）

- 密碼驗證完全在瀏覽器端進行，任何懂技術的人都可能繞過，只適合防止家人以外的人隨手誤入，**不是機密等級的保護**。
- 沒有自動播放下一首、沒有自動重複播放，只能手動按「下一首」切歌（見上方「運作方式」的說明）。
- 播放/暫停、進度條、音量都是 Google 內建播放器的介面，不是我們自己做的 UI。
- 網頁上的「重新掃描曲目」按鈕觸發的網址沒有身分驗證（任何知道網址的人都能觸發），但它只會讀 Drive 資料夾清單、寫入你自己的 Sheet，不會外洩或修改 Drive 檔案本身，風險低；如果在意，可以不部署成網頁應用程式，只用 Sheet 內建的選單手動觸發或排程自動觸發。
