import type { UserRepositoryPort } from "./user.repository.port";

export class UserRepository implements UserRepositoryPort {
  public async save(_user: { email: string }): Promise<void> {
    await Promise.resolve();
  }
}
