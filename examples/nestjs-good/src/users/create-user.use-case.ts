import type { UserRepositoryPort } from "./user.repository.port";

export class CreateUserUseCase {
  public constructor(private readonly users: UserRepositoryPort) {}

  public execute(email: string): Promise<void> {
    return this.users.save({ email });
  }
}
