import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../lib/axios';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });
  
  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError('');
      await api.post(`/api/auth/reset-password/${token}`, { password: data.password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şifre güncelleme sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-primary rounded-md p-2 text-white">
                <Lock size={24} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Yeni Şifre Belirleme</h1>
            <p className="text-center text-gray-600 mb-6">
              Lütfen yeni şifrenizi belirleyin.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 rounded border border-destructive/20 text-destructive flex items-start">
                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {success ? (
              <div className="text-center">
                <div className="mb-4 p-3 bg-green-50 rounded border border-green-200 text-green-700">
                  <p className="text-sm">
                    Şifreniz başarıyla güncellendi. 
                    Birkaç saniye içinde giriş sayfasına yönlendirileceksiniz.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Yeni Şifre"
                  type="password"
                  id="password"
                  fullWidth
                  error={errors.password?.message}
                  startIcon={<Lock size={16} className="text-gray-400" />}
                  {...register('password')}
                />
                
                <Input
                  label="Şifre Tekrar"
                  type="password"
                  id="confirmPassword"
                  fullWidth
                  error={errors.confirmPassword?.message}
                  startIcon={<Lock size={16} className="text-gray-400" />}
                  {...register('confirmPassword')}
                />
                
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Şifreyi Güncelle
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 