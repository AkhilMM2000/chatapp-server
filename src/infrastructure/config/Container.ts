import { container } from "tsyringe";
import { HashService } from "@application/services/IHashService";
import { BcryptHashService } from "@infrastructure/services/BcryptHashService";
import { TOKENS } from "@constants/tokens";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { MongoUserRepository } from "@infrastructure/repositories/MongoUserRepository";
import { RegisterUser } from "@application/use_cases/user/UserRegisterUseCase";
import { IRegisterUserUseCase } from "@application/use_cases/user/IUserRegisterUseCase";
import { IAuthService } from "@application/services/IAuthService";
import { JWTAuthService } from "@infrastructure/services/JwtAuthService";
import { IAIService } from "@application/services/IAIService";
import { GeminiAIService } from "@infrastructure/services/GeminiAIService";
import { IMediaService } from "@application/services/IMediaService";
import { S3MediaService } from "@infrastructure/services/S3MediaService";
import { IRateLimitRepository } from "@domain/repositories/IRateLimitRepository";
import { InMemoryRateLimitRepository } from "@infrastructure/repositories/InMemoryRateLimitRepository";
import { ILoginUserUseCase } from "@application/use_cases/user/IUserLogin";
import { LoginUser } from "@application/use_cases/user/UserLogin";
import { IRefreshAccessTokenUseCase } from "@application/use_cases/user/IUserRefreshTokenUseCase";
import { RefreshAccessTokenUseCase } from "@application/use_cases/user/UserRefreshTokenUseCase";
import { IRoomRepository } from "@domain/repositories/IRoomRepository";
import { MongoRoomRepository } from "@infrastructure/repositories/MongoRoomRepository";
import { IMessageRepository } from "@domain/repositories/IMessageRepository";
import { MongoMessageRepository } from "@infrastructure/repositories/MongoMessageRepository";
import { ICreateRoomUseCase } from "@application/use_cases/chat/ICreateRoomUseCase";
import { CreateRoom } from "@application/use_cases/chat/CreateRoomUseCase";
import { IAddParticipantUseCase } from "@application/use_cases/chat/AddParticipantUseCase";
import { AddParticipant } from "@application/use_cases/chat/IAddParticipantUseCase";
import { ISendMessageUseCase } from "@application/use_cases/chat/ISendMessageUseCase";
import { SendMessageUseCase } from "@application/use_cases/chat/SendMessageUseCase";
import { IGetMessagesUseCase } from "@application/use_cases/chat/IGetMessageUseCase";
import { GetMessagesUseCase } from "@application/use_cases/chat/GetMessagesUseCase";
import { IGetRoomUseCase } from "@application/use_cases/chat/IGetRoomUseCase";
import { GetRoomUseCase } from "@application/use_cases/chat/GetRoomUseCase";
import { IGoogleAuthUseCase } from "@application/use_cases/user/IGoogleAuthUseCase";
import { GoogleAuthUseCase } from "@application/use_cases/user/GoogleAuthUseCase";
import { IEmailService } from "@application/services/IEmailService";
import { NodeMailerService } from "@infrastructure/services/NodeMailerService";
import { IOTPRepository } from "@domain/repositories/IOTPRepository";
import { MongoOTPRepository } from "@infrastructure/repositories/MongoOTPRepository";
import { IPresenceRepository } from "@domain/repositories/IPresenceRepository";
import { InMemoryPresenceRepository } from "@infrastructure/repositories/InMemoryPresenceRepository";
import { IStartRegistrationUseCase } from "@application/use_cases/user/IStartRegistrationUseCase";
import { StartRegistration } from "@application/use_cases/user/StartRegistrationUseCase";
import { IVerifyOTPUseCase } from "@application/use_cases/user/IVerifyOTPUseCase";
import { VerifyOTP } from "@application/use_cases/user/VerifyOTPUseCase";
import { IResendOTPUseCase } from "@application/use_cases/user/IResendOTPUseCase";
import { ResendOTP } from "@application/use_cases/user/ResendOTPUseCase";

container.registerSingleton<HashService>(TOKENS.GetHashToken, BcryptHashService);
container.registerSingleton<IUserRepository>(TOKENS.IUserRepository, MongoUserRepository);

//usecase registration
container.registerSingleton<IRegisterUserUseCase>(TOKENS.RegisterUserUseCase, RegisterUser);

container.registerSingleton<IAuthService>(TOKENS.AuthService, JWTAuthService);
container.registerSingleton<IAIService>(TOKENS.IAIService, GeminiAIService);
container.registerSingleton<ILoginUserUseCase>(TOKENS.LoginUseCase, LoginUser);
container.registerSingleton<IRefreshAccessTokenUseCase>(
  TOKENS.RefreshtokenUseCase,
  RefreshAccessTokenUseCase,
);
container.registerSingleton<ICreateRoomUseCase>(TOKENS.CreateRoomUseCase, CreateRoom);
container.registerSingleton<IRoomRepository>(TOKENS.IChatRoomRepository, MongoRoomRepository);

container.registerSingleton<IMessageRepository>(TOKENS.IMessageRepository, MongoMessageRepository);

 
container.registerSingleton<IAddParticipantUseCase>(
  TOKENS.AddParticipantUseCase,
AddParticipant
)
container.registerSingleton<ISendMessageUseCase>(
  TOKENS.ISendMessageUseCase,
  SendMessageUseCase
)

container.registerSingleton<IGetMessagesUseCase>(
  TOKENS.IGetMessageUseCase,
GetMessagesUseCase
)

container.registerSingleton<IGetRoomUseCase>(
  TOKENS.GetRoomUseCase,
  GetRoomUseCase
)

container.registerSingleton<IGoogleAuthUseCase>(
  TOKENS.IGoogleAuthUseCase,
  GoogleAuthUseCase
)

/*
container.registerSingleton<IAIService>(
  TOKENS.AIService,
  GeminiAIService
)
*/

container.registerSingleton<IEmailService>(TOKENS.IEmailService, NodeMailerService);
container.registerSingleton<IOTPRepository>(TOKENS.IOTPRepository, MongoOTPRepository);
container.registerSingleton<IPresenceRepository>(TOKENS.IPresenceRepository, InMemoryPresenceRepository);
container.registerSingleton<IMediaService>(TOKENS.IMediaService, S3MediaService);
container.registerSingleton<IRateLimitRepository>(TOKENS.IRateLimitRepository, InMemoryRateLimitRepository);
container.registerSingleton<IStartRegistrationUseCase>(TOKENS.StartRegistrationUseCase, StartRegistration);
container.registerSingleton<IVerifyOTPUseCase>(TOKENS.VerifyOTPUseCase, VerifyOTP);
container.registerSingleton<IResendOTPUseCase>(TOKENS.ResendOTPUseCase, ResendOTP);