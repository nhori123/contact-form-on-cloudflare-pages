# このプロジェクトについて
Cloudflare Pagesに問合せフォームを設置します。
設置した問合せフォームに問合せが入った場合は、問合せ内容がサイト管理者宛てにメール(RESEND)で通知されるようにします。

Hugo など別の静的サイトでも「フォーム部分＋API 部分」をほぼそのまま流用できます。

---

## ステップ 0：前提確認
- 必要なもの
  + Cloudflare アカウント
  + Node.js（推奨: LTS）
  + Git（任意だがあると便利）
- このプロジェクトの前提
  + 言語：TypeScript
  + Lint：ESLint
  + デプロイ先：Cloudflare Pages（Functions 利用）
  + メール送信：Resend

---

## ステップ 1：プロジェクトフォルダ作成
1. フォルダ作成
  + `cf-contact-form` など、わかりやすい名前で作成
2. 初期化
  + `npm init -y`

> ここでは「Node.js プロジェクトの箱」を作るだけです。まだ何も動きません。

---

## ステップ 2：TypeScript と ESLint の導入
1. TypeScript 関連インストール
  + `npm install -D typescript @types/node`
2. ESLint 関連インストール
  + `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`
3. プロジェクトのルートに設定ファイルを作成
  + `tsconfig.json`
    * `npx tsc --init`で初期の`tsconfig.json`を作成可能
  + `.eslintrc.cjs` (または `.eslintrc.js`)

> このステップのゴールは「TypeScript で書いて、ESLint でチェックできる状態」にすることです。まだブラウザには何も出ません。

> `tsconfig.json`の内容によっては、`functions`フォルダにtsファイルがないと問題が検出されるかもしれません。（`functions\contact.ts`のファイルを空で作成するとエラーが消えた。）

---

## ステップ 3：Cloudflare Pages 用の基本構成を作る

1. ディレクトリ構造を作成
```
/cf-contact-form
  /public        ← 静的ファイル（HTML, CSS, JS）
  /functions     ← Pages Functions（API）
```
2. public/index.html を作成
  + 「Hello Cloudflare Pages」程度のシンプルな HTML
3. ローカルで一旦コミット（任意）

> ここでは「Pages にデプロイできる最低限の形」を作ります。まだフォームはありません。

---

## ステップ 4：Tailwind CSS v4 の導入（CDN 版）

目的：最初はビルドなしで Tailwind を使えるようにする。
Tailwind v4 の CDN 版は、ビルド不要です。(CDN版の本番利用は非推奨)
1. `public/index.html` に `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>` を追加（任意）

> これで Tailwind が即利用可能です。
> 尚、他のプロジェクトに移植する前提なら、Tailwindはなくても構いません。

---

## ステップ 5：Cloudflare Pages にデプロイして表示確認

1. GitHub などにリポジトリを作成して push
2. Cloudflare ダッシュボード → Pages → 新しいプロジェクト
3. リポジトリを選択し、ビルド設定
  + ビルドコマンド：なし（最初は素の `public` だけ）
  + 出力ディレクトリ：`public`
4. デプロイ完了後、URL にアクセスして
  + 「Hello Cloudflare Pages」が表示されることを確認

> ここで「Cloudflare Pages に HTML を置くと、ブラウザから見える」という一番基本の流れを理解します。

---

## ステップ 6：見た目だけのコンタクトフォームを作る

1. `public/index.html` を編集
  + 名前、メールアドレス、メッセージ、送信ボタンを持つフォームを追加
2. まだ送信先はダミー
  `action` や `fetch` は後で実装
3. デプロイして、フォームが表示されることを確認

> この時点では「ボタンを押しても何も起きない」で OK。目的は「フォームの見た目を確認すること」です。

---

## ステップ 7：Pages Functions で「受け取って返すだけ」の API を作る

1. `npm install -D @cloudflare/workers-types`（型定義のインストール）
1. `functions/api/contact.ts` を作成
  + `onRequestPost` を `export` する TypeScript ファイル
  + `request` の body を読み取り、そのまま JSON で返すだけの処理
2. フォーム送信を JavaScript で書き換え
  + `public/index.html` に `<script>` を追加
  + `fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), })` で送信
  + レスポンスを `console.log` で確認
3. デプロイして、ブラウザの開発者ツールで
  + 送信した内容が API から返ってきていることを確認

> ここで「フォーム → Pages Functions → ブラウザに戻る」という一連の流れを、メール送信なしで理解します。

> Cloudtlare Pagesの`functions/api/contact.ts`のルートは、`https://<your-pages-domain>/api/contact`になります。

---

## ステップ 8：Resend API を使ってメール送信を追加

1. Resend アカウント作成 & API キー取得
2. Cloudflare Pages の環境変数に設定
  + `RESEND_API_KEY`を追加
3. `functions/api/contact.ts` を拡張
  + さきほどの「受け取って返すだけ」の処理に
    * Resend API への `fetch` を追加
    * `from`, `to`, `subject`, `html` を組み立てる
4. フォーム送信 → メールが届くことを確認
  ブラウザ側の挙動は変えず、裏側だけ変更

> ここで初めて「問い合わせフォームとしての最低限の機能（メール送信）」が完成します。
> **送信先メールアドレスもコードにハードコードせずに、環境変数に格納してください。**

> 環境変数一覧（参考）
> RESEND_API_KEY=xxxx
> MAIL_TO=xxxx@example.com
> MAIL_FROM=no-reply@example.com

---

## ステップ 9：フロント側のバリデーションを追加

1. HTML 側に `required` や `type="email"` を追加
2. JavaScript で追加チェック
    + 空文字チェック
    + メールアドレスの簡易チェック
3. エラー時は送信せず、画面にメッセージ表示

> ここでは「ユーザーが明らかにおかしい入力をしたときに、その場で気づける」ことを目的にします。

---

## ステップ 10：サーバー側のバリデーションを追加
1. `functions/api/contact.ts` にチェックを追加
  + `name`, `email`, `message` が空でないか
  + `email` の形式がそれっぽいか
2. 不正な場合は 400 番台のステータスでエラー JSON を返す
3. フロント側でそのエラーを受け取り、メッセージ表示

> ここで「フロントをすり抜けた不正なリクエストも防ぐ」ことを理解します。

---

## ステップ 11：Turnstile を導入（最後に追加）

1. Cloudflare ダッシュボードで Turnstile のサイトキー・シークレットキーを発行
2. フロント側に Turnstile のウィジェットを追加
  + `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`
  + `<div class="cf-turnstile" data-sitekey="..."></div>`
3. フォーム送信時に Turnstile の token を取得して一緒に送信
4. `functions/api/contact.ts` で token を検証
  + Turnstile の検証 API(`https://challenges.cloudflare.com/turnstile/v0/siteverify`) に fetch
  + OK のときだけ Resend API を叩く

> ここで「人間だけがフォームを送れるようにする」ことを理解します。Turnstile は最後に追加するので、問題が出たときに「Turnstile のせいかどうか」が切り分けやすくなります。

## ステップ12：追加のセキュリティ設定

1. Rate Limiting（無料プランで OK）
  + 1 IP あたりの送信回数を制限する
2. Origin/Referer チェック  
  + 自サイト以外からの POST を拒否

> Turnstile は必須の防御です。
> Rate Limiting と Origin チェックは、攻撃耐性をさらに高めるための強い推奨設定です。

---

ステップごとに「見える変化」があるように分割しました。
初めての人でも動作と役割を追いやすい構成です。
