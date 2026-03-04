'use client';

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input, Select } from '@/components/Form';
import { Spinner } from '@/components/Spinner';
import { getBills, createBill, updateBill, deleteBill } from '@/lib/actions/bills';
import { formatCurrency, getCurrentMonthYear } from '@/lib/utils';
import { Trash2, Plus, CheckCircle, Circle } from 'lucide-react';

interface User {
  id: string;
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  category: string;
  isPaid: boolean;
  paidDate?: Date | null;
}

const BILL_CATEGORIES = [
  { value: 'rent', label: 'Rent/Mortgage' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
];

export default function BillsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'other',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadBills = async () => {
      try {
        setLoading(true);
        const result = await getBills(user.id, monthYear.month, monthYear.year);
        if (result.success) {
          setBills(result.bills);
        }
      } catch (error) {
        console.error('Error loading bills:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBills();
  }, [user, monthYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);
      const dueDate = parseInt(formData.dueDate);

      if (!formData.name.trim()) {
        setErrors({ name: 'Bill name is required' });
        setSubmitting(false);
        return;
      }

      if (isNaN(amount) || amount <= 0) {
        setErrors({ amount: 'Amount must be greater than 0' });
        setSubmitting(false);
        return;
      }

      if (isNaN(dueDate) || dueDate < 1 || dueDate > 31) {
        setErrors({ dueDate: 'Due date must be between 1 and 31' });
        setSubmitting(false);
        return;
      }

      if (!formData.category) {
        setErrors({ category: 'Category is required' });
        setSubmitting(false);
        return;
      }

      if (editingId) {
        const result = await updateBill(editingId, {
          name: formData.name.trim(),
          amount,
          dueDate,
          category: formData.category,
        });

        if (result.error) {
          setErrors({ form: result.error });
        } else {
          const updatedBills = bills.map((bill) =>
            bill.id === editingId
              ? { ...bill, name: formData.name, amount, dueDate, category: formData.category }
              : bill
          );
          setBills(updatedBills);
          resetForm();
        }
      } else {
        const result = await createBill(user!.id, {
          name: formData.name.trim(),
          amount,
          dueDate,
          category: formData.category,
        });

        if (result.error) {
          setErrors({ form: result.error });
        } else {
          setBills([...bills, result.bill as Bill]);
          resetForm();
        }
      }
    } catch (error) {
      setErrors({ form: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    const result = await deleteBill(id);
    if (result.success) {
      setBills(bills.filter((bill) => bill.id !== id));
    }
  };

  const handleTogglePaid = async (bill: Bill) => {
    const result = await updateBill(bill.id, { isPaid: !bill.isPaid });
    if (result.success) {
      const updatedBills = bills.map((b) =>
        b.id === bill.id ? { ...b, isPaid: !b.isPaid } : b
      );
      setBills(updatedBills);
    }
  };

  const handleEdit = (bill: Bill) => {
    setEditingId(bill.id);
    setFormData({
      name: bill.name,
      amount: bill.amount.toString(),
      dueDate: bill.dueDate.toString(),
      category: bill.category,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', amount: '', dueDate: '', category: 'other' });
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

  const paidCount = bills.filter((b) => b.isPaid).length;
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = bills.filter((b) => b.isPaid).reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bills Management</h1>
            <p className="text-gray-600 mt-2">Track and manage your monthly bills.</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} variant="primary">
              <Plus size={20} />
              Add Bill
            </Button>
          )}
        </div>

        {/* Month Selector and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month and Year
                </label>
                <div className="flex gap-2">
                  <select
                    value={monthYear.month}
                    onChange={(e) =>
                      setMonthYear({ ...monthYear, month: parseInt(e.target.value) })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <select
                    value={monthYear.year}
                    onChange={(e) =>
                      setMonthYear({ ...monthYear, year: parseInt(e.target.value) })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 3 }).map((_, i) => {
                      const year = new Date().getFullYear() + i - 1;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="highlight">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Bills Paid</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {paidCount}/{bills.length}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(paidAmount)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600 text-sm mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit' : 'Add'} Bill
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.form}
                </div>
              )}

              <Input
                label="Bill Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Electric Bill, Internet"
                error={errors.name}
              />

              <Input
                label="Amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                error={errors.amount}
              />

              <Input
                label="Due Date (Day of Month)"
                name="dueDate"
                type="number"
                min="1"
                max="31"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                placeholder="15"
                error={errors.dueDate}
              />

              <Select
                label="Category"
                options={BILL_CATEGORIES}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                error={errors.category}
              />

              <div className="flex gap-3">
                <Button type="submit" isLoading={submitting} className="flex-1">
                  {editingId ? 'Update' : 'Add'} Bill
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Bills List */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Bills - {new Date(monthYear.year, monthYear.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          {bills.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No bills for this month.</p>
          ) : (
            <div className="space-y-3">
              {bills
                .sort((a, b) => a.dueDate - b.dueDate)
                .map((bill) => (
                  <div
                    key={bill.id}
                    className={`flex items-center justify-between p-4 bg-white rounded-lg border transition-all ${
                      bill.isPaid
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => handleTogglePaid(bill)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {bill.isPaid ? (
                          <CheckCircle size={24} className="text-green-600" />
                        ) : (
                          <Circle size={24} />
                        )}
                      </button>
                      <div>
                        <p
                          className={`font-semibold ${
                            bill.isPaid ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}
                        >
                          {bill.name}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {bill.category} • Due: Day {bill.dueDate}
                        </p>
                      </div>
                    </div>

                    <div className="text-right mr-4">
                      <p
                        className={`font-bold ${
                          bill.isPaid ? 'text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(bill.amount)}
                      </p>
                      {bill.isPaid && (
                        <p className="text-xs text-green-600">Paid</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(bill)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(bill.id)}
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
