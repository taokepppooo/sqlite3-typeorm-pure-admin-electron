import type { Repository } from "typeorm";
import { DatabaseManager } from "../database";

export class BaseRepository<T> {
  private repository: Repository<T> | null = null;
  private entity: { new (): T };

  constructor(entity: { new (): T }) {
    this.entity = entity;
  }

  public async getRepository(): Promise<Repository<T>> {
    if (!this.repository) {
      this.repository = await DatabaseManager.getInstance().getRepository<T>(this.entity);
    }

    return this.repository;
  }
}
