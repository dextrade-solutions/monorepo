import { useLocalStorage } from '@uidotdev/usehooks';
import React, { createContext, useEffect, useState } from 'react';

import { useQuery, useMutation } from '../hooks/use-query';
import { Auth, Memo, Projects, User } from '../services'; // Import Auth service
import { saveAuthData } from '../services/client';
import { IProject, Auth as AuthTypes, IUser } from '../types';

interface IStoredUser {
  auth: {
    accessToken: string;
    refreshToken: string;
  };
  project?: IProject;
  isRegistrationCompleted?: boolean;
  isCashier?: boolean;
  primaryCurrency?: string;
  // ... any other user properties
}

interface UserContextType {
  user: IStoredUser | null;
  me: IUser | null;
  isAuthorized: boolean;
  isAuthorizeInProgress: boolean;
  projects: IProject[] | undefined;
  isLoading: boolean;
  twoFAdata: {
    codeToken: string;
    method?: number;
  };
  login: (email: string, pass: string) => Promise<void>;
  twoFA: (
    code: string,
    isNewMode?: boolean,
    codeToken?: string,
    method?: number,
  ) => Promise<void>;
  logout: () => void;
  signUp: (body: AuthTypes.SignUp.Body) => Promise<void>;
  setProject: React.Dispatch<React.SetStateAction<IProject | null>>; // Add setProject
  setCompleteReginstration: () => void;
  setPrimaryCurrency: (v: string) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  me: null,
  isLoading: false,
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

const getRole = (projectPermissions = [], currentProjectId: number) => {
  const currentProjectHasPermissions = projectPermissions.find(
    (i) => i.project_id === currentProjectId,
  );

  const isCashier = !currentProjectHasPermissions;
  return { isCashier };
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useLocalStorage<IStoredUser | null>(
    'user-data',
    null,
  );
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

  const isLoading = projects.isLoading || me.isLoading;

  useEffect(() => {
    if (!user?.auth) {
      setUser(null);
    }
  }, [user]);

  const twoFACode = useMutation(Auth.twoFaCode, {
    onSuccess: async (data) => {
      const { access_token: accessToken, refresh_token: refreshToken } = data;
      saveAuthData(accessToken, refreshToken);

      const [resultProjects, resultMemos, resultMe] = await Promise.all([
        projects.refetch(),
        memos.refetch(),
        me.refetch(),
      ]);

      const projectsList = resultProjects.data?.list.currentPageResult || [];
      const memosList = resultMemos.data?.list.currentPageResult || [];

      const [project] = projectsList.reverse();
      const [memo] = memosList;

      const { isCashier } = getRole(
        resultMe.data.project_permissions,
        project.id,
      );

      setUser((prev) => ({
        ...prev,
        auth: {
          accessToken,
          refreshToken,
        },
        project,
        isRegistrationCompleted: Boolean(memo) || isCashier,
        isCashier,
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
    isLoading,
    me: me.data,
    projects: projects.data?.list.currentPageResult || [],
    memos: memos.data?.list.currentPageResult || [],
    twoFAdata: twoFA,
    isAuthorizeInProgress:
      loginMutation.isPending || twoFARequest.isPending || twoFACode.isPending,
    isAuthorized,
    setProject: (project: IProject) => {
      setUser((prev) => ({
        ...prev,
        project,
        isCashier: getRole(me.data.project_permissions, project.id).isCashier,
      }));
    },
    login: (email: string, password: string) => {
      return loginMutation.mutateAsync([{ email, password, old_2fa: false }]);
    },
    signUp: (params: AuthTypes.SignUp.Body) =>
      signUpMutation.mutateAsync([params]),
    twoFA: (
      code: string,
      isNewMode = true,
      codeToken = twoFA.codeToken,
      method = twoFA.method,
    ) => {
      if (!codeToken) {
        throw new Error('Login failed - No code token');
      }
      return twoFACode.mutateAsync([
        { isNewMode },
        { code_token: codeToken, method, code },
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
    setPrimaryCurrency: (v: string) => {
      setUser((prev) => ({
        ...prev!,
        primaryCurrency: v,
      }));
    },
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
