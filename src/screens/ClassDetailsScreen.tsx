import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Api } from '../api/api';
import { ClassSession, AttendanceRecord } from '../types';
import { ArrowLeft, Users, Calendar, Clock, StopCircle } from 'lucide-react-native';
import ImageViewerModal from '../components/ImageViewerModal';
import { BluetoothService } from '../services/BluetoothService';

export default function ClassDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { classId } = route.params;

    const [classSession, setClassSession] = useState<ClassSession | null>(null);
    const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [endingClass, setEndingClass] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [classId]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (!classSession?.is_active) {
                BluetoothService.stopAdvertising();
                return;
            }

            e.preventDefault();

            Alert.alert(
                'Keluar Halaman',
                'Kelas masih aktif. Keluar dari halaman ini akan menghentikan pemancaran Bluetooth. Apakah Anda yakin?',
                [
                    { text: 'Batal', style: 'cancel', onPress: () => { } },
                    {
                        text: 'Ya, Keluar',
                        style: 'destructive',
                        onPress: async () => {
                            await BluetoothService.stopAdvertising();
                            navigation.dispatch(e.data.action);
                        }
                    }
                ]
            );
        });

        return unsubscribe;
    }, [navigation, classSession]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [sessionData, attendanceData] = await Promise.all([
                Api.getClassSession(classId),
                Api.getLiveAttendance(classId)
            ]);
            setClassSession(sessionData);
            setAttendanceList(attendanceData);

            if (sessionData.is_active) {
                await BluetoothService.startAdvertising(
                    sessionData.name,
                    '0000180D-0000-1000-8000-00805F9B34FB',
                    parseInt(sessionData.id)
                );
            } else {
                await BluetoothService.stopAdvertising();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal memuat detail kelas.');
        } finally {
            setLoading(false);
        }
    };

    const handleEndClass = async () => {
        Alert.alert(
            'Akhiri Kelas',
            'Apakah Anda yakin ingin mengakhiri sesi kelas ini? Mahasiswa tidak akan bisa absen lagi.',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Akhiri',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setEndingClass(true);
                            await Api.endClassSession(classId);
                            Alert.alert('Sukses', 'Kelas berhasil diakhiri.');
                            loadData(); // Reload to update status
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'Gagal mengakhiri kelas.');
                        } finally {
                            setEndingClass(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </SafeAreaView>
        );
    }

    if (!classSession) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Data kelas tidak ditemukan.</Text>
            </SafeAreaView>
        );
    }



    // ... existing code ...

    return (
        <SafeAreaView style={styles.container}>
            <ImageViewerModal
                visible={!!selectedImage}
                imageUrl={selectedImage}
                onClose={() => setSelectedImage(null)}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Kelas</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {/* ... existing card code ... */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.subjectName}>{classSession.name}</Text>
                        {classSession.is_active ? (
                            <View style={styles.activeBadge}>
                                <Text style={styles.activeText}>AKTIF</Text>
                            </View>
                        ) : (
                            <View style={styles.inactiveBadge}>
                                <Text style={styles.inactiveText}>SELESAI</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.infoRow}>
                        <Calendar size={16} color="#666" />
                        <Text style={styles.infoText}>
                            {new Date(classSession.start_time).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Clock size={16} color="#666" />
                        <Text style={styles.infoText}>
                            {new Date(classSession.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            {classSession.end_time ? ` - ${new Date(classSession.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : ' - Sekarang'}
                        </Text>
                    </View>

                    {classSession.is_active && (
                        <TouchableOpacity
                            style={styles.endButton}
                            onPress={handleEndClass}
                            disabled={endingClass}
                        >
                            {endingClass ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <StopCircle size={20} color="#fff" />
                                    <Text style={styles.endButtonText}>Akhiri Kelas</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.attendanceSection}>
                    <View style={styles.sectionHeader}>
                        <Users size={20} color="#333" />
                        <Text style={styles.sectionTitle}>Daftar Hadir ({attendanceList.length})</Text>
                    </View>

                    <FlatList
                        data={attendanceList}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.attendanceItem}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    {item.photo_url ? (
                                        <TouchableOpacity onPress={() => setSelectedImage(item.photo_url || null)}>
                                            <Image
                                                source={{ uri: item.photo_url }}
                                                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee' }}
                                            />
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
                                            <Users size={20} color="#999" />
                                        </View>
                                    )}
                                    <View>
                                        <Text style={styles.studentName}>{item.studentName}</Text>
                                        <Text style={styles.studentId}>{item.studentId}</Text>
                                    </View>
                                </View>
                                <Text style={styles.timestamp}>
                                    {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyList}>
                                <Text style={styles.emptyText}>Belum ada mahasiswa yang absen.</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    subjectName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    activeBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    activeText: {
        color: '#2E7D32',
        fontSize: 12,
        fontWeight: 'bold',
    },
    inactiveBadge: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    inactiveText: {
        color: '#C62828',
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
    },
    endButton: {
        backgroundColor: '#FF3B30',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
        gap: 8,
    },
    endButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    attendanceSection: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    attendanceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    studentName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    studentId: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
    },
    emptyList: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
    },
});
