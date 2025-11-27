import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, Role } from '../types';
import { Api, setAuthToken } from '../api/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (id: string, password: string, role: Role) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (id: string, password: string, role: Role) => {
        setIsLoading(true);
        try {
            console.log('logging in')
            const { user: loggedInUser, token } = await Api.login(id, password, role);
            setAuthToken(token);
            setUser(loggedInUser);
        } catch (error) {
            console.error('err', error)
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
