import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ScanLine, LogOut, History } from 'lucide-react-native';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const navigation = useNavigation<any>();
    const [history, setHistory] = React.useState<any[]>([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const { Api } = require('../api/api'); // Import Api here to avoid circular dependency issues if any, or just standard import

    React.useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await Api.getStudentAttendance();
            setHistory(data);
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadHistory();
    };

    const renderHeader = () => (
        <View>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Presensi Kelas</Text>
                <Text style={styles.cardDescription}>
                    Pindai kelas yang sedang berlangsung di sekitarmu untuk melakukan presensi.
                </Text>
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => navigation.navigate('ScanClass')}
                >
                    <ScanLine size={24} color="#fff" />
                    <Text style={styles.scanButtonText}>Pindai Kelas</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
                <History size={20} color="#333" />
                <Text style={styles.sectionTitle}>Riwayat Presensi</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Halo, {user?.name}</Text>
                    <Text style={styles.subGreeting}>Mahasiswa</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <LogOut size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <FlatList
                style={styles.content}
                data={history}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.historyItem}>
                        <View>
                            <Text style={styles.historySubject}>{item.class_name}</Text>
                            <Text style={styles.historyDate}>
                                {new Date(item.timestamp).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </View>
                        <View style={styles.historyBadge}>
                            <Text style={styles.historyBadgeText}>HADIR</Text>
                        </View>
                    </View>
                )}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <View style={styles.emptyHistory}>
                        <Text style={styles.emptyText}>Belum ada riwayat presensi.</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={{ paddingBottom: 20 }}
            />
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 30,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    cardDescription: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 24,
        lineHeight: 20,
    },
    scanButton: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
    },
    scanButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    historySection: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    emptyHistory: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    emptyText: {
        color: '#999',
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    historySubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    historyDate: {
        fontSize: 12,
        color: '#666',
    },
    historyBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    historyBadgeText: {
        color: '#2E7D32',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
