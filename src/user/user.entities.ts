export type CreateUserParams = {
    name: string,
    email: string,
    password: string,
}

export type LoginUserParams = {
    email: string,
    password: string,
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  isAdmin?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}


export interface RefreshTokenParams {
  refreshToken: string;
  userId: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}