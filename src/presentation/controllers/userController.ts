import { Request, Response, NextFunction } from "express";
import {inject, singleton } from "tsyringe";
import { HttpStatus } from "@constants/httpStatus";
import { MESSAGES } from "@constants/messages";
import { IRegisterUserUseCase } from "@application/use_cases/user/IUserRegisterUseCase";
import { TOKENS } from "@constants/tokens";
import { ILoginUserUseCase } from "@application/use_cases/user/IUserLogin";
import { AUTH } from "@constants/auth";
import { IRefreshAccessTokenUseCase } from "@application/use_cases/user/IUserRefreshTokenUseCase";
import { IGoogleAuthUseCase } from "@application/use_cases/user/IGoogleAuthUseCase";

@singleton()
export class UserController {
    constructor(

   @inject(TOKENS.RegisterUserUseCase)
   private registerUseCase:IRegisterUserUseCase,
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
    console.log(req.body)
      const user = await this.registerUseCase.execute({ name, email, password });

      res.status(HttpStatus.CREATED).json({ user });
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

