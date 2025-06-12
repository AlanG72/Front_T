import { SignJWT } from 'jose';
import { Buffer } from "buffer";
window.Buffer = Buffer;


export const generateUserToken = async (userId: string, role: string, permisos: string[]): Promise<string> => {
  const secretKey = import.meta.env.VITE_SECRET_KEY; // 🔄 Misma clave del backend
  const encodedKey = new Uint8Array(Buffer.from(secretKey, "utf-8")); // 🔥 Codificación idéntica

  return await new SignJWT({ sub: userId, role, permisos })
    .setProtectedHeader({ alg: 'HS256' }) // 🔥 Algoritmo correcto
    .setExpirationTime('1h')
    .sign(encodedKey);
};
/*
export const getPermissionsForRole = async (role: string): Promise<string[]> => {
  try {
    const response = await fetch(`http://localhost:5175/api/roles/${role}/permisos`);
    if (!response.ok) throw new Error('Error al obtener permisos');

    const data = await response.json();
    return data.permisos; // 🔥 Retorna la lista de permisos
  } catch (err) {
    console.error('Error al obtener permisos:', err);
    return [];
  }
};
*/

