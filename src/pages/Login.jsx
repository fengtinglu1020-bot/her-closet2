import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (mode === 'login') {
        await signIn(email, password);
        toast.success('登录成功');
      } else {
        await signUp(email, password);
        toast.success('注册成功，请查收验证邮件后登录');
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.message || '操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <h1 className="font-serif text-2xl font-bold text-center">
          {mode === 'login' ? '登录' : '注册'}
        </h1>

        <div>
          <Label>邮箱</Label>
          <Input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 h-11 rounded-xl"
          />
        </div>
        <div>
          <Label>密码</Label>
          <Input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 h-11 rounded-xl"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium"
        >
          {mode === 'login' ? '登录' : '注册'}
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-sm text-muted-foreground underline w-full text-center"
        >
          {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
        </button>
      </form>
    </div>
  );
}
