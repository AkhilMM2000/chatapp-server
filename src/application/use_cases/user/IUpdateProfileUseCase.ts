export interface IUpdateProfileUseCase {
  execute(userId: string, data: { name?: string; profilePic?: string }): Promise<void>;
}
