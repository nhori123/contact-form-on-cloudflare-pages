import type { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  RESEND_API_KEY: string;
  MAIL_TO: string;
  MAIL_FROM: string;
  ASSETS?: unknown;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // 環境変数チェック（運用ミスを早く検出するため）
  if (!env.RESEND_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) {
    return new Response(
      JSON.stringify({ error: "Server configuration missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  // 安全なフォーム値取得
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  // 簡易バリデーション
  if (!name.trim() || !email.trim() || !message.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(
      JSON.stringify({ error: "Invalid input" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // メール本文（簡易 HTML エスケープ）
  const subject = `新しいお問い合わせが送信されました: from ${name}`;
  const html = `
    <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><strong>Message:</strong></p>
    <div style="white-space:pre-wrap;border-left:4px solid #eee;padding-left:10px;">${escapeHtml(message)}</div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: env.MAIL_TO,
        subject,
        html,
      }),
    });

    const body = await res.json().catch(() => null) as any;
    if (!res.ok) {
      const errMsg = body && typeof body === "object" && "error" in body ? String(body.error) : "Failed to send email";
      return new Response(JSON.stringify({ error: errMsg }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    // ここで API キーなどの秘密は絶対に出力しない
    console.error("send error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
