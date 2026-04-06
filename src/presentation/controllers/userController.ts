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
   private loginUseCase:ILoginUserUseCase,
   @inject (TOKENS.RefreshtokenUseCase)
   private refreshTokenUseCase:IRefreshAccessTokenUseCase,
   @inject(TOKENS.IGoogleAuthUseCase)
   private googleAuthUseCase:IGoogleAuthUseCase
  ) {}
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name ,email,password } = req.body;
      await this.startRegistrationUseCase.execute({ name, email, password });
      res.status(HttpStatus.OK).json({ message: "OTP sent to your email. Please verify to complete registration." });
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const user = await this.verifyOTPUseCase.execute(email, otp);
      res.status(HttpStatus.CREATED).json({ user, message: "Registration successful!" });
    } catch (err) {
      next(err);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await this.resendOTPUseCase.execute(email);
      res.status(HttpStatus.OK).json({ message: "A new OTP has been sent to your email." });
    } catch (err) {
      next(err);
    }
  }
 async login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, name } = await this.loginUseCase.execute({ email, password });
    
    res.cookie(AUTH.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === AUTH.PRODUCTION,
      sameSite:AUTH.STRICT_MODE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(HttpStatus.CREATED).json({
      accessToken: accessToken,
      name
    });
  } catch (err) {
    next(err);
  }
}

 async refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies["refreshToken"];

   const accessToken=await this.refreshTokenUseCase.execute(refreshToken);

     res.status(HttpStatus.CREATED).json({ accessToken });
  } catch (err) {
    next(err);
  }
}

 async logout(req: Request, res: Response, next: NextFunction) {
  try {

    res.clearCookie(AUTH.REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
     secure: process.env.NODE_ENV === AUTH.PRODUCTION,
      sameSite:AUTH.STRICT_MODE,
      maxAge: 7 * 24 * 60 * 60 * 1000,

    });

  
     res.status(HttpStatus.OK).json({ message: MESSAGES.USER_LOGOUT });
  } catch (err) {
    next(err);
  }
}
async googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const {  credential } = req.body;
      console.log(req.body)
    const {accessToken,refreshToken,name} = await this.googleAuthUseCase.execute({ credential });
  res.cookie(AUTH.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === AUTH.PRODUCTION,
      sameSite:AUTH.STRICT_MODE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(HttpStatus.CREATED).json({
      accessToken: accessToken,
      name
    });
  } catch (err) {
    next(err);
  }
}

}

