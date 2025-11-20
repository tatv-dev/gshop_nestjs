import { Injectable } from '@nestjs/common';
import * as vi from './locales/vi.json';

export interface I18nMessage {
  title: string;
  detail: string;
}

@Injectable()
export class I18nService {
  private messages: Record<string, Record<string, I18nMessage>> = {
    vi: vi as Record<string, I18nMessage>,
  };

  private currentLocale = 'vi';

  translate(messageKey: string, params: Record<string, any> = {}): I18nMessage {
    const message = this.messages[this.currentLocale][messageKey];

    if (!message) {
      return {
        title: 'Lỗi không xác định',
        detail: `Không tìm thấy message key: ${messageKey}`,
      };
    }

    return {
      title: this.interpolate(message.title, params),
      detail: this.interpolate(message.detail, params),
    };
  }

  private interpolate(template: string, params: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  setLocale(locale: string): void {
    this.currentLocale = locale;
  }

  getLocale(): string {
    return this.currentLocale;
  }
}
