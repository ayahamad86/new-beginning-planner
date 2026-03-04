'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Form';
import { loginUser, registerUser } from '@/lib/actions/auth';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await loginUser(formData.email, formData.password);
        if (result.error) {
          setErrors({ form: result.error });
        } else {
          // Store user ID/email in cookie/localStorage for simple auth
          localStorage.setItem('user', JSON.stringify(result.user));
          router.push('/dashboard');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setErrors({ confirmPassword: 'Passwords do not match' });
          setLoading(false);
          return;
        }
        const result = await registerUser(formData.email, formData.password, formData.name);
        if (result.error) {
          setErrors({ form: result.error });
        } else {
          localStorage.setItem('user', JSON.stringify(result.user));
          router.push('/dashboard');
        }
      }
    } catch (error) {
      setErrors({ form: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              New Beginning
            </h1>
            <p className="text-gray-600">Budget Planner</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                setMode('login');
                setErrors({});
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrors({});
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.form}
              </div>
            )}

            {mode === 'register' && (
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                error={errors.name}
              />
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              helperText={
                mode === 'register'
                  ? 'Min 8 chars, 1 uppercase, 1 number'
                  : undefined
              }
            />

            {mode === 'register' && (
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.confirmPassword}
              />
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
              size="md"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Demo Credentials:</strong>
            </p>
            <p className="text-xs text-gray-600">
              Email: demo@example.com<br />
              Password: DemoPass123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
