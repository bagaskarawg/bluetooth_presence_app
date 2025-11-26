import { User, ClassSession, AttendanceRecord, Role } from '../types';

// Mock Data
const USERS: User[] = [
    { id: '12345678', name: 'Budi Santoso', role: 'STUDENT' }, // NPM
    { id: '87654321', name: 'Siti Aminah', role: 'STUDENT' }, // NPM
    { id: '11223344', name: 'Dr. Eko Prasetyo', role: 'TEACHER' }, // NIDN
    { id: '55667788', name: 'Prof. Rina Wati', role: 'TEACHER' }, // NIDN
];

const CLASSES: ClassSession[] = [
    { id: 'cls_001', subjectName: 'Pemrograman Mobile', teacherId: '11223344', isActive: false, startTime: '2023-10-27T08:00:00Z' },
    { id: 'cls_002', subjectName: 'Algoritma dan Struktur Data', teacherId: '55667788', isActive: false, startTime: '2023-10-28T10:00:00Z' },
];

const ATTENDANCE: AttendanceRecord[] = [];

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const MockApi = {
    login: async (id: string, password: string, role: Role): Promise<User> => {
        await delay(1000);
        // Password check ignored for mock
        const user = USERS.find((u) => u.id === id && u.role === role);
        if (!user) {
            throw new Error('ID atau Password salah.');
        }
        return user;
    },

    // Teacher Methods
    getTeacherClasses: async (teacherId: string): Promise<ClassSession[]> => {
        await delay(500);
        return CLASSES.filter((c) => c.teacherId === teacherId);
    },

    createClassSession: async (teacherId: string, subjectName: string): Promise<ClassSession> => {
        await delay(800);
        const newClass: ClassSession = {
            id: `cls_${Date.now()}`,
            subjectName,
            teacherId,
            isActive: true,
            startTime: new Date().toISOString(),
        };
        CLASSES.push(newClass);
        return newClass;
    },

    endClassSession: async (classId: string): Promise<void> => {
        await delay(500);
        const classIndex = CLASSES.findIndex((c) => c.id === classId);
        if (classIndex !== -1) {
            CLASSES[classIndex].isActive = false;
            CLASSES[classIndex].endTime = new Date().toISOString();
        }
    },

    getLiveAttendance: async (classId: string): Promise<AttendanceRecord[]> => {
        await delay(300);
        return ATTENDANCE.filter((a) => a.classSessionId === classId);
    },

    // Student Methods
    submitAttendance: async (studentId: string, classId: string): Promise<AttendanceRecord> => {
        await delay(800);
        const student = USERS.find((u) => u.id === studentId);
        if (!student) throw new Error('Siswa tidak ditemukan');

        const existing = ATTENDANCE.find((a) => a.classSessionId === classId && a.studentId === studentId);
        if (existing) return existing;

        const newRecord: AttendanceRecord = {
            id: `att_${Date.now()}`,
            classSessionId: classId,
            studentId,
            studentName: student.name,
            timestamp: new Date().toISOString(),
        };
        ATTENDANCE.push(newRecord);
        return newRecord;
    },
};
