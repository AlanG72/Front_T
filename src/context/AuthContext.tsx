import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '../types';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { getPermissionsForRole, generateUserToken } from '../context/AuthUtils';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  refreshTokenIfNeeded: () => Promise<void>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  fetchAndUpdateUser: (email: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
  const initializeAuth = async () => {
    const token = localStorage.getItem('access_token');
    const expiresAt = parseInt(localStorage.getItem('expires_at') || '0', 10);
    const email = localStorage.getItem('email');

    if (token && email && Date.now() < expiresAt) {
      await fetchAndUpdateUser(email); // 🔁 Esperamos que termine para saber si poner loading en false
    } else {
      logout(); // Esto ya pone loading en false
    }
  };

  initializeAuth();
}, []);


interface KeycloakJwtPayload extends JwtPayload {
  realm_access?: {
    roles: string[];
  };
}




const rolesPermissions: Record<string, string[]> = {
  "Administrador": ["gestionar usuarios", "gestionar roles y permisos", "administrar subastas", "gestionar reportes", "administrar medios de pago", "gestionar reclamos y disputas", "visualizar historial de transacciones"],
  "Subastador": ["crear y administrar subastas", "configurar productos", "definir reglas de participación", "validar pujas", "notificar ganadores", "revisar reclamos"],
  "Postor": ["explorar subastas", "realizar pujas", "pagar productos ganados", "reclamar premios", "presentar reclamos", "visualizar historial de compras y pujas"],
  "Soporte": ["resolver reclamos", "gestionar estados de disputas", "revisar reportes de actividad y seguridad", "solucionar problemas de acceso y pagos"]
};

// 🔄 Obtener permisos sin necesidad de un archivo externo
const getPermissionsForRole = (role: string): string[] => {
  return rolesPermissions[role] || [];
};



const fetchAndUpdateUser = async (email: string): Promise<void> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return logout();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Usuarios/email/${email}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Error fetching user');

    const rawUser = await res.json();
    const decodedToken = jwtDecode<KeycloakJwtPayload>(token);
    const userRoles = decodedToken?.realm_access?.roles || [];


    const roleMapping: Record<string, 'admin' | 'auctioneer' | 'bidder' | 'support'> = {
      'Administrador': 'admin',
      'Subastador': 'auctioneer',
      'Postor': 'bidder',
      'Soporte': 'support'
    };

    const validRole = userRoles.find(r => roleMapping[r]) || 'guest';
    console.log("🔍 Rol extraído del token:", validRole);

    const permisos = getPermissionsForRole(validRole);
    console.log("🧩 Permisos generados:", permisos);

    const secretKey = import.meta.env.VITE_SECRET_KEY; // 🔄 Asegúrate de que la clave venga de un entorno seguro

    console.log("🔑 Clave usada para firmar el token en frontend:", secretKey);

    const newToken = await generateUserToken(rawUser.id, validRole, permisos);
    localStorage.setItem('user_token', newToken);


        
    const userType: 'bidder' | 'auctioneer' | 'admin' | 'support' = roleMapping[validRole] || 'bidder';


    const mappedUser: User = {
      id: rawUser.id,
      email: rawUser.correo,
      firstName: rawUser.nombre,
      lastName: rawUser.apellido,
      phone: rawUser.telefono,
      address: rawUser.direccion,
      userType,
      verificado: rawUser.verificado,
    };

    setAuthState({
      user: mappedUser,
      isAuthenticated: true,
      isLoading: false,
    });
  } catch (err) {
    console.error('Error al cargar el perfil:', err);
    logout();
  }
};


/*
const fetchAndUpdateUser = async (email: string): Promise<void> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return logout();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Usuarios/email/${email}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Error fetching user');

    const rawUser = await res.json();
    const decodedToken = jwtDecode<KeycloakJwtPayload>(token);
    const userRoles = decodedToken?.realm_access?.roles || [];

    const role = userRoles[0] || 'guest';
    const permisos = await getPermissionsForRole(role); // 🔄 Nueva consulta a la BD

    const newToken = generateUserToken(rawUser.id, role, permisos); // 🔥 Generar nuevo JWT
    localStorage.setItem('user_token', newToken); // 🔄 Guardarlo en localStorage

    // 🔄 Mapeo de roles
    const roleMapping: Record<string, 'bidder' | 'auctioneer' | 'admin' | 'support'> = {
      'Subastador': 'auctioneer',
      'Postor': 'bidder',
      'Administrador': 'admin',
      'Soporte': 'support'
    };

    
    const foundRole = userRoles.find(role => roleMapping[role]);
    const userType: 'bidder' | 'auctioneer' | 'admin' | 'support' = foundRole 
      ? roleMapping[foundRole] 
      : 'bidder'; // Default si el usuario no tiene un rol válido


    const mappedUser: User = {
      id: rawUser.id,
      email: rawUser.correo,
      firstName: rawUser.nombre,
      lastName: rawUser.apellido,
      phone: rawUser.telefono,
      address: rawUser.direccion,
      userType,
      verificado: rawUser.verificado,
    };

    setAuthState({
      user: mappedUser,
      isAuthenticated: true,
      isLoading: false,
    });
  } catch (err) {
    console.error('Error al cargar el perfil:', err);
    logout();
  }
};
*/

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const params = new URLSearchParams();
      params.append('client_id', 'adduser-client');
      params.append('client_secret', '8dm7NVYDcQw4jGHnx7n7souieX0Y6IOV');
      params.append('grant_type', 'password');
      params.append('username', email);
      params.append('password', password);

      const response = await fetch('http://localhost:8080/realms/realm-adduser/protocol/openid-connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      if (!response.ok) return 'Correo o contraseña incorrectos';

      const data = await response.json();
      const expiresAt = Date.now() + data.expires_in * 1000;

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('expires_at', expiresAt.toString());
      localStorage.setItem('email', email);

      await fetchAndUpdateUser(email);

      return null;
    } catch (err) {
      console.error('Login error:', err);
      logout();
      return 'Ocurrió un error al intentar iniciar sesión';
    }
  };

  const refreshTokenIfNeeded = async () => {
    const expiresAt = parseInt(localStorage.getItem('expires_at') || '0', 10);
    const now = Date.now();
    if (now < expiresAt - 60000) return;

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return logout();

    try {
      const params = new URLSearchParams();
      params.append('client_id', 'adduser-client');
      params.append('client_secret', '8dm7NVYDcQw4jGHnx7n7souieX0Y6IOV');
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refreshToken);

      const response = await fetch('http://localhost:8080/realms/realm-adduser/protocol/openid-connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      if (!response.ok) return logout();

      const data = await response.json();
      const newExpiresAt = Date.now() + data.expires_in * 1000;

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('expires_at', newExpiresAt.toString());

      const email = localStorage.getItem('email');
      if (email) await fetchAndUpdateUser(email);
    } catch (err) {
      console.error('Error al refrescar token:', err);
      logout();
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/register-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.email,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: userData.password,
        }),
      });

      return response.ok;
    } catch (err) {
      console.error('Error registrando usuario:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('email');
    localStorage.removeItem('user');

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
  value={{
    ...authState,
    login,
    logout,
    refreshTokenIfNeeded,
    register,
    fetchAndUpdateUser,
    setUser: (user) => setAuthState((prev) => ({ ...prev, user })),
  }}
>
  {children}
</AuthContext.Provider>

  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
