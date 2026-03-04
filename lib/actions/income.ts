'use server';

import { prisma } from '@/lib/db';
import { validateIncome, calculateMonthlyEquivalent } from '@/lib/validators';

export async function createIncome(
  userId: string,
  data: {
    name: string;
    amount: number;
    frequency: string;
  }
) {
  try {
    const validation = validateIncome(data);
    if (!validation.valid) {
      return { error: validation.errors[0] };
    }

    const income = await prisma.income.create({
      data: {
        userId,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency,
      },
    });

    return { success: true, income };
  } catch (error) {
    console.error('Create income error:', error);
    return { error: 'Failed to create income' };
  }
}

export async function updateIncome(
  incomeId: string,
  data: {
    name?: string;
    amount?: number;
    frequency?: string;
  }
) {
  try {
    const income = await prisma.income.update({
      where: { id: incomeId },
      data,
    });

    return { success: true, income };
  } catch (error) {
    console.error('Update income error:', error);
    return { error: 'Failed to update income' };
  }
}

export async function deleteIncome(incomeId: string) {
  try {
    await prisma.income.delete({
      where: { id: incomeId },
    });

    return { success: true };
  } catch (error) {
    console.error('Delete income error:', error);
    return { error: 'Failed to delete income' };
  }
}

export async function getIncomes(userId: string) {
  try {
    const incomes = await prisma.income.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, incomes };
  } catch (error) {
    console.error('Get incomes error:', error);
    return { error: 'Failed to fetch incomes', incomes: [] };
  }
}

export async function calculateMonthlyIncome(userId: string, adjustmentPercentage: number = 0) {
  try {
    const incomes = await prisma.income.findMany({
      where: { userId },
    });

    let total = 0;
    incomes.forEach((income) => {
      const monthly = calculateMonthlyEquivalent(income.amount, income.frequency);
      const adjusted = monthly * (1 + adjustmentPercentage / 100);
      total += adjusted;
    });

    return { success: true, monthlyIncome: total };
  } catch (error) {
    console.error('Calculate monthly income error:', error);
    return { error: 'Failed to calculate income', monthlyIncome: 0 };
  }
}
