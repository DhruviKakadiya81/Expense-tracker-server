import jwt, { SignOptions } from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || "default_jwt_secret_change_me";
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET || "default_jwt_secret_change_me";
  return jwt.verify(token, secret) as TokenPayload;
};
