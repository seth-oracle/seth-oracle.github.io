# 賽特神諭玩家評價｜Cloudflare 免費方案

這裡是評價投稿的 Worker 後端，使用現有 **D1** 資料庫 `seth-reviews` 與 **Workers KV** 照片儲存（不用開通 R2）。

## 目前進度

- GitHub Pages 靜態官網及 Pages CMS 已上線。
- Cloudflare Worker `seth-review-service` 已在 Cloudflare 建立，**目前仍是 Hello World**，尚未部署這份程式。
- D1 資料庫 `seth-reviews` 已建立，`reviews` 表已由管理者在 Console 建立。
- Workers KV namespace 尚待建立及綁定。部署前，官網仍使用 LINE 投稿，**不會自動傳到審核後台**。

## 後續設定

1. Cloudflare → Storage & databases → Workers KV → 建立 namespace，名稱建議 `seth-review-photos`。
2. Workers & Pages → `seth-review-service` → Settings → Bindings：
   - D1 binding 名稱 `DB`，選 `seth-reviews`
   - KV namespace binding 名稱 `PHOTOS`，選 `seth-review-photos`
3. 設定 Worker **Secret**：`ADMIN_TOKEN`（至少 24 字元的隨機強密鑰，**不可貼到公開頁面或 GitHub**）。
4. 將本資料夾 `src/index.js` 程式部署到 `seth-review-service`。可以用 Cloudflare 的 Edit code 貼上部署，或在 `review-service` 資料夾內使用 Wrangler CLI；CLI 部署前要把 `wrangler.toml` 中的 KV ID 換成新 namespace 的 ID。
5. 測試公開 API、後台授權、圖片權限及審核流程後，才將 `reviews/config.js` 的 `REPLACE_WITH_WORKER_URL` 改成實際網址。

## 免費額度與保護

Cloudflare Workers KV 免費方案提供每帳號 1GB 儲存、每天 1,000 次不同 key 寫入；超過免費配額會失敗，不會自動轉成超額計費（仍需維持 Free 方案）。每次投稿限制最多 10 張，每張最大 2MB，全部照片總計 8MB；這是免費儲存的防濫用限制，不是評價展示圖片數量的限制。

**公開上線前務必加上 Cloudflare Turnstile／速率限制，防止匿名大量上傳耗盡免費額度。** 管理員需定期清理拒絕的投稿與照片，防止資料永久累積。避免公開 ADMIN_TOKEN，且管理頁勿在公共裝置使用。

注意：Workers KV 屬於最終一致性儲存，剛上傳的照片跨地區讀取可能會有短暫延遲。
