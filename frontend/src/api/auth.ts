import api from './client';
import { AuthResponse, BecomeBrokerResponse, LoginPayload, RegisterPayload } from '@/types/auth';

export const loginRequest = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', payload);
  return response.data;
};

export const registerRequest = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', payload);
  return response.data;
};

export const logoutRequest = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const becomeBrokerRequest = async (): Promise<BecomeBrokerResponse> => {
  const response = await api.post<BecomeBrokerResponse>('/auth/become-broker');
  return response.data;
};
