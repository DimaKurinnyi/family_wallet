// Отправка писем через Resend. Обращаемся к его REST напрямую, чтобы не
// тащить пакет ради одного запроса: заменить провайдера — значит поменять
// только этот файл.
//
// Без ключа письма не отправляются, и это не ошибка: приглашение всё
// равно создаётся, а ссылку владелец копирует руками. Интерфейс об этом
// честно говорит.

type SendResult = { sent: boolean; reason?: string };

export function isMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

// Экранируем всё, что подставляем в письмо: имя приглашающего и название
// кошелька вводит человек.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface InviteEmail {
  to: string;
  inviterName: string;
  walletName: string;
  link: string;
}

export async function sendInviteEmail({ to, inviterName, walletName, link }: InviteEmail): Promise<SendResult> {
  if (!isMailConfigured()) {
    return { sent: false, reason: 'not-configured' };
  }

  const who = escapeHtml(inviterName);
  const wallet = escapeHtml(walletName);

  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937">
      <h1 style="font-size:22px;margin:0 0 16px">Приглашение в общий кошелёк</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px">
        ${who} приглашает вас в кошелёк «${wallet}» в Expense Tracker.
        Вы сможете видеть его баланс и добавлять операции.
      </p>
      <p style="margin:0 0 24px">
        <a href="${link}" style="display:inline-block;background:#8144e9;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600">
          Принять приглашение
        </a>
      </p>
      <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0">
        Ссылка действует 7 дней и работает только для этого адреса.
        Если вы не ждали приглашения, просто не открывайте её.
      </p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [to],
        subject: `${inviterName} приглашает вас в кошелёк «${walletName}»`,
        html,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Resend вернул ошибку:', response.status, details);
      return { sent: false, reason: 'send-failed' };
    }

    return { sent: true };
  } catch (error) {
    console.error('Не удалось отправить письмо:', error);
    return { sent: false, reason: 'send-failed' };
  }
}
