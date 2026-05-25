import { User } from '@airmada/types';

export interface DummyUser extends User {
  email: string;
  password: string;
}

export const DUMMY_USERS: DummyUser[] = [
  { 
    id: 'usr-001', 
    full_name: 'Andi Saputra', 
    short_name: 'Andi', 
    cell_phone: '08110000001',
    email: 'andi@airmada.id', 
    password: 'andi1234', 
    role: 'MANAGER'
  },
  { 
    id: 'usr-002', 
    full_name: 'Siti Rahma', 
    short_name: 'Siti', 
    cell_phone: '08110000002',
    email: 'siti@airmada.id', 
    password: 'siti1234', 
    role: 'DISPATCHER'
  },
  { 
    id: 'usr-003', 
    full_name: 'Budi Santoso', 
    short_name: 'Budi', 
    cell_phone: '08110000003',
    email: 'budi@airmada.id', 
    password: 'budi1234', 
    role: 'DRIVER'
  },
];