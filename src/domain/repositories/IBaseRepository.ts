export abstract class BaseRepository<T> {
    protected abstract map(entity: any): Partial<T> | null;

  protected mapArray(entities: any[]): Partial<T>[] {
    // filter(Boolean) removes nulls
    return entities
      .map((entity) => this.map(entity))
      .filter((e): e is Partial<T> => e !== null);
  }

  abstract create(data: Partial<T>): Promise<Partial<T>>;
  abstract findById(id: string): Promise<Partial<T> | null>;
  abstract findAll(): Promise<Partial<T>[]>;
  abstract update(id: string, data: Partial<T>): Promise<Partial<T> | null>;
  abstract delete(id: string): Promise<boolean>;
}
