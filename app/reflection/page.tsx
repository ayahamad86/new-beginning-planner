'use client';

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input, TextArea, Select } from '@/components/Form';
import { Spinner } from '@/components/Spinner';
import {
  createReflection,
  getReflections,
  getWeeklyInsights,
  deleteReflection,
} from '@/lib/actions/reflections';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Heart, Trash2, Plus, TrendingUp } from 'lucide-react';

interface User {
  id: string;
}

interface Reflection {
  id: string;
  entry: string;
  emotionalSpent: number;
  triggers: string;
  mood: string;
  createdAt: string | Date;
}

export default function ReflectionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [weeklyInsights, setWeeklyInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    entry: '',
    emotionalSpent: '',
    triggers: '',
    mood: 'neutral',
  });

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

        const reflectionsResult = await getReflections(user.id);
        if (reflectionsResult.success) {
          setReflections(reflectionsResult.reflections);
        }

        const insightsResult = await getWeeklyInsights(user.id);
        if (insightsResult.success) {
          setWeeklyInsights(insightsResult.insights);
        }
      } catch (error) {
        console.error('Error loading reflections:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      if (!formData.entry.trim()) {
        setErrors({ entry: 'Entry is required' });
        setSubmitting(false);
        return;
      }

      const emotionalSpent = parseFloat(formData.emotionalSpent) || 0;

      const result = await createReflection(user!.id, {
        entry: formData.entry.trim(),
        emotionalSpent,
        triggers: formData.triggers,
        mood: formData.mood,
      });

      if (result.error) {
        setErrors({ form: result.error });
      } else {
          setReflections([result.reflection as Reflection, ...reflections]);

        // Refresh weekly insights
        const insightsResult = await getWeeklyInsights(user!.id);
        if (insightsResult.success) {
          setWeeklyInsights(insightsResult.insights);
        }
      }
    } catch (error) {
      setErrors({ form: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const result = await deleteReflection(id);
    if (result.success) {
      setReflections(reflections.filter((r) => r.id !== id));

      // Refresh weekly insights
      const insightsResult = await getWeeklyInsights(user!.id);
      if (insightsResult.success) {
        setWeeklyInsights(insightsResult.insights);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      entry: '',
      emotionalSpent: '',
      triggers: '',
      mood: 'neutral',
    });
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

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="text-red-600" size={32} />
              Reflection & Insights
            </h1>
            <p className="text-gray-600 mt-2">
              Track your feelings, spending patterns, and emotional well-being.
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} variant="primary">
              <Plus size={20} />
              New Entry
            </Button>
          )}
        </div>

        {/* Weekly Insights */}
        {weeklyInsights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="highlight">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Weekly Summary
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Total Emotional Spending</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(weeklyInsights.totalEmotionalSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Entries This Week</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {weeklyInsights.entryCount}
                  </p>
                </div>
              </div>
            </Card>

            {weeklyInsights.topTriggers.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Triggers This Week
                </h2>
                <div className="space-y-3">
                  {weeklyInsights.topTriggers.map((trigger: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <span className="text-gray-700 font-medium">{trigger.trigger}</span>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        {trigger.count}x
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Journal Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.form}
                </div>
              )}

              <TextArea
                label="Journal Entry"
                name="entry"
                value={formData.entry}
                onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                placeholder="Write about your day, emotions, spending decisions..."
                error={errors.entry}
                rows={6}
              />

              <Input
                label="Emotional Spending Amount ($)"
                name="emotionalSpent"
                type="number"
                step="0.01"
                value={formData.emotionalSpent}
                onChange={(e) =>
                  setFormData({ ...formData, emotionalSpent: e.target.value })
                }
                placeholder="0.00"
                helperText="Amount spent on emotional/impulse purchases"
              />

              <Input
                label="Triggers/Tags"
                name="triggers"
                value={formData.triggers}
                onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
                placeholder="e.g., stress, boredom, social pressure"
                helperText="Comma-separated tags to identify patterns"
              />

              <Select
                label="Mood"
                options={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'neutral', label: 'Neutral' },
                  { value: 'sad', label: 'Sad' },
                  { value: 'anxious', label: 'Anxious' },
                  { value: 'stressed', label: 'Stressed' },
                ]}
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
              />

              <div className="flex gap-3">
                <Button type="submit" isLoading={submitting} className="flex-1">
                  Save Entry
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Entries List */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h2>
          {reflections.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No entries yet. Start your reflection journey!</p>
          ) : (
            <div className="space-y-4">
              {reflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-500">
                        {formatDate(reflection.createdAt)}
                      </p>
                      <p className="text-sm font-medium text-gray-700 capitalize mt-1">
                        Mood: {reflection.mood}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(reflection.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-3">{reflection.entry}</p>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {reflection.emotionalSpent > 0 && (
                      <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full">
                        💸 {formatCurrency(reflection.emotionalSpent)}
                      </span>
                    )}
                    {reflection.triggers &&
                      reflection.triggers.split(',').map((trigger, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                        >
                          #{trigger.trim()}
                        </span>
                      ))}
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
