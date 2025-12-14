import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image, TextInput } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, RefreshCw, Check, QrCode } from 'lucide-react-native';
import { Api } from '../api/api';

export default function SelfieScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { classId } = route.params;

    const [facing, setFacing] = useState<CameraType>('front');
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [otp, setOtp] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>Kami membutuhkan izin kamera untuk mengambil foto selfie presensi.</Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                        <Text style={styles.permissionButtonText}>Izinkan Kamera</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const toggleCameraType = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.5,
                    base64: false,
                    exif: true,
                });
                setPhoto(photo);
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Gagal mengambil foto.');
            }
        }
    };

    const retakePicture = () => {
        setPhoto(null);
    };

    const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
        setOtp(data);
        setIsScanning(false);
        setFacing('front');
        Alert.alert('Sukses', 'Kode QR berhasil dipindai!');
    };

    const startScanning = () => {
        setIsScanning(true);
        setFacing('back');
    };

    const stopScanning = () => {
        setIsScanning(false);
        setFacing('front');
    };

    const submitAttendance = async () => {
        if (!photo) return;
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Mohon masukkan 6 digit kode OTP atau scan QR Code.');
            return;
        }

        try {
            setSubmitting(true);

            // Get Location
            let locationData = undefined;
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});

                // Anti-Spoofing Check
                if (location.mocked) {
                    Alert.alert(
                        'Lokasi Palsu Terdeteksi',
                        'Mohon matikan aplikasi Fake GPS atau Mock Location untuk melakukan presensi.'
                    );
                    setSubmitting(false);
                    return;
                }

                locationData = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                };
            } else {
                Alert.alert('Warning', 'Izin lokasi tidak diberikan. Lokasi tidak akan dicatat.');
            }

            await Api.submitAttendance(classId, photo, otp, locationData);
            Alert.alert('Sukses', 'Presensi berhasil dicatat!', [
                { text: 'OK', onPress: () => navigation.navigate('StudentDashboard') }
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Gagal', error.message || 'Gagal melakukan presensi.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} disabled={submitting}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ambil Selfie</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {photo ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.retakeButton} onPress={retakePicture} disabled={submitting}>
                                <RefreshCw size={24} color="#333" />
                                <Text style={styles.retakeText}>Ulangi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitButton} onPress={submitAttendance} disabled={submitting}>
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Check size={24} color="#fff" />
                                        <Text style={styles.submitText}>Kirim</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <CameraView
                            style={styles.camera}
                            facing={facing}
                            ref={cameraRef}
                            onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr"],
                            }}
                        >
                            <View style={styles.cameraControls}>
                                {!isScanning ? (
                                    <>
                                        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
                                            <RefreshCw size={24} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                                            <View style={styles.captureInner} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.flipButton} onPress={startScanning}>
                                            <QrCode size={24} color="#fff" />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <TouchableOpacity style={styles.cancelScanButton} onPress={stopScanning}>
                                        <Text style={styles.cancelScanText}>Batal Scan</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </CameraView>

                        {!isScanning && (
                            <View style={styles.otpInputContainer}>
                                <Text style={styles.otpInputLabel}>Kode OTP:</Text>
                                <TextInput
                                    style={styles.otpInput}
                                    value={otp}
                                    onChangeText={setOtp}
                                    placeholder="Masukkan 6 digit OTP"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    permissionText: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
    },
    permissionButton: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 40,
        paddingBottom: 60,
    },
    flipButton: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 25,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    previewContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    previewImage: {
        flex: 1,
        resizeMode: 'contain',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: '#fff',
    },
    retakeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 8,
    },
    retakeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2E7D32',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 8,
    },
    submitText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    otpInputContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    otpInputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    otpInput: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 12,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 2,
        textAlign: 'center',
    },
    cancelScanButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
    },
    cancelScanText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
