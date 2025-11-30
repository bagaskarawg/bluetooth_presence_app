import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BluetoothService } from '../services/BluetoothService';
import { Api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bluetooth, CheckCircle } from 'lucide-react-native';
import { PermissionsAndroid, Platform } from 'react-native';

const requestBLEPermissions = async () => {
    if (Platform.OS === 'android') {
        const apiLevel = Platform.Version;
        const permissions = [];

        // Android 12 (API 31) and higher
        if (apiLevel >= 31) {
            permissions.push(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
            );
        }
        // Android 6.0 (API 23) to Android 11 (API 30)
        else if (apiLevel >= 23) {
            // Location is required for scanning
            permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        }

        // Check if permissions are needed
        if (permissions.length === 0) {
            return true; // No runtime permission required (e.g., old Android)
        }

        const grantedStatus = await PermissionsAndroid.requestMultiple(permissions);

        // Check if ALL required permissions are granted
        const allGranted = Object.values(grantedStatus).every(
            (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );

        return allGranted;
    }

    // iOS permissions are handled differently (see below)
    return true;
};

export default function ScanClassScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [scanning, setScanning] = useState(true);
    const [devices, setDevices] = useState<any[]>([]);
    const [connectingId, setConnectingId] = useState<string | null>(null);
    const [classNames, setClassNames] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        startScan();
        return () => {
            BluetoothService.stopScanning();
        };
    }, []);

    const fetchClassInfo = async (classId: string) => {
        if (classNames[classId]) return; // Already fetched

        try {
            const classInfo = await Api.getClassSession(classId);
            setClassNames(prev => ({
                ...prev,
                [classId]: classInfo.name
            }));
        } catch (error) {
            console.warn(`Failed to fetch info for class ${classId}`, error);
        }
    };

    const startScan = async () => {
        const hasPermission = await requestBLEPermissions();
        if (hasPermission) {
            // Proceed with your BleManager.startDeviceScan()
            console.log("Permissions granted, starting scan...");
        } else {
            console.log("Permissions denied. Cannot start scan.");
            // Display a custom modal/alert here to explain why permission is needed
        }

        setDevices([]);
        setScanning(true);
        try {
            await BluetoothService.startScanning('0000180D-0000-1000-8000-00805F9B34FB', (device) => {
                setDevices((prev) => {
                    const exists = prev.find((d) => d.id === device.id);
                    if (exists) return prev;

                    // If we found a new device with a Class ID, fetch its name
                    if (device.classId) {
                        fetchClassInfo(device.classId.toString());
                    }

                    return [...prev, device];
                });
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal memulai pemindaian Bluetooth.');
        }
    };

    const handleConnect = async (device: any) => {
        // In a real app, we would connect to the GATT server and write the student ID.
        // For this mock/prototype, we assume the "device.name" matches the class subject 
        // and we just hit the API to "submit attendance" based on the found class.

        // Since we don't have the real Class ID from the advertisement in this mock (just name),
        // we will simulate finding the class by name or just use a mock ID.
        // For the sake of the flow, let's assume the device.id maps to a class session.

        setConnectingId(device.id);
        try {
            // Simulate connection delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real scenario, we'd get the Class ID from the peripheral.
            // Here we'll just pick the first active class from the mock data for demonstration
            // or use the device ID if we were fully implementing the mapping.
            // Let's just use a hardcoded valid class ID from our mock data for success case,
            // or better, let's fetch active classes and match the name.

            // Simplified: Just submit to a "current active class" logic
            // For this mock, we'll just say we connected to "cls_001" (or whatever is active).
            // But to make it dynamic, let's assume the teacher created a class and we are connecting to it.
            // We will use a specific mock ID for the "live" class created by the teacher in the other screen.
            // Since we can't easily share state between screens without a backend or global store for "active classes",
            // we will just simulate success.

            // Use the Class ID from the BLE advertisement
            if (!device.classId) {
                throw new Error('Tidak dapat menemukan ID Kelas dari sinyal Bluetooth.');
            }

            await Api.submitAttendance(device.classId.toString());

            Alert.alert('Berhasil', `Presensi untuk kelas ID ${device.classId} berhasil tercatat!`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Gagal', error.message || 'Gagal melakukan presensi. Coba lagi.');
        } finally {
            setConnectingId(null);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pindai Kelas</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.statusContainer}>
                {scanning ? (
                    <>
                        <ActivityIndicator size="large" color="#2196F3" />
                        <Text style={styles.statusText}>Mencari kelas di sekitar...</Text>
                    </>
                ) : (
                    <Text style={styles.statusText}>Pemindaian selesai.</Text>
                )}
            </View>

            <FlatList
                data={devices}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.deviceItem}
                        onPress={() => handleConnect(item)}
                        disabled={connectingId !== null}
                    >
                        <View style={styles.deviceIcon}>
                            <Bluetooth size={24} color="#2196F3" />
                        </View>
                        <View style={styles.deviceInfo}>
                            <Text style={styles.deviceName}>
                                {item.classId && classNames[item.classId]
                                    ? classNames[item.classId]
                                    : (item.name === 'Unknown Class' ? `Kelas #${item.classId || '?'}` : item.name)}
                            </Text>
                            <Text style={styles.deviceId}>ID: {item.classId || '?'} ({item.id})</Text>
                        </View>
                        {connectingId === item.id && <ActivityIndicator color="#2196F3" />}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Tidak ada kelas ditemukan.</Text>
                }
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
    statusContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    statusText: {
        color: '#666',
        fontSize: 14,
    },
    list: {
        padding: 20,
        gap: 12,
    },
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    deviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    deviceId: {
        fontSize: 12,
        color: '#999',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 40,
    },
});
