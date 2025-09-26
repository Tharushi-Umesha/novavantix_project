'use client';
import { useState } from 'react';
import Login from '@/components/Login';
import Signup from '@/components/Signup';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuth = () => {
    setIsLogin(!isLogin);
  };

  return isLogin ? <Login onToggle={toggleAuth} /> : <Signup onToggle={toggleAuth} />;
}