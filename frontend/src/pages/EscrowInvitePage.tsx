import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

type EscrowParticipant = {
  id: string;
  email: string;
  role: string;
  has_accepted: boolean;
};

type EscrowTransaction = {
  id: string;
  agreement_name: string;
  property_address: string;
  transaction_type: string;
  currency: string;
  property_value: number;
  estimated_closing_date?: string;
  status: string;
  participants?: EscrowParticipant[];
};

type InvitePayload = {
  cobroker_email?: string | null;
  buyer_email: string;
  seller_email?: string | null;
  broker_share_pct?: number;
  co_broker_share_pct?: number | null;
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const inputStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  color: '#111827',
};

const helperStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: 13,
  lineHeight: 1.4,
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
};

const EscrowInvitePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<EscrowTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [coBrokerEmail, setCoBrokerEmail] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [brokerShare, setBrokerShare] = useState<number>(100);
  const [coBrokerShare, setCoBrokerShare] = useState<number>(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) return;
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await api.get<EscrowTransaction>(`/escrows/${id}/`);
        setTransaction(response.data);
      } catch (error) {
        setFetchError('No pudimos cargar la información de la transacción.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const hasCoBroker = useMemo(() => coBrokerEmail.trim().length > 0, [coBrokerEmail]);

  const validate = (): string | null => {
    if (!buyerEmail.trim()) return 'El correo del comprador es obligatorio.';

    if (!hasCoBroker && !sellerEmail.trim()) {
      return 'Debes ingresar el correo del vendedor cuando no hay co-broker.';
    }

    if (hasCoBroker) {
      if (Number.isNaN(brokerShare) || Number.isNaN(coBrokerShare)) {
        return 'Ingresa los porcentajes de comisión para broker y co-broker.';
      }

      const total = brokerShare + coBrokerShare;
      if (Math.abs(total - 100) > 0.0001) {
        return 'El broker y co-broker deben sumar 100% de comisión.';
      }
    } else {
      if (brokerShare !== 100) {
        return 'Cuando no hay co-broker, el broker debe tener 100% de la comisión.';
      }
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    if (!id) return;

    setSubmitError(null);
    setIsSubmitting(true);

    const payload: InvitePayload = {
      cobroker_email: hasCoBroker ? coBrokerEmail.trim() : null,
      buyer_email: buyerEmail.trim(),
      seller_email: sellerEmail.trim() ? sellerEmail.trim() : null,
      broker_share_pct: hasCoBroker ? brokerShare : 100,
      co_broker_share_pct: hasCoBroker ? coBrokerShare : null,
    };

    try {
      await api.post(`/escrows/${id}/invite/`, payload);
      navigate('/dashboard');
    } catch (error) {
      setSubmitError('No pudimos enviar las invitaciones. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Invitar participantes</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
            Completa los correos y comparte las comisiones para iniciar el proceso de aceptación.
          </p>
        </div>
      </div>

      {isLoading && <div style={cardStyle}>Cargando detalles del escrow...</div>}
      {fetchError && <div style={{ ...cardStyle, color: '#b91c1c' }}>{fetchError}</div>}

      {transaction && !isLoading && !fetchError && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{transaction.agreement_name}</div>
              <div style={{ color: '#6b7280' }}>{transaction.property_address}</div>
            </div>
            <div style={{ textAlign: 'right', color: '#374151', fontSize: 14 }}>
              <div style={{ fontWeight: 600 }}>Valor: {transaction.currency} {transaction.property_value}</div>
              {transaction.estimated_closing_date && (
                <div style={{ color: '#6b7280' }}>
                  Cierre estimado: {new Date(transaction.estimated_closing_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Estado actual: {transaction.status}</div>
        </div>
      )}

      <div style={cardStyle}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Correo del co-broker (opcional)</span>
              <input
                style={inputStyle}
                type="email"
                name="cobroker_email"
                placeholder="cobroker@correo.com"
                value={coBrokerEmail}
                onChange={(event) => setCoBrokerEmail(event.target.value)}
              />
              <span style={helperStyle}>
                Si agregas un co-broker, podrás repartir la comisión. El co-broker deberá invitar a la otra parte.
              </span>
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Correo del comprador *</span>
              <input
                style={inputStyle}
                type="email"
                name="buyer_email"
                placeholder="comprador@correo.com"
                value={buyerEmail}
                onChange={(event) => setBuyerEmail(event.target.value)}
                required
              />
              {hasCoBroker && (
                <span style={helperStyle}>
                  Al menos uno de los clientes debe ser invitado por el broker principal; el otro lo invitará el co-broker.
                </span>
              )}
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Correo del vendedor {hasCoBroker ? '(opcional)' : '*'}</span>
              <input
                style={inputStyle}
                type="email"
                name="seller_email"
                placeholder="vendedor@correo.com"
                value={sellerEmail}
                onChange={(event) => setSellerEmail(event.target.value)}
                required={!hasCoBroker}
              />
              {hasCoBroker && (
                <span style={helperStyle}>
                  Si el comprador fue invitado por ti, el co-broker deberá invitar al vendedor (o viceversa).
                </span>
              )}
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Porcentaje broker (%)</span>
              <input
                style={inputStyle}
                type="number"
                name="broker_share_pct"
                min={0}
                max={100}
                step="0.01"
                value={brokerShare}
                onChange={(event) => setBrokerShare(Number(event.target.value))}
              />
              {!hasCoBroker && <span style={helperStyle}>Debe ser 100% cuando no hay co-broker.</span>}
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Porcentaje co-broker (%)</span>
              <input
                style={inputStyle}
                type="number"
                name="co_broker_share_pct"
                min={0}
                max={100}
                step="0.01"
                value={coBrokerShare}
                onChange={(event) => setCoBrokerShare(Number(event.target.value))}
                disabled={!hasCoBroker}
              />
              {hasCoBroker ? (
                <span style={helperStyle}>La suma con el broker debe ser exactamente 100%.</span>
              ) : (
                <span style={helperStyle}>Habilitado solo si agregas un co-broker.</span>
              )}
            </label>
          </div>

          {submitError && <div style={{ color: '#b91c1c' }}>{submitError}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                backgroundColor: '#fff',
                color: '#111827',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: '#111827',
                color: '#fff',
                border: '1px solid #111827',
                cursor: 'pointer',
                opacity: isSubmitting ? 0.8 : 1,
              }}
            >
              {isSubmitting ? 'Enviando invitaciones...' : 'Enviar invitaciones'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EscrowInvitePage;
