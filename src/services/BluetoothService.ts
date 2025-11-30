import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import BLEAdvertiser from 'react-native-ble-advertiser';

// Interface for our Bluetooth Service
export interface IBluetoothService {
    initialize(): Promise<void>;
    startAdvertising(name: string, serviceUUID: string): Promise<void>;
    stopAdvertising(): Promise<void>;
    startScanning(serviceUUID: string, onDeviceFound: (device: any) => void): Promise<void>;
    stopScanning(): Promise<void>;
}

class RealBluetoothService implements IBluetoothService {
    private manager: BleManager;
    private isScanning = false;

    constructor() {
        this.manager = new BleManager();
    }

    async initialize(): Promise<void> {
        if (Platform.OS === 'android') {
            await this.requestAndroidPermissions();
        }

        BLEAdvertiser.setCompanyId(0xFFFF);
    }

    private async requestAndroidPermissions() {
        if (Platform.Version >= 31) {
            const result = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            ]);

            if (
                result['android.permission.BLUETOOTH_SCAN'] !== PermissionsAndroid.RESULTS.GRANTED ||
                result['android.permission.BLUETOOTH_CONNECT'] !== PermissionsAndroid.RESULTS.GRANTED ||
                result['android.permission.BLUETOOTH_ADVERTISE'] !== PermissionsAndroid.RESULTS.GRANTED
            ) {
                Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan izin Bluetooth untuk berjalan.');
            }
        } else {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan izin Lokasi untuk memindai Bluetooth.');
            }
        }
    }

    async startAdvertising(name: string, serviceUUID: string, classId: number): Promise<void> {
        console.log(`[BLE] Starting Advertising: ${name} (${serviceUUID}) ID: ${classId}`);
        try {
            // Convert classId to byte array (assuming it fits in 4 bytes)
            const manufacturerData = [
                (classId >> 24) & 0xFF,
                (classId >> 16) & 0xFF,
                (classId >> 8) & 0xFF,
                classId & 0xFF
            ];

            await BLEAdvertiser.broadcast(serviceUUID, manufacturerData, {
                advertiseMode: BLEAdvertiser.ADVERTISE_MODE_BALANCED,
                txPowerLevel: BLEAdvertiser.ADVERTISE_TX_POWER_MEDIUM,
                connectable: false,
                includeDeviceName: false,
                includeTxPowerLevel: false,
            });
            console.log('[BLE] Advertising Started');
        } catch (error) {
            console.error('[BLE] Advertising Error:', error);
            throw error;
        }
    }

    async stopAdvertising(): Promise<void> {
        console.log('[BLE] Stopping Advertising');
        try {
            await BLEAdvertiser.stopBroadcast();
            console.log('[BLE] Advertising Stopped');
        } catch (error) {
            console.error('[BLE] Stop Advertising Error:', error);
        }
    }

    async startScanning(serviceUUID: string, onDeviceFound: (device: any) => void): Promise<void> {
        if (this.isScanning) return;
        this.isScanning = true;
        console.log(`[BLE] Starting Scanning for UUID: ${serviceUUID}`);

        this.manager.startDeviceScan([serviceUUID], null, (error, device) => {
            if (error) {
                console.error('[BLE] Scan Error:', error);
                this.isScanning = false;
                return;
            }

            if (device) {
                // Decode Class ID from Manufacturer Data
                let classId = null;
                if (device.manufacturerData) {
                    try {
                        // manufacturerData is Base64 encoded string
                        const binaryString = atob(device.manufacturerData);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }

                        // We expect at least 4 bytes for our ID if we sent 4
                        // Note: Manufacturer data often has a 2-byte company ID prefix.
                        // react-native-ble-advertiser might handle this differently.
                        // Let's assume the payload we sent is what we get, potentially prefixed.
                        // For simplicity, let's try to read the last 4 bytes or just the bytes we sent.

                        // If we sent [0, 0, 0, 15], we should find it.
                        // Let's just take the last 4 bytes as the integer.
                        if (bytes.length >= 4) {
                            const view = new DataView(bytes.buffer);
                            // Read last 4 bytes
                            const offset = bytes.length - 4;
                            classId = (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
                        }
                    } catch (e) {
                        console.warn('Failed to decode manufacturer data', e);
                    }
                }

                // Pass all devices found with the matching Service UUID
                onDeviceFound({
                    id: device.id,
                    name: device.name || device.localName || 'Unknown Class',
                    rssi: device.rssi,
                    serviceUUIDs: device.serviceUUIDs,
                    classId: classId // Pass the decoded Class ID
                });
            }
        });
    }

    async stopScanning(): Promise<void> {
        if (!this.isScanning) return;
        this.manager.stopDeviceScan();
        this.isScanning = false;
        console.log('[BLE] Scanning Stopped');
    }
}

export const BluetoothService = new RealBluetoothService();
