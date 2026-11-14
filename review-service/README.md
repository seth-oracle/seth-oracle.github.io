# 賽特神諭玩家評價｜獨立投稿審核 API

本資料夾是可部署的 Cloudflare Worker 後端。GitHub Pages 無法直接儲存會員投稿或圖片，因此需先部署 Worker，官網才會啟用「直接送到待審核後台」。

## 部署方式（需由 Cloudflare 帳號持有人操作）

1. 在 Cloudflare 建立 D1 資料庫 `seth-reviews` 和 R2 bucket `seth-review-photos`。
2. 將 `wrangler.toml` 的 `database_id` 換成實際 D1 ID。需先在本機安裝 Node.js 及 Wrangler，並登入 Cloudflare。
3. 執行 `npx wrangler d1 execute seth-reviews --remote --file=./schema.sql`。
4. 執行 `npx wrangler secret put ADMIN_TOKEN`，設定**長度至少 24 字元的隨機密鑰**（不可放進 GitHub、網頁原始碼或對話）。
5. 執行 `npx wrangler deploy`，取得 HTTPS Worker 網址。
6. 編輯官網檔案 `reviews/config.js`：把 `REPLACE_WITH_WORKER_URL` 改為剛取得的 Worker HTTPS 網址。官網將自動使用新收件流程，管理頁 `/reviews/manage/` 即可登入審核。
7. 上線前建議加 Cloudflare Turnstile、WAF/速率限制與 Cloudflare Access，保護匿名投稿與後台；並設定儲存期限、清除資料及圖片的流程。

使用條件：玩家不需要 GitHub/Cloudflare 帳號。投稿自動存入 D1，圖片存入 R2。待審核內容不可公開瀏覽。管理員可批准、退回或設為待審核；公開頁面只會顯示已批准投稿。後台登入憑證存於本次瀏覽器分頁的 sessionStorage，請避免共用裝置。

提醒：目前每次投稿最多 20 張、每張 8 MB；這是防止濫用的上傳限制，不是每則評價展示張數限制。若尚未部署，網站保留原本 LINE 投稿，不會聲稱自動收件已上線。
