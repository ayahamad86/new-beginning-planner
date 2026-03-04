import { hash, compare } from 'bcryptjs';

export async function hashPassword(password: string) {
  const saltRounds = 10;
  return hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword);
}
