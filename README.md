# AceIt AI — Google Gemini 版 (v2.0)

モバイル風の宿題ヘルパーWebアプリ。**本物の Google Gemini** が回答します(以前の「模擬AI」ではありません)。

## 構成
| ファイル | 役割 |
|---|---|
| `server.js` | Node プロキシ。Gemini API キーをサーバー側に保持し、ブラウザに漏らさない。 |
| `index.html` | フロントエンド。プロキシに質問を送り、回答・フラッシュカード・履歴を表示。 |

## 動かし方
```bash
# 1. Gemini キーを環境変数に設定 (aistudio.google.com/apikey で無料取得)
export GEMINI_API_KEY_WWW="あなたのキー"

# 2. サーバー起動 (ポート 8787)。ページと AI を1つのサーバーで配信
cd aceit-app
node server.js
# => AceIt AI proxy running at http://localhost:8787

# 3. ブラウザで http://localhost:8787 を開く (index.html を直接開く必要はありません)
```

> ⚠️ `index.html` を `file://` やCDNプレビューで直接開くと API に到達できず「Failed to fetch」になります。
> **必ず `node server.js` を起動して `http://localhost:8787` で開いてください。**

プロキシ URL はアプリ右上の ⚙️ 設定から変更できます(既定 `http://localhost:8787`)。「Test Connection」で疎通確認できます。

## API
- `GET /api/health` — 疎通 + キー設定状態
- `POST /api/ask` — `{"subject","grade","question"}` → `{"ok","answer","flashcard"}`

## 環境変数
- `GEMINI_API_KEY_WWW`(優先) / `GEMINI_API_KEY` — Gemini API キー
- `GEMINI_MODEL` — モデル(既定 `gemini-3.6-flash`)
- `PORT` — ポート(既定 8787)