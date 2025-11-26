import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BluetoothService } from '../services/BluetoothService';
import { MockApi } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Users, StopCircle } from 'lucide-react-native';
import { AttendanceRecord } from '../types';

export default function CreateClassScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [subjectName, setSubjectName] = useState('');
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [classId, setClassId] = useState<string | null>(null);
    const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

    // Polling for attendance updates (simulating real-time)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSessionActive && classId) {
            interval = setInterval(async () => {
                const data = await MockApi.getLiveAttendance(classId);
                setAttendanceList(data);
            }, 2000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isSessionActive, classId]);

    const startSession = async () => {
        if (!subjectName) {
            Alert.alert('Error', 'Mohon masukkan nama mata kuliah.');
            return;
        }

        try {
            // 1. Create Class in Backend
            const newClass = await MockApi.createClassSession(user!.id, subjectName);
            setClassId(newClass.id);
            setIsSessionActive(true);

            // 2. Start Advertising via Bluetooth
            // We use the Class ID as the unique identifier in the advertisement data or name
            await BluetoothService.startAdvertising(subjectName, '0000180D-0000-1000-8000-00805F9B34FB'); // Using Heart Rate UUID as example/placeholder
        } catch (error) {
            Alert.alert('Error', 'Gagal memulai sesi kelas.');
            console.error(error);
        }
    };

    const stopSession = async () => {
        try {
            if (classId) {
                await MockApi.endClassSession(classId);
            }
            await BluetoothService.stopAdvertising();
            setIsSessionActive(false);
            Alert.alert('Selesai', 'Sesi kelas telah diakhiri.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSessionActive}>
                    <ArrowLeft size={24} color={isSessionActive ? '#ccc' : '#333'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kelas Baru</Text>
                <View style={{ width: 24 }} />
            </View>

            {!isSessionActive ? (
                <View style={styles.form}>
                    <Text style={styles.label}>Nama Mata Kuliah</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Contoh: Pemrograman Mobile"
                        value={subjectName}
                        onChangeText={setSubjectName}
                    />
                    <TouchableOpacity style={styles.startButton} onPress={startSession}>
                        <Text style={styles.startButtonText}>Buka Kelas (Start Bluetooth)</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.activeSession}>
                    <View style={styles.statusCard}>
                        <Text style={styles.statusTitle}>Kelas Sedang Berlangsung</Text>
                        <Text style={styles.statusSubject}>{subjectName}</Text>
                        <Text style={styles.statusInfo}>Bluetooth Aktif - Menunggu Mahasiswa...</Text>
                    </View>

                    <View style={styles.attendanceListContainer}>
                        <View style={styles.listHeader}>
                            <Users size={20} color="#333" />
                            <Text style={styles.listTitle}>Mahasiswa Hadir ({attendanceList.length})</Text>
                        </View>

                        <FlatList
                            data={attendanceList}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.attendanceItem}>
                                    <Text style={styles.studentName}>{item.studentName}</Text>
                                    <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
                                </View>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyText}>Belum ada mahasiswa yang absen.</Text>}
                        />
                    </View>

                    <TouchableOpacity style={styles.stopButton} onPress={stopSession}>
                        <StopCircle size={24} color="#fff" />
                        <Text style={styles.stopButtonText}>Akhiri Kelas</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    form: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    startButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    activeSession: {
        flex: 1,
        padding: 20,
    },
    statusCard: {
        backgroundColor: '#E3F2FD',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#90CAF9',
    },
    statusTitle: {
        fontSize: 14,
        color: '#1976D2',
        marginBottom: 4,
    },
    statusSubject: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0D47A1',
        marginBottom: 8,
    },
    statusInfo: {
        fontSize: 12,
        color: '#546E7A',
        fontStyle: 'italic',
    },
    attendanceListContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    listTitle: {
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
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
    },
    stopButton: {
        backgroundColor: '#FF3B30',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        gap: 8,
    },
    stopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
