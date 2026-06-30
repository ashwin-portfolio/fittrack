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

export interface UserPublic {
  id: string
  email: string
  username: string
  is_email_verified: boolean
}

export interface RegisterResponse {
  message: string
  user: UserPublic
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: UserPublic
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
  is_email_verified: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
  confirm_password: string
}

export interface MessageResponse {
  message: string
}
