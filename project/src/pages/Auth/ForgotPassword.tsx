import React, { useState } from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../lib/axios';

const forgotPasswordSchema = z.object({
  email: z.string().email('Lütfen geçerli bir e-posta adresi girin'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError('');
      await api.post('/api/auth/forgot-password', data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şifre sıfırlama işlemi sırasında bir hata oluştu.');
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
                <Mail size={24} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Şifremi Unuttum</h1>
            <p className="text-center text-gray-600 mb-6">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
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
                    Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. 
                    Lütfen gelen kutunuzu kontrol edin.
                  </p>
                </div>
                <Button
                  variant="link"
                  onClick={() => window.location.href = '/login'}
                  className="text-primary hover:text-primary/80"
                >
                  Giriş sayfasına dön
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="E-posta adresi"
                  type="email"
                  id="email"
                  fullWidth
                  error={errors.email?.message}
                  startIcon={<Mail size={16} className="text-gray-400" />}
                  {...register('email')}
                />
                
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Şifre Sıfırlama Bağlantısı Gönder
                </Button>
                
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => window.location.href = '/login'}
                    className="text-primary hover:text-primary/80"
                  >
                    Giriş sayfasına dön
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 