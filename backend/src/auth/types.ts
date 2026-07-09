export interface SessionAuth {
  username: string;
  accessToken: string;
  expiresAt: number;
}

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  username?: string;
  expiresAt?: number;
  mockAfnic: boolean;
}
