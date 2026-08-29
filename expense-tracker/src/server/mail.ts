// Отправка приглашений. Поддерживаются два провайдера, выбор — по тому,
// какие переменные окружения заданы:
//
//   EmailJS — письма уходят с вашей же почты, домен покупать не нужно.
//   Resend  — нужен свой домен с DNS-записями, зато письма от имени сервиса.
//
// Если не настроен ни один, письма просто не шлются: приглашение всё равно
// создаётся, а ссылку владелец копирует кнопкой. Интерфейс об этом говорит.

type SendResult = { sent: boolean; reason?: string; error?: string };

export type MailProvider = 'emailjs' | 'resend' | null;

export function mailProvider(): MailProvider {
  if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PRIVATE_KEY) {
    return 'emailjs';
  }
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
    return 'resend';
  }
  return null;
}

export interface InviteEmail {
  to: string;
  inviterName: string;
  walletName: string;
  link: string;
}

// Имя приглашающего и название кошелька вводит человек, а письмо Resend —
// это HTML. Для EmailJS экранирование не нужно: значения подставляет он сам
// в свой шаблон.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendViaEmailJs({ to, inviterName, walletName, link }: InviteEmail): Promise<SendResult> {
  // Вызов серверный, не браузерный: приватный ключ в accessToken. Из
  // браузера EmailJS дёргать нельзя — ключи уехали бы к пользователю.
  // В настройках EmailJS должны быть разрешены запросы не из браузера.
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      // Эти имена должны совпадать с переменными в шаблоне EmailJS.
      template_params: {
        to_email: to,
        inviter_name: inviterName,
        wallet_name: walletName,
        invite_link: link,
      },
    }),
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 300);
    console.error('EmailJS вернул ошибку:', response.status, details);
    return { sent: false, reason: 'send-failed', error: `${response.status}: ${details}` };
  }

  return { sent: true };
}

async function sendViaResend({ to, inviterName, walletName, link }: InviteEmail): Promise<SendResult> {
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
    const details = (await response.text()).slice(0, 300);
    console.error('Resend вернул ошибку:', response.status, details);
    return { sent: false, reason: 'send-failed', error: `${response.status}: ${details}` };
  }

  return { sent: true };
}

export async function sendInviteEmail(email: InviteEmail): Promise<SendResult> {
  const provider = mailProvider();

  if (!provider) {
    return { sent: false, reason: 'not-configured' };
  }

  try {
    return provider === 'emailjs' ? await sendViaEmailJs(email) : await sendViaResend(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Не удалось отправить письмо:', error);
    return { sent: false, reason: 'send-failed', error: message };
  }
}
