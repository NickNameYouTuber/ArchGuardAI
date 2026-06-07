import { UserRepository } from "./user.repository";

export class UsersController {
  public constructor(private readonly users: UserRepository) {}

  public execute(email: string): Promise<void> {
    return this.users.save({ email });
  }
}
