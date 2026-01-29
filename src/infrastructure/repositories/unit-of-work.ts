import mongoose, { type ClientSession } from "mongoose";
import { logger } from "@/shared/logger";
import type { IUnitOfWork } from "./interfaces";

export class MongoUnitOfWork implements IUnitOfWork {
  private session: ClientSession | null = null;
  private isTransactionActive = false;

  async startTransaction(): Promise<void> {
    if (this.isTransactionActive) {
      throw new Error("Transaction already in progress");
    }

    this.session = await mongoose.startSession();
    this.session.startTransaction();
    this.isTransactionActive = true;
    logger.debug("Transaction started");
  }

  async commitTransaction(): Promise<void> {
    if (!this.session || !this.isTransactionActive) {
      throw new Error("No active transaction to commit");
    }

    await this.session.commitTransaction();
    this.isTransactionActive = false;
    logger.debug("Transaction committed");
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.session || !this.isTransactionActive) {
      throw new Error("No active transaction to rollback");
    }

    await this.session.abortTransaction();
    this.isTransactionActive = false;
    logger.debug("Transaction rolled back");
  }

  getSession(): ClientSession | null {
    return this.session;
  }

  async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    await this.startTransaction();

    try {
      const result = await work();
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    } finally {
      await this.endSession();
    }
  }

  private async endSession(): Promise<void> {
    if (this.session) {
      await this.session.endSession();
      this.session = null;
      this.isTransactionActive = false;
    }
  }
}
