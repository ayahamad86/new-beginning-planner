'use server';

import { prisma } from '@/lib/db';
import { validateBill } from '@/lib/validators';

export async function createBill(
  userId: string,
  data: {
    name: string;
    amount: number;
    dueDate: number;
    category: string;
  }
) {
  try {
    const validation = validateBill(data);
    if (!validation.valid) {
      return { error: validation.errors[0] };
    }

    const now = new Date();
    const bill = await prisma.bill.create({
      data: {
        userId,
        name: data.name,
        amount: data.amount,
        dueDate: data.dueDate,
        category: data.category,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    return { success: true, bill };
  } catch (error) {
    console.error('Create bill error:', error);
    return { error: 'Failed to create bill' };
  }
}

export async function updateBill(
  billId: string,
  data: {
    name?: string;
    amount?: number;
    dueDate?: number;
    category?: string;
    isPaid?: boolean;
  }
) {
  try {
    const bill = await prisma.bill.update({
      where: { id: billId },
      data: {
        ...data,
        paidDate: data.isPaid ? new Date() : null,
      },
    });

    return { success: true, bill };
  } catch (error) {
    console.error('Update bill error:', error);
    return { error: 'Failed to update bill' };
  }
}

export async function deleteBill(billId: string) {
  try {
    await prisma.bill.delete({
      where: { id: billId },
    });

    return { success: true };
  } catch (error) {
    console.error('Delete bill error:', error);
    return { error: 'Failed to delete bill' };
  }
}

export async function getBills(userId: string, month?: number, year?: number) {
  try {
    const now = new Date();
    const queryMonth = month || now.getMonth() + 1;
    const queryYear = year || now.getFullYear();

    const bills = await prisma.bill.findMany({
      where: {
        userId,
        month: queryMonth,
        year: queryYear,
      },
      orderBy: { dueDate: 'asc' },
    });

    return { success: true, bills };
  } catch (error) {
    console.error('Get bills error:', error);
    return { error: 'Failed to fetch bills', bills: [] };
  }
}

export async function getBillsDueNext7Days(userId: string) {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    let bills = await prisma.bill.findMany({
      where: {
        userId,
        month: currentMonth,
        year: currentYear,
        isPaid: false,
      },
    });

    bills = bills.filter((bill) => {
      const billDate = new Date(now.getFullYear(), now.getMonth(), bill.dueDate);
      return billDate >= now && billDate <= in7Days;
    });

    // Check next month if we're near month end
    if (currentMonth !== nextMonth) {
      const nextMonthBills = await prisma.bill.findMany({
        where: {
          userId,
          month: nextMonth,
          year: nextYear,
          isPaid: false,
        },
      });

      bills = [...bills, ...nextMonthBills.filter((bill) => {
        if (bill.dueDate >= 1 && bill.dueDate <= 7) {
          return true;
        }
        return false;
      })];
    }

    return { success: true, bills };
  } catch (error) {
    console.error('Get bills due error:', error);
    return { error: 'Failed to fetch bills', bills: [] };
  }
}
