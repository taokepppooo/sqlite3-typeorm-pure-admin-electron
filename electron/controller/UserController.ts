import type { User } from "../entities/User";
import { userService } from "../service/UserService";

export class UserController {
  async save(user: User): Promise<void> {
    return userService.save(user);
  }
}
