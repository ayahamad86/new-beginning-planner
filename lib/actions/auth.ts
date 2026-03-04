'use server';

import { prisma } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { validateEmail, validatePassword } from '@/lib/validators';

export async function registerUser(email: string, password: string, name: string) {
  try {
    // Validate inputs
    if (!validateEmail(email)) {
      return { error: 'Invalid email format' };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { error: passwordValidation.errors[0] };
    }

    if (!name?.trim()) {
      return { error: 'Name is required' };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email already in use' };
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Registration failed' };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    if (!validateEmail(email)) {
      return { error: 'Invalid email format' };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      return { error: 'Invalid email or password' };
    }

    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Login failed' };
  }
}
