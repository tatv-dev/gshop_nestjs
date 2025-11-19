export class BasicAuthenticationDTO {
  username: string;
  password: string;
  softwareId: number;

  constructor(username: string, password: string, softwareId: number) {
    this.username = username;
    this.password = password;
    this.softwareId = softwareId;
  }
}
