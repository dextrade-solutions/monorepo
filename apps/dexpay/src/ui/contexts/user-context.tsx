import { useLocalStorage } from '@uidotdev/usehooks';
import React, { createContext, useEffect, useState } from 'react';

import { useQuery, useMutation } from '../hooks/use-query';
import { Auth, Projects } from '../services'; // Import Auth service
import { saveAuthData } from '../services/client';
import { IProject } from '../types';

interface User {
  auth: {
    accessToken: string;
    refreshToken: string;
  };
  project: IProject;
  // ... any other user properties
}

interface UserContextType {
  user: User | null;
  isAuthorized: boolean;
  isAuthorizeInProgress: boolean;
  projects: IProject[] | undefined;
  twoFAdata: {
    codeToken: string;
    method: number;
  };
  setProject: React.Dispatch<React.SetStateAction<IProject | null>>; // Add setProject
  login: (email: string, pass: string) => Promise<void>;
  twoFA: (code: string) => Promise<void>;
  logout: () => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  isAuthorized: false,
  isAuthorizeInProgress: false,
  projects: undefined,
  twoFAdata: {
    codeToken: '',
    method: 1,
  },
  setProject: () => {},
  login: async () => {
    throw new Error('Not implemented');
  },
  twoFA: async () => {
    throw new Error('Not implemented');
  },
  logout: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>('user-data', null);
  const [twoFA, setTwoFa] = useState({
    codeToken: '',
    method: 1,
  }); // twoFA code token

  const projects = useQuery(
    Projects.my,
    { page: 0 },
    {
      enabled: Boolean(user),
    },
  );

  useEffect(() => {
    if (!user?.auth) {
      setUser(null);
    }
  }, [user]);

  const twoFACode = useMutation(Auth.twoFaCode, {
    onSuccess: async (data) => {
      const { access_token: accessToken, refresh_token: refreshToken } = data;
      saveAuthData(accessToken, refreshToken);
      const result = await projects.refetch();
      const [project] = result.data?.list.currentPageResult || [];

      setUser((prev) => ({
        ...prev,
        auth: {
          accessToken,
          refreshToken,
        },
        project,
      }));
      setTwoFa((v) => ({
        ...v,
        codeToken: '',
      }));
    },
  });
  const twoFARequest = useMutation(Auth.twoFaRequest, {
    onSuccess: (data) => {
      setTwoFa((v) => ({
        ...v,
        codeToken: data.twofa.code_token,
      }));
    },
  });
  const loginMutation = useMutation(Auth.signIn, {
    onSuccess: async (data) => {
      if (!data.tokens) {
        throw new Error('Login failed');
      }
      const method = 1; // Email auth
      await twoFARequest.mutateAsync([
        {
          auth_token: data.tokens.access_token,
          method,
        },
      ]);
      setTwoFa((v) => ({
        ...v,
        method,
      }));
    },
  });

  const contextValue = {
    user,
    projects: projects.data,
    twoFAdata: twoFA,
    isAuthorizeInProgress:
      loginMutation.isPending || twoFARequest.isPending || twoFACode.isPending,
    isAuthorized: Boolean(user),
    setProject: (project: IProject) => {
      setUser((prev) => ({ ...prev, project }));
    },
    login: (email: string, password: string) => {
      return loginMutation.mutateAsync([{ email, password, old_2fa: false }]);
    },
    twoFA: (code: string) => {
      if (!twoFA.codeToken) {
        throw new Error('Login failed - No code token');
      }
      return twoFACode.mutateAsync([
        { code_token: twoFA.codeToken, method: twoFA.method, code },
      ]);
    },
    logout: () => {
      setUser(null);
    },
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
