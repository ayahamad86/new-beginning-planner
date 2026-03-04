'use client';

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input, Select } from '@/components/Form';
import { Spinner } from '@/components/Spinner';
import {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  calculateMonthlyIncome,
} from '@/lib/actions/income';
import { formatCurrency } from '@/lib/utils';
import { Trash2, Plus, Percent } from 'lucide-react';

interface User {
  id: string;
}

interface Income {
  id: string;
  name: string;
  amount: number;
  frequency: string;
}

export default function IncomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adjustment, setAdjustment] = useState(0);
  const [adjustedIncome, setAdjustedIncome] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadIncomes = async () => {
      try {
        setLoading(true);
        const result = await getIncomes(user.id);
        if (result.success) {
          setIncomes(result.incomes);
          const incomeResult = await calculateMonthlyIncome(user.id);
          if (incomeResult.success) {
            setMonthlyIncome(incomeResult.monthlyIncome);
            setAdjustedIncome(incomeResult.monthlyIncome);
          }
        }
      } catch (error) {
        console.error('Error loading incomes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIncomes();
  }, [user]);

  const handleAdjustmentChange = async (value: number) => {
    setAdjustment(value);
    const result = await calculateMonthlyIncome(user!.id, value);
    if (result.success) {
      setAdjustedIncome(result.monthlyIncome);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);

      if (!formData.name.trim()) {
        setErrors({ name: 'Income source name is required' });
        setSubmitting(false);
        return;
      }

      if (isNaN(amount) || amount <= 0) {
        setErrors({ amount: 'Amount must be greater than 0' });
        setSubmitting(false);
        return;
      }

      if (editingId) {
        const result = await updateIncome(editingId, {
          name: formData.name,
          amount,
          frequency: formData.frequency,
        });

        if (result.error) {
          setErrors({ form: result.error });
        } else {
          const updatedIncomes = incomes.map((income) =>
            income.id === editingId
              ? { ...income, ...formData, amount }
              : income
          );
          setIncomes(updatedIncomes);
          resetForm();
        }
      } else {
        const result = await createIncome(user!.id, {
          name: formData.name,
          amount,
          frequency: formData.frequency,
        });

        if (result.error) {
          setErrors({ form: result.error });
        } else {
          setIncomes([...incomes, result.income as Income]);
          resetForm();
        }
      }

      // Recalculate monthly income
      const incomeResult = await calculateMonthlyIncome(user!.id);
      if (incomeResult.success) {
        setMonthlyIncome(incomeResult.monthlyIncome);
        setAdjustedIncome(incomeResult.monthlyIncome);
        setAdjustment(0);
      }
    } catch (error) {
      setErrors({ form: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    const result = await deleteIncome(id);
    if (result.success) {
      setIncomes(incomes.filter((income) => income.id !== id));

      // Recalculate monthly income
      const incomeResult = await calculateMonthlyIncome(user!.id);
      if (incomeResult.success) {
        setMonthlyIncome(incomeResult.monthlyIncome);
        setAdjustedIncome(incomeResult.monthlyIncome);
        setAdjustment(0);
      }
    }
  };

  const handleEdit = (income: Income) => {
    setEditingId(income.id);
    setFormData({
      name: income.name,
      amount: income.amount.toString(),
      frequency: income.frequency,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', amount: '', frequency: 'monthly' });
    setEditingId(null);
    setShowForm(false);
    setErrors({});
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

  const frequencyMultipliers = {
    monthly: 1,
    'bi-weekly': 26 / 12,
    weekly: 52 / 12,
    annual: 1 / 12,
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
            <p className="text-gray-600 mt-2">Track all your income sources and adjust your budget projections.</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} variant="primary">
              <Plus size={20} />
              Add Income
            </Button>
          )}
        </div>

        {/* Monthly Income Summary */}
        <Card variant="highlight">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Base Monthly Income</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(monthlyIncome)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Adjustment</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{adjustment > 0 ? '+' : ''}{adjustment}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Projected Income</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(adjustedIncome)}</p>
            </div>
          </div>
        </Card>

        {/* Income Change Simulator */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Percent size={24} className="text-blue-600" />
            Income Change Simulator
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustment Percentage
                </label>
                <input
                  type="number"
                  value={adjustment}
                  onChange={(e) => handleAdjustmentChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter percentage (e.g., -10, +15)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Amount
                </label>
                <input
                  type="text"
                  disabled
                  value={formatCurrency(monthlyIncome)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Amount
                </label>
                <input
                  type="text"
                  disabled
                  value={formatCurrency(adjustedIncome)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50 text-green-700 font-semibold"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Form */}
        {showForm && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit' : 'Add'} Income Source
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.form}
                </div>
              )}

              <Input
                label="Income Source Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Salary, Freelance, Investment"
                error={errors.name}
              />

              <Input
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                error={errors.amount}
              />

              <Select
                label="Frequency"
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'bi-weekly', label: 'Bi-weekly' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'annual', label: 'Annual' },
                ]}
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              />

              <div className="flex gap-3">
                <Button type="submit" isLoading={submitting} className="flex-1">
                  {editingId ? 'Update' : 'Add'} Income
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Income List */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Income Sources</h2>
          {incomes.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No income sources yet. Add your first one!</p>
          ) : (
            <div className="space-y-3">
              {incomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{income.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{income.frequency}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-gray-900">{formatCurrency(income.amount)}</p>
                    <p className="text-xs text-gray-500">
                      ≈ {formatCurrency(
                        income.amount *
                          frequencyMultipliers[income.frequency as keyof typeof frequencyMultipliers]
                      )}/mo
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(income)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(income.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
