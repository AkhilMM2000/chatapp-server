import nodemailer from "nodemailer";
import { IEmailService } from "@application/services/IEmailService";
import { injectable } from "tsyringe";

@injectable()
export class NodeMailerService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: `"Chat App Assistant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Registration",
      text: `Welcome to our Chat App! Your verification code is: ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h2 style="color: #4A90E2; text-align: center;">Email Verification</h2>
          <p>Thank you for joining our Chat App. Please use the following code to complete your registration:</p>
          <div style="font-size: 24px; font-weight: bold; text-align: center; background: #f4f4f4; padding: 10px; border-radius: 5px; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="text-align: center; margin-top: 20px; color: #777;">This code is valid for 5 minutes.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
