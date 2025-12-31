export interface JwtPayload {
  email: string;
  sub: string; // user id
  role?: string; // user role for RBAC
  iat?: number;
  exp?: number;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

