/**
 * UserDataContext.tsx
 * 
 * provides a way to access user profile and organization data
 * throughout the application. It fetches profile information
 * and organization users, making it available to all child components through React Context.
 * 
 * Usage:
 * 1. Wrap your application or a part of it with the UserDataProvider
 * 2. Use the useUserData hook in any component to access the data:
 *    const { userProfile, organizationUsers, isLoading } = useUserData();
 */


import { fetchOrganizationUsers, OrganizationUser } from '@/utils/getOrganisationUsers';
import { fetchUserProfile, UserProfile } from '@/utils/getProfile';
import React, { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuthUser } from "react-auth-kit";


interface UserDataContextType {
  userProfile: UserProfile | null;
  organizationUsers: OrganizationUser[];
  isLoading: boolean;
}

// Create the context with default values
export const UserDataContext = createContext<UserDataContextType>({
  userProfile: null,
  organizationUsers: [],
  isLoading: true,
});


// Provider component
export const UserDataProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const isAuthenticated = auth?.token !== undefined;
  const tokenRef = useRef(auth?.token || "default");
  
  // State for user data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data (profile and organization users)
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch both profile and organization users in parallel
        const [profileData, orgUsers] = await Promise.all([
          fetchUserProfile(tokenRef.current),
          fetchOrganizationUsers(tokenRef.current, false)
        ]);
        
        setUserProfile(profileData);
        setOrganizationUsers(orgUsers);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  // Create the context value
  const contextValue = {
    userProfile,
    organizationUsers,
    isLoading,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

// Custom hook for using this context
export const useUserData = () => {
  const context = React.useContext(UserDataContext);
  
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  
  return context;
};