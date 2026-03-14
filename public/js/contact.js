
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const status = document.createElement('div');
  status.className = 'mt-3 text-sm text-slate-700';
  form.appendChild(status);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // 簡易バリデーション: 空文字チェック
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name) {
      status.textContent = 'お名前を入力してください。';
      return;
    }
    if (!email) {
      status.textContent = 'メールアドレスを入力してください。';
      return;
    }
    if (!message) {
      status.textContent = 'お問い合わせ内容を入力してください。';
      return;
    }

    // 簡易バリデーション: メールアドレスの形式チェック
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      status.textContent = '有効なメールアドレスを入力してください。';
      form.querySelector('#email').focus();
      return;
    }

    // 送信前の長さチェック（コードポイント長でカウント）
    const MAX = { name: 100, email: 254, message: 3000 };
    const nameLen = [...name].length;
    const emailLen = [...email].length;
    const msgLen = [...message].length;

    if (nameLen > MAX.name) {
      status.textContent = `お名前は最大${MAX.name}文字です（現在 ${nameLen}文字）。`;
      form.querySelector('#name').focus();
      return;
    }
    if (emailLen > MAX.email) {
      status.textContent = `メールアドレスは最大${MAX.email}文字です（現在 ${emailLen}文字）。`;
      form.querySelector('#email').focus();
      return;
    }
    if (msgLen > MAX.message) {
      status.textContent = `お問い合わせ内容は最大${MAX.message}文字です（現在 ${msgLen}文字）。`;
      form.querySelector('#message').focus();
      return;
    }

    status.textContent = '送信中...';
    submitBtn.disabled = true;

    const formData = new FormData(form);

    formData.set('name', name);
    formData.set('email', email);
    formData.set('message', message);

    const TIMEOUT = 10000;  // タイムアウト 10000ms=10秒
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = (data && data.error) ? data.error : '送信に失敗しました';
        status.textContent = 'エラー: ' + msg;
      } else {
        status.textContent = '送信が完了しました。ありがとうございました。';
        form.reset();

        // 送信ボタンを無効化
        submitBtn.disabled = true;
        submitBtn.textContent = '送信完了';
        submitBtn.classList.add('cursor-not-allowed', 'opacity-50');
        submitBtn.dataset.permanent = 'true';

        // さらにフォーム内の全入力を無効化して二重送信を確実に防ぐ
        form.querySelectorAll('input, textarea').forEach(el => el.disabled = true);

        console.log('サーバー応答:', data);
      }
    } catch (err) {
      if (err && err.name === 'AbortError') {
        status.textContent = 'リクエストがタイムアウトしました。もう一度お試しください。';
      } else {
        console.error(err);
        status.textContent = '通信エラーが発生しました。もう一度お試しください。';
      }
    } finally {
      clearTimeout(timeoutId);
      // 永久無効化フラグが無ければボタンを再有効化
      if (!submitBtn.dataset.permanent) {
        submitBtn.disabled = false;
      }
    }
  });
});
