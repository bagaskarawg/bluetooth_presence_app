import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Role } from '../types';
import { Api, setAuthToken } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    user: User | null;
    login: (nidn_npm: string, password: string, role: Role) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStorage = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('authToken');
                const storedUser = await AsyncStorage.getItem('user');

                if (storedToken && storedUser) {
                    setAuthToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error('Failed to load auth storage', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStorage();
    }, []);

    const login = async (nidn_npm: string, password: string, role: Role) => {
        setIsLoading(true);
        try {
            const { user, token } = await Api.login(nidn_npm, password, role);
            setAuthToken(token);
            setUser(user);
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setUser(null);
        setAuthToken(null);
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
