[![CI](https://github.com/linzeyan/keybr.com/actions/workflows/ci.yml/badge.svg)](https://github.com/linzeyan/keybr.com/actions/workflows/ci.yml)

# keybr.com 注音版

用 [keybr.com](https://www.keybr.com/) 的方法練習大千注音打字：記錄每一次按鍵，找出你最弱的鍵，自動產生針對這些鍵的練習。

這是 keybr.com 的分支，專為台灣的注音大千鍵盤調整，不會合併回上游。

## 特色

- **直接打注音符號**：作業系統維持英文輸入法，網頁把按鍵對應成大千鍵位上的注音符號。練的是鍵位和指法，不經過選字。
- **按鍵和實際打字一致**：一聲用空白鍵，二、三、四聲和輕聲打完直接接下一個字。例如「我今天很好」要打 `ㄨㄛˇㄐㄧㄣ ㄊㄧㄢ ㄏㄣˇㄏㄠˇ`。
- **由少到多解鎖**：從最常用的韻母、聲母、聲調開始，速度達標才加入新的鍵；課程集中練你最弱的鍵。
- **常用詞模式**：練習小麥注音（McBopomofo）詞庫裡的真實詞彙。
- **書本模式**：畫面顯示漢字，打對應的注音。收錄六本公有領域作品：《白話文選》（朱自清、許地山、胡適）、魯迅《吶喊》《彷徨》《朝花夕拾》、《新詩與小說》（徐志摩、聞一多、郁達夫）、《古典小說選》（西遊記、紅樓夢、水滸傳、儒林外史的前三回）。打錯時漢字上方會出現注音提示。標點符號照設定裡選的輸入法按鍵輸入（微軟注音、macOS 注音、新酷音、自然輸入法、小狼毫／鼠鬚管、小麥注音、威注音），例如新酷音用 `Shift+,`、微軟注音用 `Ctrl+,` 打出「，」，打錯時會提示按鍵；要從候選清單挑的標點只顯示不用打，也可以設定拿掉標點符號。
- **自訂文字**：貼上中文就能練，瀏覽器用小麥注音的詞庫判斷讀音；可以選擇顯示漢字，或直接顯示要打的注音。
- **打字測驗**：內容全部是注音，使用大千鍵盤。
- **介面語言**：English、正體中文。

不論瀏覽器語言，練習頁一律預設使用中文（台灣）與大千鍵盤；要練英文打字，請到「設定」→「鍵盤」切換語言與排版。

## 部署

有兩種方式，兩種都由同一份程式碼產生。

### Cloudflare Pages（靜態網站）

沒有伺服器，所以沒有帳號功能；練習紀錄和設定只存在瀏覽器裡。

在 Cloudflare Pages 連接這個 repo，設定如下：

| 項目                    | 值                                        |
| ----------------------- | ----------------------------------------- |
| Production branch       | `bopomofo`                                |
| Build command           | `pnpm run build-static`                   |
| Build output directory  | `build/static`                            |
| 環境變數 `NODE_VERSION` | `26`                                      |
| 環境變數 `PNPM_VERSION` | `12.6.0`                                  |
| 環境變數 `APP_URL`      | 網站網址，例如 `https://keybr.pages.dev/` |

Cloudflare 建置環境預設的 Node.js 和 pnpm 版本太舊，所以要用環境變數指定。`APP_URL` 用來產生分享連結（Open Graph）的網址。

### Docker（自架，有帳號功能）

CI 會把映像檔推到 GitHub Container Registry：`bopomofo` 分支的最新版是 `ghcr.io/linzeyan/keybr.com:bopomofo`，正式版本則是版號，例如 `ghcr.io/linzeyan/keybr.com:0.1.0`。

設定放在容器內的 `/etc/keybr/env`，資料（資料庫、練習紀錄）放在 `/var/lib/keybr`：

```shell
docker run -d --name keybr \
  -p 3000:3000 \
  -v keybr-data:/var/lib/keybr \
  -v /path/to/env:/etc/keybr/env:ro \
  ghcr.io/linzeyan/keybr.com:bopomofo
```

也可以改用 [docker-compose.yaml](docker-compose.yaml)。設定檔範例：

```ini
APP_URL=https://keybr.example.com/
COOKIE_DOMAIN=keybr.example.com
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=/var/lib/keybr/database.sqlite
MAIL_DOMAIN=mg.example.com
MAIL_KEY=<Mailgun API key>
MAIL_FROM_ADDRESS=keybr@example.com
MAIL_FROM_NAME=keybr
```

`APP_URL`、`COOKIE_DOMAIN` 和四個 `MAIL_*` 都必填，少一個伺服器就不會啟動。

- `APP_URL`：用其他網址連進來的請求都會被轉到這個網址。
- `COOKIE_DOMAIN`：你的網域。Cookie 預設只走 HTTPS，請放在 HTTPS 反向代理後面；只用 HTTP 測試時加上 `COOKIE_SECURE=false`。
- `MAIL_*`：登入是寄信給使用者，透過 [Mailgun](https://www.mailgun.com/) 寄送。
- 一定要設 `DATABASE_FILENAME`，不然資料庫只存在記憶體裡，重啟就消失。也可以用 MySQL：`DATABASE_CLIENT=mysql`，再設 `DATABASE_HOST`、`DATABASE_PORT`、`DATABASE_DATABASE`、`DATABASE_USERNAME`、`DATABASE_PASSWORD`。

## 開發

需要 Node.js 26 與 pnpm 12（確切版本寫在 `package.json` 的 `packageManager`）。

```shell
pnpm install
cp .env.example .env
pnpm run build-dev
pnpm start                  # http://localhost:3000/
```

- `pnpm run watch`：修改程式時自動重新建置，和 `pnpm start` 一起開。
- `./packages/devenv/lib/initdb.ts`：建立資料表並印出範例帳號的登入連結，本機登入不必寄信。
- `pnpm run compile`：TypeScript 型別檢查。
- `env DATABASE_CLIENT=sqlite pnpm test`：用記憶體中的 SQLite 跑全部測試。
- `pnpm run lint`、`pnpm run stylelint`：程式碼檢查。
- `APP_URL=http://localhost:8788/ pnpm run build-static`：在本機產生靜態網站到 `build/static`。

### 重新產生注音資料

注音的詞庫、常用詞和書本資料由小麥注音的資料產生，產生結果已經放在 repo 裡。修改產生方式或書本內容（`packages/keybr-generators/books/zh-tw-*.txt`）後重新產生：

```shell
pnpm --filter @keybr/generators run generate-zhuyin
pnpm --filter @keybr/generators run generate-languages
```

### 發版

把版本說明寫進 annotated tag 再推上去。CI 通過後會發布這個版號的 Docker 映像檔，再用 tag 的訊息建立 GitHub Release。加上 `--cleanup=verbatim`，說明裡 `#` 開頭的 Markdown 標題才不會被 git 當成註解刪掉：

```shell
git tag -a v0.2.0 --cleanup=verbatim -F notes.md
git push origin v0.2.0
```

## 授權

以 [GNU Affero General Public License v3.0](LICENSE) 釋出，和上游的 keybr.com 相同。注音資料來自小麥注音（MIT）與 libtabe（BSD），書本內容是維基文庫上的公有領域作品；完整的來源與授權聲明見 [NOTICE.md](NOTICE.md)。
