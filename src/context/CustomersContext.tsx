import { createContext, useContext, useState, ReactNode } from 'react';
import { Customer } from '../types/customer';

interface CustomersContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'projects'>) => void;
  updateCustomer: (customerId: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;
  getCustomerById: (customerId: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

// Mock data inicial - en producción vendría de MongoDB
const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+54 11 1234-5678',
    company: 'Pérez S.A.',
    address: 'Av. Corrientes 1234',
    city: 'Buenos Aires',
    country: 'Argentina',
    projects: ['project-1', 'project-2'],
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-10-20')
  },
  {
    id: 'customer-2',
    name: 'María Rodríguez',
    email: 'maria.rodriguez@email.com',
    phone: '+54 11 4567-8901',
    company: 'Rodríguez & Asociados',
    projects: ['project-3'],
    createdAt: new Date('2025-02-10'),
    updatedAt: new Date('2025-10-22')
  },
  {
    id: 'customer-3',
    name: 'Carlos Gómez',
    email: 'carlos.gomez@empresa.com',
    phone: '+54 11 9876-5432',
    company: 'Gómez Technologies',
    projects: ['project-4'],
    createdAt: new Date('2025-03-05'),
    updatedAt: new Date('2025-10-19')
  }
];

export const CustomersProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'projects'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `customer-${Date.now()}`,
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const updateCustomer = (customerId: string, customerData: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer =>
      customer.id === customerId
        ? { ...customer, ...customerData, updatedAt: new Date() }
        : customer
    ));
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== customerId));
  };

  const getCustomerById = (customerId: string) => {
    return customers.find(customer => customer.id === customerId);
  };

  const searchCustomers = (query: string) => {
    if (!query.trim()) return customers;

    const lowerQuery = query.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.email.toLowerCase().includes(lowerQuery) ||
      customer.company?.toLowerCase().includes(lowerQuery) ||
      customer.phone?.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <CustomersContext.Provider value={{
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomerById,
      searchCustomers
    }}>
      {children}
    </CustomersContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomersContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomersProvider');
  }
  return context;
};

