import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  Supplier,
  PaymentTerms,
  Currency,
  SupplierStatus,
  CreateSupplierRequest,
  UpdateSupplierRequest
} from '@/lib/types/suppliers';

interface SupplierModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSupplierRequest | UpdateSupplierRequest) => void;
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  supplier,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>({
    code: '',
    name: '',
    legal_name: '',
    rfc: '',

    // Dirección
    address_street: '',
    address_number: '',
    address_colony: '',
    address_city: '',
    address_state: '',
    address_country: 'México',
    address_zip: '',

    // Contacto
    contact_name: '',
    contact_position: '',
    contact_phone: '',
    contact_email: '',

    // Financiero
    payment_terms: PaymentTerms.CASH,
    credit_limit: '',
    currency: Currency.MXN,
    bank_account: '',

    // Logística
    lead_time_days: '',
    min_order_value: '',

    // Estado
    status: SupplierStatus.ACTIVE,
    certifications: null,
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        code: supplier.code || '',
        name: supplier.name || '',
        legal_name: supplier.legal_name || '',
        rfc: supplier.rfc || '',

        // Dirección
        address_street: supplier.address_street || '',
        address_number: supplier.address_number || '',
        address_colony: supplier.address_colony || '',
        address_city: supplier.address_city || '',
        address_state: supplier.address_state || '',
        address_country: supplier.address_country || 'México',
        address_zip: supplier.address_zip || '',

        // Contacto
        contact_name: supplier.contact_name || '',
        contact_position: supplier.contact_position || '',
        contact_phone: supplier.contact_phone || '',
        contact_email: supplier.contact_email || '',

        // Financiero
        payment_terms: supplier.payment_terms || PaymentTerms.CASH,
        credit_limit: supplier.credit_limit || '',
        currency: supplier.currency || Currency.MXN,
        bank_account: supplier.bank_account || '',

        // Logística
        lead_time_days: supplier.lead_time_days || '',
        min_order_value: supplier.min_order_value || '',

        // Estado
        status: supplier.status || SupplierStatus.ACTIVE,
        certifications: supplier.certifications || null,
      });
    } else {
      // Reset form for new supplier
      setFormData({
        code: '',
        name: '',
        legal_name: '',
        rfc: '',

        address_street: '',
        address_number: '',
        address_colony: '',
        address_city: '',
        address_state: '',
        address_country: 'México',
        address_zip: '',

        contact_name: '',
        contact_position: '',
        contact_phone: '',
        contact_email: '',

        payment_terms: PaymentTerms.CASH,
        credit_limit: '',
        currency: Currency.MXN,
        bank_account: '',

        lead_time_days: '',
        min_order_value: '',

        status: SupplierStatus.ACTIVE,
        certifications: null,
      });
    }
  }, [supplier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value ? parseFloat(value) : ''
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validate = () => {
    const newErrors: any = {};

    // Validaciones básicas (solo campos requeridos)
    if (!formData.code) newErrors.code = 'El código es requerido';
    if (!formData.name) newErrors.name = 'El nombre es requerido';

    // Validación RFC (México) - solo si se proporciona
    if (formData.rfc && formData.address_country === 'México') {
      const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
      if (!rfcPattern.test(formData.rfc.toUpperCase())) {
        newErrors.rfc = 'RFC inválido (formato: ABC123456789)';
      }
    }

    // Validación email de contacto - solo si se proporciona
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contact_email && !emailPattern.test(formData.contact_email)) {
      newErrors.contact_email = 'Email del contacto inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Cambiar al tab con errores
      if (errors.code || errors.name || errors.legal_name || errors.rfc) {
        setActiveTab('basic');
      } else if (errors.address_street || errors.address_city) {
        setActiveTab('location');
      } else if (errors.contact_email) {
        setActiveTab('contact');
      }
      return;
    }

    const data: any = { ...formData };

    // Convertir campos numéricos vacíos a undefined
    const numericFields = ['credit_limit', 'lead_time_days', 'min_order_value'];
    numericFields.forEach(field => {
      if (data[field] === '' || data[field] === null) {
        data[field] = undefined;
      } else if (data[field]) {
        data[field] = parseFloat(data[field]);
      }
    });

    // Limpiar campos vacíos (convertir strings vacíos a undefined)
    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        data[key] = undefined;
      }
    });

    // Normalizar RFC a mayúsculas
    if (data.rfc) {
      data.rfc = data.rfc.toUpperCase();
    }

    // Remover campos undefined para no enviarlos al backend
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    console.log('Datos limpios a enviar:', cleanData);

    onSave(cleanData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity" />

        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all max-w-4xl w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'basic'
                      ? 'border-[#7cb342] text-[#7cb342]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Información Básica
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('location')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'location'
                      ? 'border-[#7cb342] text-[#7cb342]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ubicación
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'contact'
                      ? 'border-[#7cb342] text-[#7cb342]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Contacto
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('financial')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'financial'
                      ? 'border-[#7cb342] text-[#7cb342]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Información Financiera
                </button>
              </nav>
            </div>

            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* Tab: Información Básica */}
              {activeTab === 'basic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Código *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                        errors.code
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-[#7cb342] focus:ring-[#7cb342]'
                      }`}
                      placeholder="PROV-001"
                    />
                    <p className="mt-1 text-xs text-gray-500">Identificador único del proveedor</p>
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      RFC
                    </label>
                    <input
                      type="text"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                        errors.rfc
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-[#7cb342] focus:ring-[#7cb342]'
                      }`}
                      placeholder="ABC123456789"
                    />
                    <p className="mt-1 text-xs text-gray-500">Registro Federal de Contribuyentes (13 caracteres)</p>
                    {errors.rfc && (
                      <p className="mt-1 text-sm text-red-600">{errors.rfc}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre Comercial *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                        errors.name
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-[#7cb342] focus:ring-[#7cb342]'
                      }`}
                      placeholder="Distribuidora de Insumos"
                    />
                    <p className="mt-1 text-xs text-gray-500">Nombre comercial del proveedor</p>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Razón Social
                    </label>
                    <input
                      type="text"
                      name="legal_name"
                      value={formData.legal_name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="DISTRIBUIDORA DE INSUMOS NATURALES S.A. DE C.V."
                    />
                    <p className="mt-1 text-xs text-gray-500">Razón social legal según documentos fiscales (opcional)</p>
                  </div>

                  {supplier && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estado
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      >
                        <option value={SupplierStatus.ACTIVE}>Activo</option>
                        <option value={SupplierStatus.INACTIVE}>Inactivo</option>
                        <option value={SupplierStatus.SUSPENDED}>Suspendido</option>
                        <option value={SupplierStatus.BLACKLISTED}>Lista Negra</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Estado operativo del proveedor</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Ubicación */}
              {activeTab === 'location' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Calle
                    </label>
                    <input
                      type="text"
                      name="address_street"
                      value={formData.address_street}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="Av. Insurgentes Sur"
                    />
                    <p className="mt-1 text-xs text-gray-500">Nombre de la calle o avenida</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número
                    </label>
                    <input
                      type="text"
                      name="address_number"
                      value={formData.address_number}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="1234"
                    />
                    <p className="mt-1 text-xs text-gray-500">Número exterior e interior</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Colonia
                    </label>
                    <input
                      type="text"
                      name="address_colony"
                      value={formData.address_colony}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="Del Valle"
                    />
                    <p className="mt-1 text-xs text-gray-500">Colonia o fraccionamiento</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="address_city"
                      value={formData.address_city}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="Guadalajara"
                    />
                    <p className="mt-1 text-xs text-gray-500">Ciudad o municipio</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <input
                      type="text"
                      name="address_state"
                      value={formData.address_state}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="Jalisco"
                    />
                    <p className="mt-1 text-xs text-gray-500">Estado o provincia</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="address_zip"
                      value={formData.address_zip}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="44100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Código postal de 5 dígitos</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      País
                    </label>
                    <input
                      type="text"
                      name="address_country"
                      value={formData.address_country}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="México"
                    />
                    <p className="mt-1 text-xs text-gray-500">País donde opera el proveedor</p>
                  </div>
                </div>
              )}

              {/* Tab: Contacto */}
              {activeTab === 'contact' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-4">
                      Información del contacto principal para comunicaciones comerciales
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre del Contacto
                    </label>
                    <input
                      type="text"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="Juan Pérez García"
                    />
                    <p className="mt-1 text-xs text-gray-500">Nombre completo del contacto principal</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cargo
                    </label>
                    <input
                      type="text"
                      name="contact_position"
                      value={formData.contact_position}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="Gerente de Ventas"
                    />
                    <p className="mt-1 text-xs text-gray-500">Puesto o cargo del contacto</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Teléfono del Contacto
                    </label>
                    <input
                      type="text"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="33-9876-5432"
                    />
                    <p className="mt-1 text-xs text-gray-500">Teléfono directo del contacto</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email del Contacto
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                        errors.contact_email
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-[#7cb342] focus:ring-[#7cb342]'
                      }`}
                      placeholder="juan.perez@proveedor.com"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email directo del contacto</p>
                    {errors.contact_email && (
                      <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Información Financiera */}
              {activeTab === 'financial' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Términos de Pago
                    </label>
                    <select
                      name="payment_terms"
                      value={formData.payment_terms}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                    >
                      <option value={PaymentTerms.CASH}>Contado</option>
                      <option value={PaymentTerms.NET_15}>15 días</option>
                      <option value={PaymentTerms.NET_30}>30 días</option>
                      <option value={PaymentTerms.NET_45}>45 días</option>
                      <option value={PaymentTerms.NET_60}>60 días</option>
                      <option value={PaymentTerms.NET_90}>90 días</option>
                      <option value={PaymentTerms.PREPAID}>Prepago</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Plazo de pago acordado con el proveedor</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Límite de Crédito
                    </label>
                    <input
                      type="number"
                      name="credit_limit"
                      value={formData.credit_limit}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="100000.00"
                    />
                    <p className="mt-1 text-xs text-gray-500">Monto máximo de crédito acordado</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Moneda
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                    >
                      <option value={Currency.MXN}>MXN - Peso Mexicano</option>
                      <option value={Currency.USD}>USD - Dólar Americano</option>
                      <option value={Currency.EUR}>EUR - Euro</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Moneda en la que se manejan las transacciones</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cuenta Bancaria
                    </label>
                    <input
                      type="text"
                      name="bank_account"
                      value={formData.bank_account}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="012180001234567890"
                    />
                    <p className="mt-1 text-xs text-gray-500">CLABE interbancaria (18 dígitos) o número de cuenta</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lead Time (días)
                    </label>
                    <input
                      type="number"
                      name="lead_time_days"
                      value={formData.lead_time_days}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="15"
                    />
                    <p className="mt-1 text-xs text-gray-500">Días desde pedido hasta recepción</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Pedido Mínimo
                    </label>
                    <input
                      type="number"
                      name="min_order_value"
                      value={formData.min_order_value}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="1000.00"
                    />
                    <p className="mt-1 text-xs text-gray-500">Monto mínimo de pedido requerido</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7cb342] hover:bg-[#689f38]"
              >
                {supplier ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierModal;
