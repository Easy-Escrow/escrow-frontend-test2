import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { becomeBrokerRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const BecomeBrokerPage: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const mutation = useMutation({
    mutationFn: becomeBrokerRequest,
    onSuccess: (data) => {
      updateUser(data.user);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Become a Broker</h1>
      {currentUser?.is_broker ? (
        <p>You are already a broker.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: 420 }}>
          <p>Submit this form to request broker permissions.</p>
          <button type="submit" disabled={mutation.isPending} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' }}>
            {mutation.isPending ? 'Submitting...' : 'Request access'}
          </button>
          {mutation.isSuccess && <p>Request sent! Your account has been updated.</p>}
        </form>
      )}
    </div>
  );
};

export default BecomeBrokerPage;
