export class TokenPair {
  private accessToken: string;
  private refreshToken: string;

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  static create(accessToken: string, refreshToken: string): TokenPair {
    return new TokenPair(accessToken, refreshToken);
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  getRefreshToken(): string {
    return this.refreshToken;
  }

  toJSON() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }
}
