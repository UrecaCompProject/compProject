import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import postSignin from '../api/postSignin';

export function useSignin(onSuccess?: () => void) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => postSignin(email, password),
    onSuccess,
  });

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting: mutation.isPending,
    error: mutation.error?.message ?? null,
    handleSignin: () => mutation.mutate(),
  };
}
