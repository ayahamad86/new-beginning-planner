'use server';

import { prisma } from '@/lib/db';
import { validateEmergencyFund } from '@/lib/validators';

export async function createOrUpdateEmergencyFund(
  userId: string,
  data: {
    targetAmount: number;
    targetDate: string;
    currentAmount: number;
  }
) {
  try {
    const validation = validateEmergencyFund(data);
    if (!validation.valid) {
      return { error: validation.errors[0] };
    }

    // Calculate recommended monthly contribution
    const now = new Date();
    const targetDate = new Date(data.targetDate);
    const monthsRemaining = Math.ceil(
      (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    const recommendedMonthly = monthsRemaining > 0 ? 
      (data.targetAmount - data.currentAmount) / monthsRemaining : 
      data.targetAmount - data.currentAmount;

    // Check if emergency fund already exists
    const existing = await prisma.emergencyFund.findUnique({
      where: { userId },
    });

    if (existing) {
      const updated = await prisma.emergencyFund.update({
        where: { userId },
        data: {
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount,
          targetDate: new Date(data.targetDate),
          recommendedMonthly,
        },
      });

      return { success: true, emergencyFund: updated };
    } else {
      const created = await prisma.emergencyFund.create({
        data: {
          userId,
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount,
          targetDate: new Date(data.targetDate),
          recommendedMonthly,
        },
      });

      return { success: true, emergencyFund: created };
    }
  } catch (error) {
    console.error('Create/update emergency fund error:', error);
    return { error: 'Failed to save emergency fund' };
  }
}

export async function getEmergencyFund(userId: string) {
  try {
    const emergencyFund = await prisma.emergencyFund.findUnique({
      where: { userId },
    });

    return { success: true, emergencyFund };
  } catch (error) {
    console.error('Get emergency fund error:', error);
    return { error: 'Failed to fetch emergency fund', emergencyFund: null };
  }
}

export async function updateEmergencyFundAmount(userId: string, currentAmount: number) {
  try {
    const emergencyFund = await prisma.emergencyFund.update({
      where: { userId },
      data: { currentAmount },
    });

    return { success: true, emergencyFund };
  } catch (error) {
    console.error('Update emergency fund amount error:', error);
    return { error: 'Failed to update emergency fund' };
  }
}
