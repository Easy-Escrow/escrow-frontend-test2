export interface User {
  id: string;
  email: string;
  is_broker: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface RequestBrokerResponse {
  message?: string;
}
