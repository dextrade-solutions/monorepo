import { useLocalStorage } from '@uidotdev/usehooks';
import React, { createContext, useEffect } from 'react';

import { useQuery } from '../hooks/use-query';
import { Projects } from '../services';
import { IProject } from '../types';

interface User {
  project: IProject;
  // ... any other user properties
}

interface UserContextType {
  user?: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: true, // Initially loading
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>('user-data', null);

  const projects = useQuery(Projects.my);

  const allProjects = projects.data?.list.currentPageResult || [];

  useEffect(() => {
    if (!user?.project && allProjects.length > 0) {
      const [project] = allProjects;
      setUser({
        project,
      });
    }
  }, [user, allProjects]);

  const contextValue = { user, setUser: () => {debugger;}, isLoading: projects.isLoading };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
