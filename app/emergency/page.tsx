'use client';

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Form';
import { Spinner } from '@/components/Spinner';
import { ProgressBar } from '@/components/ProgressBar';
import {
  getEmergencyFund,
  createOrUpdateEmergencyFund,
  updateEmergencyFundAmount,
} from '@/lib/actions/emergency';
import { formatCurrency, getDaysUntil, calculatePercentage, formatDate } from '@/lib/utils';
import { TrendingUp, Heart } from 'lucide-react';

interface User {
  id: string;
}

interface EmergencyFund {
  id: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | string;
  recommendedMonthly: number;
}

export default function EmergencyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadEmergencyFund = async () => {
      try {
        setLoading(true);
        const result = await getEmergencyFund(user.id);
        if (result.success && result.emergencyFund) {
          setEmergencyFund(result.emergencyFund);
          const date = new Date(result.emergencyFund.targetDate);
          const dateStr = date.toISOString().split('T')[0];
          setFormData({
            targetAmount: result.emergencyFund.targetAmount.toString(),
            currentAmount: result.emergencyFund.currentAmount.toString(),
            targetDate: dateStr,
          });
        }
      } catch (error) {
        console.error('Error loading emergency fund:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmergencyFund();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const targetAmount = parseFloat(formData.targetAmount);
      const currentAmount = parseFloat(formData.currentAmount);

      if (isNaN(targetAmount) || targetAmount <= 0) {
        setErrors({ targetAmount: 'Target amount must be greater than 0' });
        setSubmitting(false);
        return;
      }

      if (isNaN(currentAmount) || currentAmount < 0) {
        setErrors({ currentAmount: 'Current amount cannot be negative' });
        setSubmitting(false);
        return;
      }

      if (!formData.targetDate) {
        setErrors({ targetDate: 'Target date is required' });
        setSubmitting(false);
        return;
      }

      const result = await createOrUpdateEmergencyFund(user!.id, {
        targetAmount,
        targetDate: formData.targetDate,
        currentAmount,
      });

      if (result.error) {
        setErrors({ form: result.error });
      } else {
        setEmergencyFund(result.emergencyFund as EmergencyFund);
        setShowForm(false);
      }
    } catch (error) {
      setErrors({ form: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAdd = async (amount: number) => {
    if (!emergencyFund) return;

    const result = await updateEmergencyFundAmount(
      user!.id,
      emergencyFund.currentAmount + amount
    );

    if (result.success) {
      setEmergencyFund(result.emergencyFund);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </AuthenticatedLayout>
    );
  }

  const daysRemaining = emergencyFund
    ? getDaysUntil(emergencyFund.targetDate)
    : 0;
  const progress = emergencyFund
    ? calculatePercentage(emergencyFund.currentAmount, emergencyFund.targetAmount)
    : 0;
  const amountRemaining = emergencyFund
    ? emergencyFund.targetAmount - emergencyFund.currentAmount
    : 0;

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="text-red-600" size={32} />
            Emergency Fund
          </h1>
          <p className="text-gray-600 mt-2">Build financial security and peace of mind.</p>
        </div>

        {!emergencyFund ? (
          // Initial Setup
          <Card>
            <div className="text-center py-8 space-y-4">
              <TrendingUp size={48} className="mx-auto text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Get Started</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Set up your emergency fund goal to start tracking your financial safety net.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                variant="primary"
                size="lg"
                className="mx-auto mt-4"
              >
                Create Emergency Fund
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card variant="highlight">
                <p className="text-gray-600 text-sm mb-2">Goal Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(emergencyFund.targetAmount)}
                </p>
              </Card>

              <Card>
                <p className="text-gray-600 text-sm mb-2">Currently Saved</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(emergencyFund.currentAmount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
              </Card>

              <Card>
                <p className="text-gray-600 text-sm mb-2">Amount Remaining</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(amountRemaining)}
                </p>
              </Card>

              <Card>
                <p className="text-gray-600 text-sm mb-2">Days Remaining</p>
                <p className="text-2xl font-bold text-blue-600">{daysRemaining}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Target: {formatDate(emergencyFund.targetDate)}
                </p>
              </Card>
            </div>

            {/* Progress Visualization */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Progress</h2>
              <ProgressBar
                current={emergencyFund.currentAmount}
                target={emergencyFund.targetAmount}
                label="Emergency Fund Build-up"
                showPercentage={true}
                size="lg"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-2">Recommended Monthly</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(emergencyFund.recommendedMonthly)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">To reach goal on time</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-600 text-sm mb-2">Current Monthly Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {daysRemaining > 0
                      ? formatCurrency(amountRemaining / (daysRemaining / 30))
                      : formatCurrency(0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Your monthly needs</p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-600 text-sm mb-2">Months to Goal</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {emergencyFund.recommendedMonthly > 0
                      ? Math.ceil(amountRemaining / emergencyFund.recommendedMonthly)
                      : 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">At recommended rate</p>
                </div>
              </div>
            </Card>

            {/* Quick Add Buttons */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Funds</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[50, 100, 250, 500].map((amount) => (
                  <Button
                    key={amount}
                    variant="secondary"
                    onClick={() => handleQuickAdd(amount)}
                    className="w-full"
                  >
                    +${amount}
                  </Button>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Form */}
        {showForm && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {emergencyFund ? 'Update' : 'Set Up'} Emergency Fund
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.form}
                </div>
              )}

              <Input
                label="Target Amount ($)"
                name="targetAmount"
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: e.target.value })
                }
                placeholder="e.g., 10000"
                error={errors.targetAmount}
                helperText="How much do you want to save?"
              />

              <Input
                label="Current Amount ($)"
                name="currentAmount"
                type="number"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) =>
                  setFormData({ ...formData, currentAmount: e.target.value })
                }
                placeholder="0.00"
                error={errors.currentAmount}
                helperText="How much have you saved so far?"
              />

              <Input
                label="Target Date"
                name="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) =>
                  setFormData({ ...formData, targetDate: e.target.value })
                }
                error={errors.targetDate}
                helperText="When do you want to reach your goal?"
              />

              <div className="flex gap-3">
                <Button type="submit" isLoading={submitting} className="flex-1">
                  {emergencyFund ? 'Update' : 'Create'} Fund
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {emergencyFund && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            variant="secondary"
            className="w-full"
          >
            Update Goal
          </Button>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
