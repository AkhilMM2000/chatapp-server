export interface IOTPData {
  email: string;
  otp: string;
  name: string;
  password: string; // hashed password
  createdAt: Date;
}

export interface IOTPRepository {
  save(data: IOTPData): Promise<void>;
  findByEmail(email: string): Promise<IOTPData | null>;
  deleteByEmail(email: string): Promise<void>;
}
