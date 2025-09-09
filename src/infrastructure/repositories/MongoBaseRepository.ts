// src/infrastructure/repositories/MongoBaseRepository.ts
import { Document, Model } from "mongoose";

export abstract class MongoBaseRepository<T extends Document, U> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<U> {
    const doc = new this.model(data);
    const saved = await doc.save();
    return this.map(saved);
  }

  async findById(id: string): Promise<U | null> {
    const doc = await this.model.findById(id);
    return doc ? this.map(doc) : null;
  }

  async findAll(): Promise<U[]> {
    const docs = await this.model.find();
    return this.mapArray(docs);
  }

  async update(id: string, data: Partial<T>): Promise<U | null> {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true });
    return doc ? this.map(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Map a single mongoose document to domain-safe object
   * (e.g. exclude password, internal fields, etc.)
   */
  protected abstract map(doc: T): U;

  /**
   * Map an array of mongoose documents
   */
  protected mapArray(docs: T[]): U[] {
    return docs.map((doc) => this.map(doc));
  }
}
