import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const EscrowInvitePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [email, setEmail] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // hook up to invite mutation
    setEmail('');
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Invite to Escrow</h1>
      <p>Invite participants to escrow #{id}</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', maxWidth: 480 }}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Participant email" required style={{ flex: 1, padding: '8px' }} />
        <button type="submit" style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' }}>
          Send invite
        </button>
      </form>
    </div>
  );
};

export default EscrowInvitePage;
