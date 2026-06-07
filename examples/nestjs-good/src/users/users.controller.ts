import { CreateUserUseCase } from "./create-user.use-case";

export class UsersController {
  public constructor(private readonly createUser: CreateUserUseCase) {}

  public execute(email: string): Promise<void> {
    return this.createUser.execute(email);
  }
}
