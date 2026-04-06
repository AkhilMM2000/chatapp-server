export interface IEmailService {
  sendOTP(email: string, otp: string): Promise<void>;
}
