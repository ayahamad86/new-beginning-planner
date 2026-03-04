'use server';

import { jsPDF } from 'jspdf';
import { prisma } from '@/lib/db';
import { formatCurrency, getCurrentMonthYear } from '@/lib/utils';
import { calculateMonthlyIncome } from './actions/income';

export async function generateMonthlyPDFSummary(userId: string) {
  try {
    // Fetch all required data
    const { month, year } = getCurrentMonthYear();

    const incomes = await prisma.income.findMany({ where: { userId } });
    const bills = await prisma.bill.findMany({
      where: { userId, month, year },
    });
    const reflections = await prisma.reflection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    const emergencyFund = await prisma.emergencyFund.findUnique({
      where: { userId },
    });

    // Calculate income
    const monthlyIncomeResult = await calculateMonthlyIncome(userId);
    const monthlyIncome = monthlyIncomeResult.monthlyIncome || 0;

    // Calculate bills
    const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidBills = bills
      .filter((b) => b.isPaid)
      .reduce((sum, bill) => sum + bill.amount, 0);

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(51, 51, 51);
    doc.text('New Beginning Budget Planner', pageWidth / 2, yPosition, {
      align: 'center',
    });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Monthly Summary - ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );

    yPosition += 15;
    doc.setTextColor(51, 51, 51);

    // Income Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Income Summary', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    incomes.forEach((income) => {
      doc.text(
        `${income.name} (${income.frequency}): ${formatCurrency(income.amount)}`,
        30,
        yPosition
      );
      yPosition += 6;
    });

    yPosition += 3;
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Total Monthly Income: ${formatCurrency(monthlyIncome)}`,
      30,
      yPosition
    );

    yPosition += 12;

    // Bills Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Bills & Expenses', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    bills.forEach((bill) => {
      const status = bill.isPaid ? '✓' : '○';
      doc.text(
        `${status} ${bill.name} (Due: Day ${bill.dueDate}): ${formatCurrency(bill.amount)}`,
        30,
        yPosition
      );
      yPosition += 6;
    });

    yPosition += 3;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Bills: ${formatCurrency(totalBills)}`, 30, yPosition);
    yPosition += 6;
    doc.text(`Paid: ${formatCurrency(paidBills)}`, 30, yPosition);
    yPosition += 6;
    doc.text(
      `Remaining: ${formatCurrency(totalBills - paidBills)}`,
      30,
      yPosition
    );

    yPosition += 12;

    // Budget Room
    const budgetRoom = monthlyIncome - totalBills;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Budget Analysis', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Monthly Income: ${formatCurrency(monthlyIncome)}`, 30, yPosition);
    yPosition += 6;
    doc.text(`Monthly Expenses: ${formatCurrency(totalBills)}`, 30, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Budget Room: ${formatCurrency(Math.max(budgetRoom, 0))}`,
      30,
      yPosition
    );

    // Check if we need a new page
    yPosition += 15;
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    // Emergency Fund Section
    if (emergencyFund) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Emergency Fund Status', 20, yPosition);

      yPosition += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Goal: ${formatCurrency(emergencyFund.targetAmount)}`,
        30,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Current: ${formatCurrency(emergencyFund.currentAmount)}`,
        30,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Recommended Monthly: ${formatCurrency(emergencyFund.recommendedMonthly)}`,
        30,
        yPosition
      );
      yPosition += 6;

      const progress = Math.round(
        (emergencyFund.currentAmount / emergencyFund.targetAmount) * 100
      );
      doc.text(`Progress: ${progress}%`, 30, yPosition);

      yPosition += 12;
    }

    // Recent Reflections Section
    if (reflections.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Recent Reflections', 20, yPosition);

      yPosition += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      reflections.forEach((reflection, idx) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(
          `${idx + 1}. Mood: ${reflection.mood} | Emotional Spend: ${formatCurrency(reflection.emotionalSpent)}`,
          30,
          yPosition
        );
        yPosition += 5;

        // Wrap text for entry
        const lines = doc.splitTextToSize(reflection.entry, 150);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 35, yPosition);
          yPosition += 5;
        });

        yPosition += 3;
      });
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Return PDF as base64
    return doc.output('dataurlstring');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
