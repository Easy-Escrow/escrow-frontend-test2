import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { becomeBrokerRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const BecomeBrokerPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const description = useMemo(
    () =>
      'Los brokers pueden crear nuevas transacciones de escrow para conectar compradores y vendedores.',
    [],
  );

  const mutation = useMutation({
    mutationFn: becomeBrokerRequest,
    onSuccess: (data) => {
      setErrorMessage('');
      setSuccessMessage(
        data?.message ?? 'Solicitud enviada con éxito. Revisaremos tu petición a la brevedad.',
      );
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setErrorMessage('Ya tienes una solicitud pendiente para ser broker.');
        return;
      }
      setErrorMessage('No pudimos enviar tu solicitud. Inténtalo nuevamente más tarde.');
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Solicita ser broker</h1>
      {currentUser?.is_broker ? (
        <p>Ya eres un broker. Gracias por ayudar a la comunidad.</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: 480 }}
        >
          <p style={{ margin: 0 }}>{description}</p>
          <button
            type="submit"
            disabled={mutation.isPending || mutation.isSuccess}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #111827',
              background: '#111827',
              color: '#fff',
              cursor: mutation.isPending || mutation.isSuccess ? 'not-allowed' : 'pointer',
            }}
          >
            {mutation.isPending ? 'Enviando…' : 'Solicitar ser broker'}
          </button>
          {successMessage && <p style={{ color: '#047857', margin: 0 }}>{successMessage}</p>}
          {errorMessage && <p style={{ color: '#b91c1c', margin: 0 }}>{errorMessage}</p>}
        </form>
      )}
    </div>
  );
};

export default BecomeBrokerPage;
