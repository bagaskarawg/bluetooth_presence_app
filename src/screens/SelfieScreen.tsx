import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, RefreshCw, Check } from 'lucide-react-native';
import { Api } from '../api/api';

export default function SelfieScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { classId } = route.params;

    const [facing, setFacing] = useState<CameraType>('front');
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
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

    const submitAttendance = async () => {
        if (!photo) return;

        try {
            setSubmitting(true);
            await Api.submitAttendance(classId, photo);
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
                    <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                        <View style={styles.cameraControls}>
                            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
                                <RefreshCw size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                                <View style={styles.captureInner} />
                            </TouchableOpacity>
                            <View style={{ width: 40 }} />
                        </View>
                    </CameraView>
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
});
