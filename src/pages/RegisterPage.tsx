import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registerRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { RegisterPayload } from '../types/auth';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<RegisterPayload>({ email: '', password: '', name: '' });
  const navigate = useNavigate();
  const { applyAuthResponse } = useAuth();
  const registerMutation = useMutation({ mutationFn: registerRequest });

  const handleChange = (field: keyof RegisterPayload) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await registerMutation.mutateAsync(form);
    applyAuthResponse(response);
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: 360 }}>
        <label>
          Name
          <input type="text" value={form.name ?? ''} onChange={handleChange('name')} required style={{ width: '100%', padding: '8px' }} />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={handleChange('email')} required style={{ width: '100%', padding: '8px' }} />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={handleChange('password')} required style={{ width: '100%', padding: '8px' }} />
        </label>
        <button type="submit" disabled={registerMutation.isPending} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' }}>
          {registerMutation.isPending ? 'Creating account...' : 'Register'}
        </button>
        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
