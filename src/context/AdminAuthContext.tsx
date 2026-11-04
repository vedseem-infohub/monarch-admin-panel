'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/apiClient';
import { setAdminSession, clearAdminSession, getAdminToken, getStoredAdminUser } from '@/utils/authCookies';

export interface AdminAuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  phone?: string;
  joinedDate?: string;
}

interface AdminAuthContextType {
  admin: AdminAuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Known fallback authorized admin accounts for dev/offline resilience
const FALLBACK_ADMINS = [
  {
    email: 'devraj@monarch-couture.in',
    password: 'monarch123',
    name: 'Devraj Singh Rathore',
    role: 'Super Admin',
    status: 'Active',
    avatar: 'DR',
    phone: '+91 98200 11223',
  },
  {
    email: 'gayatri@monarch-couture.in',
    password: 'monarch123',
    name: 'Gayatri Devi Chawla',
    role: 'Catalog Director',
    status: 'Active',
    avatar: 'GD',
    phone: '+91 98200 44590',
  },
  {
    email: 'vikram.rao@monarch-couture.in',
    password: 'monarch123',
    name: 'Vikramaditya Rao',
    role: 'Order Specialist',
    status: 'Active',
    avatar: 'VR',
    phone: '+91 98200 55667',
  },
];

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminAuthUser | null>(() => getStoredAdminUser());
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize and verify admin session on client mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const storedToken = getAdminToken();
        const storedUser = getStoredAdminUser();

        if (storedToken) {
          if (isMounted) {
            setToken(storedToken);
            if (storedUser) {
              setAdmin(storedUser);
            }
          }

          // Asynchronously verify against backend /api/auth/admin-me
          try {
            const res = await apiClient.auth.getAdminMe();
            if (!isMounted) return;

            if (res.success && res.user) {
              setAdmin(res.user);
              setAdminSession(storedToken, res.user, true);
            } else if (!res.success && res.message?.includes('Unauthorized')) {
              // Token strictly invalid or revoked
              clearAdminSession();
              setAdmin(null);
              setToken(null);
            }
          } catch {
            // Keep stored offline session if backend is momentarily unreachable
          }
        }
      } catch (err) {
        console.error('Error hydrating admin authentication session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe: boolean = true
    ): Promise<{ success: boolean; error?: string }> => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (!cleanEmail || !cleanPassword) {
        return { success: false, error: 'Email and password credentials are required.' };
      }

      // 1. Attempt backend authentication first
      try {
        const backendRes = await apiClient.auth.adminLogin(cleanEmail, cleanPassword);

        if (backendRes.success && backendRes.token && backendRes.user) {
          // Strictly reject any customer role that might bypass API checks
          const role = (backendRes.user.role || '').toLowerCase();
          if (role === 'customer') {
            return {
              success: false,
              error: 'Access Denied: Customer accounts are strictly prohibited from accessing MONARCH Atelier Administration.',
            };
          }

          const adminData: AdminAuthUser = {
            id: backendRes.user.id || `admin-${Date.now()}`,
            name: backendRes.user.name || 'Admin Operator',
            email: backendRes.user.email,
            role: backendRes.user.role || 'Super Admin',
            status: backendRes.user.status || 'Active',
            avatar: backendRes.user.name
              ? backendRes.user.name
                  .split(' ')
                  .map((w: string) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'MN',
            phone: backendRes.user.phone,
            joinedDate: backendRes.user.joinedDate,
          };

          setAdminSession(backendRes.token, adminData, rememberMe);
          setAdmin(adminData);
          setToken(backendRes.token);
          return { success: true };
        }

        // If backend explicitly returned an error (e.g. invalid password, wrong role)
        if (!backendRes.success && backendRes.message && !backendRes.message.includes('failed to fetch') && !backendRes.message.includes('Connection to authentication')) {
          return { success: false, error: backendRes.message };
        }
      } catch (apiErr: any) {
        // Continue to offline verification fallback only on network failure
        console.warn('Backend authentication unreachable, falling back to local verification:', apiErr.message);
      }

      // 2. Offline / High-resilience fallback check
      const fallbackAccount = FALLBACK_ADMINS.find((a) => a.email.toLowerCase() === cleanEmail);
      if (fallbackAccount && cleanPassword === fallbackAccount.password) {
        const generatedToken = `mnr_sec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const adminData: AdminAuthUser = {
          id: `usr-${fallbackAccount.email}`,
          name: fallbackAccount.name,
          email: fallbackAccount.email,
          role: fallbackAccount.role,
          status: fallbackAccount.status,
          avatar: fallbackAccount.avatar,
          phone: fallbackAccount.phone,
          joinedDate: 'October 2026',
        };

        setAdminSession(generatedToken, adminData, rememberMe);
        setAdmin(adminData);
        setToken(generatedToken);
        return { success: true };
      }

      return {
        success: false,
        error: 'Invalid credentials or unauthorized administrative operator.',
      };
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.auth.logout();
    } catch {
      // ignore
    } finally {
      clearAdminSession();
      setAdmin(null);
      setToken(null);
      router.push('/login');
    }
  }, [router]);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: Boolean(admin && token),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

const defaultAuthContext: AdminAuthContextType = {
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false, error: 'Authentication initializing...' }),
  logout: async () => {},
};

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    return defaultAuthContext;
  }
  return context;
}

