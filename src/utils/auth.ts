import * as jwt from "jsonwebtoken";

export const APP_SECRET: string = "GraphQL-is-awesome";

export interface AuthTokenPayload {
   userdId: number;
}

export function decodeAuthHeader(authHeader: string): AuthTokenPayload {
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    throw new Error("No token found");
  }

  return jwt.verify(token, APP_SECRET) as AuthTokenPayload;
}
