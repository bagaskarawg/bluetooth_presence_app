import { Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

// Interface for our Bluetooth Service
export interface IBluetoothService {
    initialize(): Promise<void>;
    startAdvertising(name: string, serviceUUID: string): Promise<void>;
    stopAdvertising(): Promise<void>;
    startScanning(serviceUUID: string, onDeviceFound: (device: any) => void): Promise<void>;
    stopScanning(): Promise<void>;
}

// Mock Implementation for Simulator
class MockBluetoothService implements IBluetoothService {
    private isAdvertising = false;
    private isScanning = false;
    private intervalId: NodeJS.Timeout | null = null;

    async initialize(): Promise<void> {
        console.log('[MockBLE] Initialized');
    }

    async startAdvertising(name: string, serviceUUID: string): Promise<void> {
        this.isAdvertising = true;
        console.log(`[MockBLE] Advertising: ${name} with UUID: ${serviceUUID}`);
    }

    async stopAdvertising(): Promise<void> {
        this.isAdvertising = false;
        console.log('[MockBLE] Stopped Advertising');
    }

    async startScanning(serviceUUID: string, onDeviceFound: (device: any) => void): Promise<void> {
        this.isScanning = true;
        console.log(`[MockBLE] Scanning for UUID: ${serviceUUID}`);

        // Simulate finding a device after 2 seconds
        this.intervalId = setInterval(() => {
            if (this.isScanning) {
                const mockDevice = {
                    id: 'mock-device-id',
                    name: 'Kelas Mock',
                    serviceUUIDs: [serviceUUID],
                };
                onDeviceFound(mockDevice);
            }
        }, 2000);
    }

    async stopScanning(): Promise<void> {
        this.isScanning = false;
        if (this.intervalId) clearInterval(this.intervalId);
        console.log('[MockBLE] Stopped Scanning');
    }
}

// Real Implementation (Placeholder for now, will implement if on real device)
// Note: react-native-ble-plx setup is complex and might crash simulator.
// We will default to Mock for now to ensure stability during development.

export const BluetoothService = new MockBluetoothService();
