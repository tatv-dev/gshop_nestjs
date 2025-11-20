import { Injectable } from '@nestjs/common';
import viMessages from './locales/vi.json';

export interface I18nMessage {
  title: string;
  detail: string;
}

type MessageType = 'error' | 'validation' | 'success';

interface MessageStructure {
  [type: string]: {
    [key: string]: I18nMessage | {
      [subKey: string]: I18nMessage;
    };
  };
}

@Injectable()
export class I18nService {
  private messages: Record<string, MessageStructure> = {
    vi: viMessages as MessageStructure,
  };

  private currentLocale = 'vi';

  /**
   * Translate a message key to localized message
   * @param messageKey Format: "type.key" hoặc "type.key.subkey" (e.g., "error.bad_request", "validation.max.string")
   * @param params Parameters for interpolation using :param syntax
   * @returns I18nMessage with title and detail
   *
   * Examples:
   * - translate('error.bad_request') → error type, bad_request key
   * - translate('validation.required', { attribute: 'email' }) → validation type, required key
   * - translate('validation.max.string', { attribute: 'name', max: 255 }) → validation type, max key, string subkey
   * - translate('success.stored', { resource: 'Product' }) → success type, stored key
   */
  translate(messageKey: string, params: Record<string, any> = {}): I18nMessage {
    const parts = messageKey.split('.');

    if (parts.length < 2) {
      return this.getErrorMessage(messageKey);
    }

    const type = parts[0];
    const key = parts[1];
    const subKey = parts.length >= 3 ? parts[2] : undefined;

    try {
      const typeMessages = this.messages[this.currentLocale][type];

      if (!typeMessages) {
        return this.getErrorMessage(messageKey);
      }

      const keyMessages = typeMessages[key];

      if (!keyMessages) {
        return this.getErrorMessage(messageKey);
      }

      let message: I18nMessage;

      // Check if it has subKey
      if (subKey) {
        const subKeyMessages = keyMessages as { [subKey: string]: I18nMessage };
        message = subKeyMessages[subKey];

        if (!message) {
          return this.getErrorMessage(messageKey);
        }
      } else {
        // Direct message (no subKey)
        if ('title' in keyMessages && 'detail' in keyMessages) {
          message = keyMessages as I18nMessage;
        } else {
          return this.getErrorMessage(messageKey);
        }
      }

      return {
        title: this.interpolate(message.title, params),
        detail: this.interpolate(message.detail, params),
      };
    } catch (error) {
      return this.getErrorMessage(messageKey);
    }
  }

  /**
   * Interpolate parameters into template string using :param syntax
   * @param template Template string with :param placeholders
   * @param params Parameters to replace
   * @returns Interpolated string
   */
  private interpolate(template: string, params: Record<string, any>): string {
    return template.replace(/:(\w+)/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  private getErrorMessage(messageKey: string): I18nMessage {
    return {
      title: 'Lỗi không xác định',
      detail: `Không tìm thấy message key: ${messageKey}`,
    };
  }

  setLocale(locale: string): void {
    this.currentLocale = locale;
  }

  getLocale(): string {
    return this.currentLocale;
  }
}
