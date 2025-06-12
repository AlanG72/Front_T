import { User } from './user';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TokenPayload {
  sub: string;
  role: 'bidder' | 'auctioneer' | 'admin' | 'support';
  permisos: string[];
  exp?: number;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
