import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import styles from './EscrowCreatePage.module.css';

interface EscrowPayload {
  agreement_name: string;
  role: string;
  currency: string;
  transaction_type: string;
  property_type: string;
  property_value: number;
  estimated_close_date: string;
  property_address: string;
}

const transactionTypes = [
  { value: 'BROKERAGE_COMMISSION', label: 'Comisión inmobiliaria' },
  { value: 'PURCHASE_SALE', label: 'Compra-venta' },
  { value: 'RENTAL', label: 'Renta' },
  { value: 'OTHER', label: 'Otro' },
];

const propertyTypes = [
  { value: 'HOUSE', label: 'Casa' },
  { value: 'APARTMENT', label: 'Departamento' },
  { value: 'LAND', label: 'Terreno' },
  { value: 'COMMERCIAL', label: 'Comercial' },
  { value: 'OTHER', label: 'Otro' },
];

const currencies = ['USD', 'MXN', 'EUR'];

const EscrowCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EscrowPayload>({
    agreement_name: '',
    role: 'BROKER',
    currency: 'USD',
    transaction_type: 'BROKERAGE_COMMISSION',
    property_type: 'HOUSE',
    property_value: 0,
    estimated_close_date: '',
    property_address: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencyLabel = useMemo(() => (formData.currency ? `(${formData.currency})` : ''), [formData.currency]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'property_value' ? Number(value) : value,
    }));
  };

  const validate = (): string | null => {
    if (!formData.agreement_name.trim()) return 'El nombre del acuerdo es obligatorio.';
    if (!formData.currency) return 'Selecciona una moneda.';
    if (!formData.transaction_type) return 'Selecciona el tipo de transacción.';
    if (!formData.property_type) return 'Selecciona el tipo de propiedad.';
    if (!formData.property_value || Number.isNaN(formData.property_value) || formData.property_value <= 0)
      return 'El valor de la propiedad debe ser un número positivo.';
    if (!formData.estimated_close_date) return 'La fecha estimada de cierre es obligatoria.';
    if (!formData.property_address.trim()) return 'La dirección de la propiedad es obligatoria.';
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const response = await api.post('/escrows/', formData);
      const newEscrowId = response.data?.id;
      if (newEscrowId) {
        navigate(`/escrows/${newEscrowId}/invite`);
      } else {
        setError('No se pudo obtener el identificador del nuevo escrow.');
      }
    } catch (err) {
      setError('No se pudo crear el escrow. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Crear nuevo escrow</h1>
        <p className={styles.subtitle}>Completa los datos para generar el acuerdo y enviar invitaciones.</p>
      </div>

      <div className={styles.card}>
        <form className={styles.formGrid} onSubmit={handleSubmit} noValidate>
          <label className={styles.label}>
            Nombre del acuerdo
            <input
              className={styles.input}
              type="text"
              name="agreement_name"
              placeholder="Ej. Compra departamento Av. Reforma"
              value={formData.agreement_name}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            Mi rol en la operación
            <select className={styles.select} name="role" value="BROKER" disabled>
              <option value="BROKER">Broker</option>
            </select>
            <span className={styles.helper}>Solo los brokers pueden crear un escrow.</span>
          </label>

          <label className={styles.label}>
            Moneda
            <select className={styles.select} name="currency" value={formData.currency} onChange={handleChange} required>
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Tipo de transacción
            <select
              className={styles.select}
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              required
            >
              {transactionTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Tipo de propiedad
            <select
              className={styles.select}
              name="property_type"
              value={formData.property_type}
              onChange={handleChange}
              required
            >
              {propertyTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Valor de la propiedad {currencyLabel}
            <input
              className={styles.input}
              type="number"
              name="property_value"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.property_value || ''}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            Fecha estimada de cierre
            <input
              className={styles.input}
              type="date"
              name="estimated_close_date"
              value={formData.estimated_close_date}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            Dirección de la propiedad
            <textarea
              className={styles.textarea}
              name="property_address"
              value={formData.property_address}
              onChange={handleChange}
              placeholder="Calle, número, ciudad, estado"
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button className={styles.button} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear escrow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EscrowCreatePage;
