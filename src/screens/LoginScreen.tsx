import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { GraduationCap, School, User, Lock } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export const LoginScreen = () => {
    const [role, setRole] = useState<Role>('STUDENT');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuth();

    const handleLogin = async () => {
        if (!id || !password) {
            Alert.alert('Error', 'Mohon isi semua kolom');
            return;
        }

        try {
            await login(id, password, role);
        } catch (error: any) {
            Alert.alert('Login Gagal', error.message);
        }
    };

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContainer}
            enableOnAndroid={true}
            extraScrollHeight={20}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <School color="#4F46E5" size={64} />
                </View>
                <Text style={styles.title}>Sistem Presensi</Text>
                <Text style={styles.subtitle}>Fakultas Teknik Universitas Suryakancana</Text>
            </View>

            <View style={styles.roleContainer}>
                <TouchableOpacity
                    style={[styles.roleButton, role === 'STUDENT' && styles.roleButtonActive]}
                    onPress={() => setRole('STUDENT')}
                >
                    <GraduationCap color={role === 'STUDENT' ? '#fff' : '#4B5563'} size={24} />
                    <Text style={[styles.roleText, role === 'STUDENT' && styles.roleTextActive]}>Mahasiswa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.roleButton, role === 'TEACHER' && styles.roleButtonActive]}
                    onPress={() => setRole('TEACHER')}
                >
                    <User color={role === 'TEACHER' ? '#fff' : '#4B5563'} size={24} />
                    <Text style={[styles.roleText, role === 'TEACHER' && styles.roleTextActive]}>Dosen</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <User color="#9CA3AF" size={20} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder={role === 'STUDENT' ? 'NPM' : 'NIDN'}
                        value={id}
                        onChangeText={setId}
                        autoCapitalize="none"
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Lock color="#9CA3AF" size={20} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Kata Sandi"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}>Masuk</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 80,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        backgroundColor: '#E0E7FF',
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    roleContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 4,
        borderRadius: 12,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    roleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    roleButtonActive: {
        backgroundColor: '#4F46E5',
    },
    roleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    roleTextActive: {
        color: '#fff',
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1F2937',
    },
    loginButton: {
        backgroundColor: '#4F46E5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonDisabled: {
        backgroundColor: '#A5B4FC',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
