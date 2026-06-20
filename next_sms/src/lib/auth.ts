import * as jose from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "school-sms-jwt-super-secret-key-2026"
);

export async function signJWT(payload: any, duration: string = "12h") {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(duration)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  // If the hash starts with $2y$, replace it with $2a$ because bcryptjs expects $2a$ or $2b$
  // Laravel generates $2y$ hashes which represent bcrypt blowfish hashes
  const sanitizedHash = hash.startsWith("$2y$") ? "$2a$" + hash.slice(4) : hash;
  return await bcrypt.compare(password, sanitizedHash);
}
