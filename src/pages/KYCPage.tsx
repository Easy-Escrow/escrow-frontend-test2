import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/client';

type Role = 'BROKER' | 'BUYER' | 'SELLER';

interface KYCFormData {
  role: Role;
  full_name: string;
  id_number: string;
  date_of_birth: string;
  address: string;
  occupation: string;
  source_of_funds?: string;
  tax_id?: string;
  license_number?: string;
  license_state?: string;
  brokerage_firm_name?: string;
}

const fieldContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
  marginTop: '16px',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
  maxWidth: 900,
  margin: '0 auto',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '24px',
};

const buttonStyle: React.CSSProperties = {
  marginTop: '24px',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid #111827',
  background: '#111827',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
  minWidth: 180,
  alignSelf: 'flex-start',
};

const KYCPage: React.FC = () => {
  const [formData, setFormData] = useState<KYCFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadKyc = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<KYCFormData>('/kyc/me/');
        setFormData(response.data);
      } catch (err) {
        setError('No se pudo cargar tu información KYC.');
      } finally {
        setIsLoading(false);
      }
    };

    loadKyc();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    if (!formData) return;
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const roleSpecificFields = useMemo(() => {
    if (!formData) return [] as Array<{ name: keyof KYCFormData; label: string; type?: string }>;
    if (formData.role === 'BROKER') {
      return [
        { name: 'license_number', label: 'Número de licencia' },
        { name: 'license_state', label: 'Estado de la licencia' },
        { name: 'brokerage_firm_name', label: 'Nombre de la firma' },
      ];
    }

    return [
      { name: 'source_of_funds', label: 'Fuente de fondos' },
      { name: 'tax_id', label: 'RFC / Tax ID' },
    ];
  }, [formData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData) return;
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await api.put('/kyc/me/', formData);
      setSuccess('Información guardada correctamente.');
    } catch (err) {
      setError('No se pudo guardar la información. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !formData) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
        <p>Cargando información KYC...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={{ margin: 0 }}>Verificación de identidad (KYC)</h1>
          <p style={{ margin: 0, color: '#4b5563' }}>
            Actualiza tu información de acuerdo con tu rol en la transacción.
          </p>
          <div style={{ padding: '8px 12px', background: '#f3f4f6', borderRadius: '8px', width: 'fit-content' }}>
            Rol actual: <strong>{formData.role}</strong>
          </div>
        </div>

        {error && (
          <div style={{ color: '#b91c1c', marginBottom: '12px', fontWeight: 600 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ color: '#047857', marginBottom: '12px', fontWeight: 600 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={fieldContainerStyle}>
            <label style={labelStyle}>
              Nombre completo
              <input
                style={inputStyle}
                type="text"
                name="full_name"
                value={formData.full_name ?? ''}
                onChange={handleChange}
                required
              />
            </label>
            <label style={labelStyle}>
              Número de identificación
              <input
                style={inputStyle}
                type="text"
                name="id_number"
                value={formData.id_number ?? ''}
                onChange={handleChange}
                required
              />
            </label>
            <label style={labelStyle}>
              Fecha de nacimiento
              <input
                style={inputStyle}
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth ?? ''}
                onChange={handleChange}
                required
              />
            </label>
            <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
              Domicilio
              <textarea
                style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
                name="address"
                value={formData.address ?? ''}
                onChange={handleChange}
                required
              />
            </label>
            <label style={labelStyle}>
              Ocupación
              <input
                style={inputStyle}
                type="text"
                name="occupation"
                value={formData.occupation ?? ''}
                onChange={handleChange}
                required
              />
            </label>
            {roleSpecificFields.map((field) => (
              <label key={field.name as string} style={labelStyle}>
                {field.label}
                <input
                  style={inputStyle}
                  type={field.type ?? 'text'}
                  name={field.name}
                  value={(formData[field.name] as string | undefined) ?? ''}
                  onChange={handleChange}
                  required
                />
              </label>
            ))}
          </div>

          <button type="submit" style={buttonStyle} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default KYCPage;
