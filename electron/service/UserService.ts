import type { User } from "../entities/User";
import { UserRepository } from "../repository/UserRepository";

class UserService {
  private userRepository = new UserRepository();

  async save(user: User): Promise<void> {
    const repository = await this.userRepository.getRepository();
    repository.save(user);
  }
}

export const userService = new UserService();
