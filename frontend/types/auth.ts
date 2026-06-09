export interface LoginRequest {
  identifier: string  // email address or username
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  display_name: string
}

export interface RegisterResponse {
  message: string
  user: {
    id: string
    email: string
    username: string
  }
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: {
    id: string
    email: string
    username: string
  }
}

export interface RefreshRequest {
  refresh_token: string
}

export interface LogoutRequest {
  refresh_token: string
}

export interface AuthUser {
  id: string
  username: string
  email: string
}
