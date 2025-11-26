import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, Role } from '../types';
import { MockApi } from '../api/mockApi';

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
            const loggedInUser = await MockApi.login(id, password, role);
            setUser(loggedInUser);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
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
