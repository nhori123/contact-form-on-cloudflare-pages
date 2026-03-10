
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const status = document.createElement('div');
  status.className = 'mt-3 text-sm text-slate-700';
  form.appendChild(status);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '送信中...';
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const formData = new FormData(form);
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
