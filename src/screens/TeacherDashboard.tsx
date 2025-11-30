import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import { ClassSession } from '../types';
import { Plus, LogOut, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        if (user) {
            try {
                const data = await Api.getTeacherClasses();
                setClasses(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    const renderItem = ({ item }: { item: ClassSession }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.subjectName}>{item.name}</Text>
                {item.is_active && <View style={styles.activeBadge}><Text style={styles.activeText}>AKTIF</Text></View>}
            </View>
            <View style={styles.cardFooter}>
                <Calendar size={16} color="#666" />
                <Text style={styles.dateText}>{new Date(item.start_time).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Halo, {user?.name}</Text>
                    <Text style={styles.subGreeting}>Dosen</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <LogOut size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Daftar Kelas</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('CreateClass')}
                    >
                        <Plus size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Kelas Baru</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#2196F3" />
                ) : (
                    <FlatList
                        data={classes}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={styles.emptyText}>Belum ada kelas.</Text>}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    greeting: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    subGreeting: {
        fontSize: 14,
        color: '#666',
    },
    logoutButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    list: {
        gap: 16,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    activeBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    activeText: {
        color: '#2E7D32',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 40,
    },
});
