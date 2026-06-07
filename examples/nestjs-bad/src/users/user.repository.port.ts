export interface UserRepositoryPort {
  save(user: { email: string }): Promise<void>;
}
