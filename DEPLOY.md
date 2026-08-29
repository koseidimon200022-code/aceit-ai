# AceIt AI を Render に公開する手順 (無料・GitHub 連携)

このフォルダ一式を GitHub リポジトリに push し、Render と連携すれば公開 URL が発行されます。

## 用意するもの
- **GitHub アカウント**(無料)
- **Render アカウント**(無料、GitHub アカウントでサインアップ可)
- **Gemini API キー** — https://aistudio.google.com/apikey で無料作成

## 手順

### 1) GitHub リポジトリを作成・push

>  に  と  を含めてあるので、**API キーはコミットされません**。必ずキーは Render のダッシュボードで設定してください。

### 2) Render でデプロイ
1. https://dashboard.render.com にログイン
2. 「**New +**」→「**Blueprint**」を選択
3. GitHub リポジトリ(上で作った )を接続
4.  を自動検出して「Apply Blueprint」
5. デプロイ完了後、サービスを開いて「**Environment**」タブで
    に実際のキーを追加して保存
6. 「**Manual Deploy → Deploy latest commit**」で再デプロイ(キー反映)

### 3) URL の確認
- デプロイ完了後、サービスの「**On the web**」URL(例 )でアプリが開きます。
- ヘルスチェックは  なので、トップページが開けば OK。

### 注意点(無料プラン)
- 無料プランは**一定時間アクセスがないとスリープ**し、次回アクセス時に起動まで数秒かかります。
- スリープを避けるには有料プラン or 外部の ping サービスが必要ですが、通常利用では問題ありません。

## 動作確認
- ページ:  → AceIt AI 画面
- ヘルス:  → 
- 質問:   → 回答 + フラッシュカード

## トラブル
- 「AI が使えない / Failed to fetch」→ Render の **Environment に  が設定されているか**、そして再デプロイしたか確認。
- 起動ログは Render の「**Logs**」タブで確認できます。