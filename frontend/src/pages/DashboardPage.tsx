import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '@/context/AuthContext';

type EscrowTransaction = {
  id: string;
  agreement_name: string;
  status: string;
  property_address: string;
  transaction_type: string;
  role: 'BROKER' | 'BUYER' | 'SELLER' | string;
};

const roleBadgeStyles: Record<string, React.CSSProperties> = {
  BROKER: { backgroundColor: '#e0f2fe', color: '#075985', borderColor: '#7dd3fc' },
  BUYER: { backgroundColor: '#ecfdf3', color: '#166534', borderColor: '#86efac' },
  SELLER: { backgroundColor: '#fef9c3', color: '#854d0e', borderColor: '#fef08a' },
};

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['escrows'],
    queryFn: async () => {
      const response = await api.get<EscrowTransaction[]>('/escrows/');
      return response.data;
    },
  });

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280' }}>Welcome back, {currentUser?.email ?? 'user'}.</p>
        </div>
        {currentUser?.is_broker && (
          <Link
            to="/escrows/new"
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: '#111827',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Create transaction
          </Link>
        )}
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Your escrows</h2>
          {!currentUser?.is_broker && (
            <span style={{ color: '#6b7280', fontSize: 14 }}>Contact your broker to create new transactions.</span>
          )}
        </div>

        {isLoading && <p style={{ margin: 0 }}>Loading escrows...</p>}
        {isError && <p style={{ color: '#b91c1c', margin: 0 }}>Unable to load escrows right now.</p>}

        {!isLoading && !isError && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.length ? (
              data.map((escrow) => {
                const badgeStyle = roleBadgeStyles[escrow.role] ?? {
                  backgroundColor: '#f3f4f6',
                  color: '#111827',
                  borderColor: '#e5e7eb',
                };

                return (
                  <div
                    key={escrow.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{escrow.agreement_name}</div>
                        <div style={{ color: '#6b7280', fontSize: 14 }}>{escrow.property_address}</div>
                      </div>
                      <span
                        style={{
                          ...badgeStyle,
                          border: '1px solid',
                          borderRadius: 999,
                          padding: '6px 10px',
                          fontWeight: 600,
                          fontSize: 12,
                          textTransform: 'capitalize',
                        }}
                      >
                        {escrow.role.toLowerCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, color: '#374151', fontSize: 14 }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Status</div>
                        <div style={{ fontWeight: 600 }}>{escrow.status}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Type</div>
                        <div style={{ fontWeight: 600 }}>{escrow.transaction_type}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ margin: 0, color: '#6b7280' }}>You are not part of any escrows yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
