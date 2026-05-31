import { Injectable } from '@angular/core';

export type SupportMessageType = 'suggestion' | 'problem' | 'question';

export interface SupportPayload {
  type: SupportMessageType;
  subject: string;
  message: string;
  email: string;
  fullName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  private readonly formspreeEndpoint = 'https://formspree.io/f/xaqkzvgp';

  async sendMessage(payload: SupportPayload): Promise<void> {
    if (!this.formspreeEndpoint || this.formspreeEndpoint.includes('YOUR_FORMSPREE')) {
      throw new Error('Formspree endpoint is not configured yet.');
    }

    const response = await fetch(this.formspreeEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _subject: `Mizania support: ${payload.subject}`,
        name: payload.fullName || 'Mizania user',
        email: payload.email,
        messageType: payload.type,
        subject: payload.subject,
        message: payload.message,
        source: 'Mizania app support page',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send support message.');
    }
  }
}