// Browser lifecycle only. Authenticity and replay across clients must be checked
// by Supabase Auth, with Turnstile enabled and its secret stored on the server.
export const CAPTCHA_LIFETIME_MS = 300_000;
export const CAPTCHA_MESSAGE = 'Conclua uma nova verificação de segurança e tente novamente.';

export class CaptchaTicket {
  #token: string;
  #issuedAt: number;
  #now: () => number;

  constructor(token: string, now = () => performance.now()) {
    if (!token.trim() || token.length > 2048) throw new Error(CAPTCHA_MESSAGE);
    this.#token = token;
    this.#now = now;
    this.#issuedAt = now();
  }

  invalidate() { this.#token = ''; }

  consume(): string {
    const token = this.#token;
    this.invalidate(); // Synchronous: a second submit cannot reuse this ticket.
    const age = this.#now() - this.#issuedAt;
    if (!token || !Number.isFinite(age) || age < 0 || age >= CAPTCHA_LIFETIME_MS) {
      throw new Error(CAPTCHA_MESSAGE);
    }
    return token;
  }
}

export function consumeCaptcha(ticket?: CaptchaTicket | null): string {
  if (!(ticket instanceof CaptchaTicket)) throw new Error(CAPTCHA_MESSAGE);
  return ticket.consume();
}

export function isCaptchaFailure(error: { code?: string } | null): boolean {
  return error?.code === 'captcha_failed';
}
