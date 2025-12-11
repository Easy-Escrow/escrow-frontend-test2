import React from 'react';

const EscrowCreatePage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Create Escrow</h1>
      <p>Broker-only area to create a new escrow agreement.</p>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: 420 }}>
        <label>
          Title
          <input type="text" placeholder="Escrow title" style={{ width: '100%', padding: '8px' }} />
        </label>
        <label>
          Amount
          <input type="number" placeholder="0.00" style={{ width: '100%', padding: '8px' }} />
        </label>
        <label>
          Description
          <textarea placeholder="Describe the escrow" style={{ width: '100%', padding: '8px', minHeight: 120 }} />
        </label>
        <button type="submit" style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' }}>
          Submit escrow
        </button>
      </form>
    </div>
  );
};

export default EscrowCreatePage;
