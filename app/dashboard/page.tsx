'use client';

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { SummaryCard } from '@/components/SummaryCard';
import { Card } from '@/components/Card';
import { Spinner } from '@/components/Spinner';
import { calculateMonthlyIncome } from '@/lib/actions/income';
import { getBillsDueNext7Days } from '@/lib/actions/bills';
import { getEmergencyFund } from '@/lib/actions/emergency';
import { getWeeklyInsights } from '@/lib/actions/reflections';
import { formatCurrency, calculatePercentage } from '@/lib/utils';
import {
  DollarSign,
  AlertCircle,
  TrendingUp,
  Heart,
} from 'lucide-react';

interface User {
  id: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [billsDue, setBillsDue] = useState<any[]>([]);
  const [emergencyFund, setEmergencyFund] = useState<any>(null);
  const [weeklyInsights, setWeeklyInsights] = useState<any>(null);
  const [billsTotal, setBillsTotal] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // Calculate monthly income
        const incomeResult = await calculateMonthlyIncome(user.id);
        if (incomeResult.success) {
          setMonthlyIncome(incomeResult.monthlyIncome);
        }

        // Get bills due next 7 days
        const billsResult = await getBillsDueNext7Days(user.id);
        if (billsResult.success) {
          setBillsDue(billsResult.bills);
          const total = billsResult.bills.reduce(
            (sum, bill) => sum + bill.amount,
            0
          );
          setBillsTotal(total);
        }

        // Get emergency fund
        const emResult = await getEmergencyFund(user.id);
        if (emResult.success) {
          setEmergencyFund(emResult.emergencyFund);
        }

        // Get weekly insights
        const insightsResult = await getWeeklyInsights(user.id);
        if (insightsResult.success) {
          setWeeklyInsights(insightsResult.insights);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </AuthenticatedLayout>
    );
  }

  const budgetRoom = monthlyIncome - billsTotal;
  const emergencyProgress = emergencyFund
    ? calculatePercentage(emergencyFund.currentAmount, emergencyFund.targetAmount)
    : 0;

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your financial overview.</p>
          </div>
          <button
            onClick={async () => {
              if (!user) return;
              const res = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
              });
              const data = await res.json();
              if (data.pdfDataUrl) {
                const link = document.createElement('a');
                link.href = data.pdfDataUrl;
                link.download = 'budget-summary.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Export PDF
          </button>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Monthly Income"
            value={formatCurrency(monthlyIncome)}
            subtext="From all sources"
            icon={<DollarSign className="text-green-600" />}
            variant="highlight"
          />

          <SummaryCard
            title="Bills Due (7 Days)"
            value={billsDue.length > 0 ? formatCurrency(billsTotal) : 'No bills'}
            subtext={`${billsDue.length} bills coming up`}
            icon={<AlertCircle className="text-orange-600" />}
            variant={billsDue.length > 0 ? 'warning' : 'default'}
          />

          <SummaryCard
            title="Budget Room"
            value={formatCurrency(Math.max(budgetRoom, 0))}
            subtext="After monthly bills"
            icon={<TrendingUp className="text-blue-600" />}
          />

          <SummaryCard
            title="Emergency Fund"
            value={emergencyProgress + '%'}
            subtext={`${formatCurrency(emergencyFund?.currentAmount || 0)} saved`}
            icon={<TrendingUp className="text-purple-600" />}
          />
        </div>

        {/* Bills Due Section */}
        {billsDue.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bills Due Next 7 Days</h2>
            <div className="space-y-3">
              {billsDue.slice(0, 5).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">{bill.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{bill.category}</p>
                  </div>
                  <p className="font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Emergency Fund Progress */}
        {emergencyFund && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Emergency Fund Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Goal: {formatCurrency(emergencyFund.targetAmount)}</span>
                  <span className="text-gray-900 font-bold">{emergencyProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${emergencyProgress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Currently Saved</p>
                  <p className="font-bold text-gray-900">{formatCurrency(emergencyFund.currentAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Recommended Monthly</p>
                  <p className="font-bold text-gray-900">
                    {formatCurrency(emergencyFund.recommendedMonthly)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Target Date</p>
                  <p className="font-bold text-gray-900">
                    {new Date(emergencyFund.targetDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Emotional Spending Highlights */}
        {weeklyInsights && weeklyInsights.topTriggers.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart size={24} className="text-red-600" />
              Weekly Emotional Spending Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm mb-2">Total Emotional Spending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(weeklyInsights.totalEmotionalSpent)}
                </p>
                <p className="text-gray-500 text-xs mt-2">This week</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-3">Top Triggers</p>
                <div className="space-y-2">
                  {weeklyInsights.topTriggers.map((trigger: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">{trigger.trigger}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {trigger.count}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
