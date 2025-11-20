import { Injectable } from '@nestjs/common';
import * as vi from './locales/vi.json';

export interface I18nMessage {
  title: string;
  detail: string;
}

type MessageType = 'RFC7807' | 'Validation' | 'Success';

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
    vi: vi as MessageStructure,
  };

  private currentLocale = 'vi';

  /**
   * Translate a message key to localized message
   * @param messageKey Format: "Type.key" hoặc "Type.key.subkey" hoặc chỉ "key" (mặc định Type=RFC7807)
   * @param params Parameters for interpolation using :param syntax
   * @returns I18nMessage with title and detail
   */
  translate(messageKey: string, params: Record<string, any> = {}): I18nMessage {
    const parts = messageKey.split('.');
    let type: string;
    let key: string;
    let subKey: string | undefined;

    // Determine type, key, and subKey based on parts
    if (parts.length === 1) {
      // Only key provided, default to RFC7807
      type = 'RFC7807';
      key = parts[0];
    } else if (parts.length === 2) {
      // Type.key format
      type = parts[0];
      key = parts[1];
    } else if (parts.length >= 3) {
      // Type.key.subKey format
      type = parts[0];
      key = parts[1];
      subKey = parts[2];
    } else {
      return this.getErrorMessage(messageKey);
    }

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
