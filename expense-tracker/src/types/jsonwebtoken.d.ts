declare module 'jsonwebtoken' {
  // Minimal, safer typings to avoid `any` eslint errors.
  // Prefer installing official types with:
  //   npm i --save-dev @types/jsonwebtoken
  type JwtPayload = string | Buffer | Record<string, unknown>;
  type JwtSignOptions = Record<string, unknown> | undefined;
  type JwtVerifyOptions = Record<string, unknown> | undefined;
  type JwtDecodeOptions = Record<string, unknown> | undefined;

  export function sign(payload: JwtPayload, secretOrPrivateKey: string, options?: JwtSignOptions): string;
  export function verify<T = Record<string, unknown> | string>(token: string, secretOrPublicKey: string, options?: JwtVerifyOptions): T;
  export function decode(token: string, options?: JwtDecodeOptions): Record<string, unknown> | string | null;
}
