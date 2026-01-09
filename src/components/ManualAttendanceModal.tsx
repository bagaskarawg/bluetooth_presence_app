import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, FlatList, TextInput, Alert } from 'react-native';
import { X, Search, UserPlus } from 'lucide-react-native';
import { Api } from '../api/api';
import { Student } from '../types';

interface ManualAttendanceModalProps {
    visible: boolean;
    onClose: () => void;
    classId: string;
    onSuccess: () => void;
}

export default function ManualAttendanceModal({ visible, onClose, classId, onSuccess }: ManualAttendanceModalProps) {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

    useEffect(() => {
        if (visible) {
            loadStudents();
        }
    }, [visible]);

    useEffect(() => {
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            const filtered = students.filter(s =>
                s.name.toLowerCase().includes(lower) ||
                s.nidn_npm.includes(lower)
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    }, [searchQuery, students]);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const data = await Api.getStudents();
            setStudents(data);
            setFilteredStudents(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal memuat daftar mahasiswa.');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async (student: Student) => {
        Alert.alert(
            'Konfirmasi Presensi Manual',
            `Catat kehadiran untuk ${student.name}? Bobot kehadiran adalah 50%.`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Catat Hadir',
                    onPress: async () => {
                        try {
                            setSubmitting(true);
                            await Api.submitManualAttendance(classId, student.id, 0.5);
                            Alert.alert('Sukses', 'Presensi manual berhasil dicatat.');
                            onSuccess();
                            onClose();
                        } catch (error: any) {
                            console.error(error);
                            Alert.alert('Gagal', error.message || 'Gagal mencatat presensi.');
                        } finally {
                            setSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Presensi Manual</Text>
                        <TouchableOpacity onPress={onClose} disabled={submitting}>
                            <X size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Search size={20} color="#666" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Cari Nama atau NPM..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#2196F3" />
                        </View>
                    ) : (
                        <FlatList
                            data={filteredStudents}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.studentItem}
                                    onPress={() => handleManualSubmit(item)}
                                    disabled={submitting}
                                >
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.studentName}>{item.name}</Text>
                                        <Text style={styles.studentId}>{item.nidn_npm}</Text>
                                    </View>
                                    <UserPlus size={20} color="#2196F3" />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={styles.centerContainer}>
                                    <Text style={styles.emptyText}>Tidak ada mahasiswa ditemukan.</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 20,
        height: 48,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    studentId: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },
});
