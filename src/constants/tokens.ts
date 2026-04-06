
export const TOKENS = {
  IUserRepository: Symbol.for("IUserRepository"),
  IMessageRepository: Symbol.for("IMessageRepository"),
  IChatRoomRepository: Symbol.for("IChatRoomRepository"),
  AuthService: Symbol.for("AuthService"),
  IGoogleAuthUseCase:Symbol.for('IGoogleAuthUseCase'),
  SocketService: Symbol.for("SocketService"),
  SendMessageUseCase: Symbol.for("SendMessageUseCase"),
  GetMessagesUseCase: Symbol.for("GetMessagesUseCase"),
  GetHashToken:Symbol.for('GetHashToken'),
  RegisterUserUseCase:Symbol.for("RegisterUserUseCase"),
  RefreshtokenUseCase:Symbol.for("RefreshTokenUseCase"),
  LoginUseCase:Symbol.for("LoginUseCase"),
  CreateRoomUseCase:Symbol.for("CreateRoomUseCase"),
  AddParticipantUseCase:Symbol.for('AddParticipantUseCase'),
  ISendMessageUseCase:Symbol.for('ISendMessageUseCase'),
  IGetMessageUseCase:Symbol.for('IGetMessagesUseCase'),
  GetRoomUseCase:Symbol.for('IGetRoomUseCase'),

} as const;

