import { useLocalStorage } from '@uidotdev/usehooks';
import React, { createContext, useEffect, useState } from 'react';

import { useQuery, useMutation } from '../hooks/use-query';
import { Auth, Memo, Projects, User, Vault } from '../services'; // Import Auth service
import { saveAuthData } from '../services/client';
import { IProject, Auth as AuthTypes, IMemo, IUser } from '../types';

interface User {
  auth: {
    accessToken: string;
    refreshToken: string;
  };
  project?: IProject;
  isRegistrationCompleted?: boolean;
  // ... any other user properties
}

interface UserContextType {
  user: User | null;
  me: IUser | null;
  isAuthorized: boolean;
  isAuthorizeInProgress: boolean;
  projects: IProject[] | undefined;
  isCashier: boolean;
  twoFAdata: {
    codeToken: string;
    method?: number;
  };
  login: (email: string, pass: string) => Promise<void>;
  twoFA: (code: string, isNewMode?: boolean) => Promise<void>;
  logout: () => void;
  signUp: (body: AuthTypes.SignUp.Body) => Promise<void>;
  setProject: React.Dispatch<React.SetStateAction<IProject | null>>; // Add setProject
  setCompleteReginstration: () => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  me: null,
  isCashier: false,
  isAuthorized: false,
  isAuthorizeInProgress: false,
  projects: undefined,
  twoFAdata: {
    codeToken: '',
    method: 1,
  },
  setProject: () => {},
  setCompleteReginstration: () => {},
  login: async () => {
    throw new Error('Not implemented');
  },
  twoFA: async () => {
    throw new Error('Not implemented');
  },
  logout: () => {},
  signUp: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>('user-data', null);
  const [twoFA, setTwoFa] = useState({
    codeToken: '',
  });

  const isAuthorized = Boolean(user?.project);
  const projects = useQuery(
    Projects.my,
    { page: 0 },
    {
      enabled: isAuthorized,
    },
  );
  const memos = useQuery(
    Memo.my,
    { page: 0 },
    {
      enabled: false,
    },
  );
  const me = useQuery(User.view, [], {
    enabled: isAuthorized,
  });

  const currentProjectHasPermissions = (
    me.data?.project_permissions || []
  ).find((i) => i.project_id === user?.project?.id);

  const isCashier = isAuthorized && !currentProjectHasPermissions;

  useEffect(() => {
    if (!user?.auth) {
      setUser(null);
    }
  }, [user]);

  const twoFACode = useMutation(Auth.twoFaCode, {
    onSuccess: async (data) => {
      const { access_token: accessToken, refresh_token: refreshToken } = data;
      saveAuthData(accessToken, refreshToken);
      const resultProjects = await projects.refetch();
      const resultMemos = await memos.refetch();
      const projectsList = resultProjects.data?.list.currentPageResult || [];
      const memosList = resultMemos.data?.list.currentPageResult || [];

      const [project] = projectsList.reverse();
      const [memo] = memosList;

      setUser((prev) => ({
        ...prev,
        auth: {
          accessToken,
          refreshToken,
        },
        project,
        isRegistrationCompleted: Boolean(memo),
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

  const signUpMutation = useMutation(Auth.signUp, {
    onSuccess: async (data) => {
      setTwoFa({
        codeToken: data.twofa.token,
      });
    },
  });

  const contextValue = {
    user,
    me: me.data,
    projects: projects.data?.list.currentPageResult || [],
    memos: memos.data?.list.currentPageResult || [],
    twoFAdata: twoFA,
    isAuthorizeInProgress:
      loginMutation.isPending || twoFARequest.isPending || twoFACode.isPending,
    isAuthorized,
    isCashier,
    setProject: (project: IProject) => {
      setUser((prev) => ({ ...prev, project }));
    },
    login: (email: string, password: string) => {
      return loginMutation.mutateAsync([{ email, password, old_2fa: false }]);
    },
    signUp: (params: AuthTypes.SignUp.Body) =>
      signUpMutation.mutateAsync([params]),
    twoFA: (code: string, isNewMode = true) => {
      if (!twoFA.codeToken) {
        throw new Error('Login failed - No code token');
      }
      return twoFACode.mutateAsync([
        { isNewMode },
        { code_token: twoFA.codeToken, method: twoFA.method, code },
      ]);
    },
    logout: () => {
      setUser(null);
    },
    setCompleteReginstration: () => {
      setUser((prev) => ({
        ...prev!,
        isRegistrationCompleted: true,
      }));
    },
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
