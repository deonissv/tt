export class JWTPayload {
  readonly username: string;
  readonly email: string;
  readonly avatar_url: string | null;
  readonly code: string;
  readonly sub: number;
}

export class JWT extends JWTPayload {
  readonly iat: number;
  readonly exp: number;
}
