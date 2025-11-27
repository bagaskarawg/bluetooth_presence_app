import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GraduationCap, School } from 'lucide-react-native';

export default function LoginScreen() {
    const [role, setRole] = useState<Role>('STUDENT');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuth();

    const handleLogin = async () => {
        if (!id || !password) {
            Alert.alert('Error', 'Mohon isi semua kolom.');
            return;
        }

        try {
            await login(id, password, role);
        } catch (error: any) {
            console.error(error)
            Alert.alert('Login Gagal', error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Sistem Presensi</Text>
                <Text style={styles.subtitle}>Fakultas Teknik Universitas Suryakancana</Text>
            </View>

            <View style={styles.roleContainer}>
                <TouchableOpacity
                    style={[styles.roleButton, role === 'STUDENT' && styles.roleButtonActive]}
                    onPress={() => setRole('STUDENT')}
                >
                    <GraduationCap size={24} color={role === 'STUDENT' ? '#fff' : '#666'} />
                    <Text style={[styles.roleText, role === 'STUDENT' && styles.roleTextActive]}>Mahasiswa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.roleButton, role === 'TEACHER' && styles.roleButtonActive]}
                    onPress={() => setRole('TEACHER')}
                >
                    <School size={24} color={role === 'TEACHER' ? '#fff' : '#666'} />
                    <Text style={[styles.roleText, role === 'TEACHER' && styles.roleTextActive]}>Dosen</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>{role === 'STUDENT' ? 'NPM' : 'NIDN'}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={role === 'STUDENT' ? 'Masukkan NPM' : 'Masukkan NIDN'}
                    value={id}
                    onChangeText={setId}
                    autoCapitalize="none"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Kata Sandi</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Masukkan Kata Sandi"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Masuk</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    roleContainer: {
        flexDirection: 'row',
        marginBottom: 30,
        backgroundColor: '#e0e0e0',
        borderRadius: 12,
        padding: 4,
    },
    roleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    roleButtonActive: {
        backgroundColor: '#2196F3',
    },
    roleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    roleTextActive: {
        color: '#fff',
    },
    form: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2196F3',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
