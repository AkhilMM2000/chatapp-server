import { Request, Response, NextFunction } from "express";
import {inject, singleton } from "tsyringe";
import { HttpStatus } from "@constants/httpStatus";
import { MESSAGES } from "@constants/messages";
import { IRefreshAccessTokenUseCase } from "@application/use_cases/user/IUserRefreshTokenUseCase";
import { IGoogleAuthUseCase } from "@application/use_cases/user/IGoogleAuthUseCase";
import { IStartRegistrationUseCase } from "@application/use_cases/user/IStartRegistrationUseCase";
import { IVerifyOTPUseCase } from "@application/use_cases/user/IVerifyOTPUseCase";
import { IResendOTPUseCase } from "@application/use_cases/user/IResendOTPUseCase";
import { TOKENS } from "@constants/tokens";
import { AUTH } from "@constants/auth";
import { ILoginUserUseCase } from "@application/use_cases/user/IUserLogin";
import { IUpdateProfileUseCase } from "@application/use_cases/user/IUpdateProfileUseCase";
import { IRoomRepository } from "@domain/repositories/IRoomRepository";
import { getIO } from "@infrastructure/realtime/socket";
import { IAuthService } from "@application/services/IAuthService";

@singleton()
export class UserController {
  constructor(
    @inject(TOKENS.StartRegistrationUseCase)
    private startRegistrationUseCase: IStartRegistrationUseCase,
    @inject(TOKENS.VerifyOTPUseCase)
    private verifyOTPUseCase: IVerifyOTPUseCase,
    @inject(TOKENS.ResendOTPUseCase)
    private resendOTPUseCase: IResendOTPUseCase,
    @inject(TOKENS.LoginUseCase)
    private loginUseCase: ILoginUserUseCase,
    @inject(TOKENS.RefreshtokenUseCase)
    private refreshTokenUseCase: IRefreshAccessTokenUseCase,
    @inject(TOKENS.IGoogleAuthUseCase)
    private googleAuthUseCase: IGoogleAuthUseCase,
    @inject(TOKENS.UpdateProfileUseCase)
    private updateProfileUseCase: IUpdateProfileUseCase,
    @inject(TOKENS.IChatRoomRepository)
    private roomRepository: IRoomRepository,
    @inject(TOKENS.AuthService)
    private authService: IAuthService
  ) {}
  async register(req: Request, res: Response) {
    const { name, email, password } = req.body;
    await this.startRegistrationUseCase.execute({ name, email, password });
    res.status(HttpStatus.OK).json({
      message: "OTP sent to your email. Please verify to complete registration.",
    });
  }

  async verifyOtp(req: Request, res: Response) {
    const { email, otp } = req.body;
    const user = await this.verifyOTPUseCase.execute(email, otp);
    res.status(HttpStatus.CREATED).json({ user, message: "Registration successful!" });
  }

  async resendOtp(req: Request, res: Response) {
    const { email } = req.body;
    await this.resendOTPUseCase.execute(email);
    res.status(HttpStatus.OK).json({ message: "A new OTP has been sent to your email." });
  }
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { accessToken, refreshToken, name } = await this.loginUseCase.execute({
      email,
      password,
    });

    res.cookie(AUTH.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === AUTH.PRODUCTION,
      sameSite: process.env.NODE_ENV === AUTH.PRODUCTION ? AUTH.NONE_MODE : AUTH.LAX_MODE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(HttpStatus.CREATED).json({
      accessToken: accessToken,
      name,
    });
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies[AUTH.REFRESH_TOKEN_COOKIE];
    const accessToken = await this.refreshTokenUseCase.execute(refreshToken);
    res.status(HttpStatus.CREATED).json({ accessToken });
  }

  async logout(req: Request, res: Response) {
    res.clearCookie(AUTH.REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === AUTH.PRODUCTION,
      sameSite: AUTH.STRICT_MODE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(HttpStatus.OK).json({ message: MESSAGES.USER_LOGOUT });
  }

  async googleAuth(req: Request, res: Response) {
    const { credential } = req.body;
    const { accessToken, refreshToken, name } = await this.googleAuthUseCase.execute({
      credential,
    });

    res.cookie(AUTH.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === AUTH.PRODUCTION,
      sameSite: process.env.NODE_ENV === AUTH.PRODUCTION ? AUTH.NONE_MODE : AUTH.LAX_MODE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(HttpStatus.CREATED).json({
      accessToken: accessToken,
      name,
    });
  }

  async updateProfile(req: Request, res: Response) {
    const userId = (req as any).user.userId; 
    const { name, profilePic } = req.body;
    
    await this.updateProfileUseCase.execute(userId, { name, profilePic });

    // 🔄 Sync across all rooms
    await this.roomRepository.updateParticipantProfile(userId, { name, profilePic });

    // 📡 Broadcast to everyone online
    const io = getIO();
    io.emit("USER_PROFILE_UPDATED", {
      userId,
      name,
      profilePic
    });

    // 🔑 Generate new tokens with updated profilePic
    const payload = { userId, name, profilePic };
    const accessToken = this.authService.generateAccessToken(payload);
    const refreshToken = this.authService.generateRefreshToken(payload);

    res.cookie(AUTH.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === AUTH.PRODUCTION,
      sameSite: process.env.NODE_ENV === AUTH.PRODUCTION ? AUTH.NONE_MODE : AUTH.LAX_MODE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(HttpStatus.OK).json({ 
      message: "Profile updated successfully!",
      accessToken
    });
  }

}

