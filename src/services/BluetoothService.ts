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
        BLEAdvertiser.setCompanyId(0x00E0); // Google Company ID as example
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

    async startAdvertising(name: string, serviceUUID: string): Promise<void> {
        console.log(`[BLE] Starting Advertising: ${name} (${serviceUUID})`);
        try {
            await BLEAdvertiser.broadcast(serviceUUID, [12, 34, 56], {
                advertiseMode: BLEAdvertiser.ADVERTISE_MODE_BALANCED,
                txPowerLevel: BLEAdvertiser.ADVERTISE_TX_POWER_MEDIUM,
                connectable: false, // Beacon mode usually not connectable for simple presence
                includeDeviceName: true,
                includeTxPowerLevel: true,
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

        this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error('[BLE] Scan Error:', error);
                this.isScanning = false;
                return;
            }

            if (device) {
                // Check if device matches our criteria
                // Note: device.serviceUUIDs might be null on some platforms/devices until connected
                // So we might rely on name or just list all and let UI filter.
                // For now, pass everything and let UI filter or check name/UUID if available.

                // Simplified filter: if it has a name, pass it.
                if (device.name) {
                    onDeviceFound({
                        id: device.id,
                        name: device.name,
                        rssi: device.rssi,
                        serviceUUIDs: device.serviceUUIDs
                    });
                }
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
