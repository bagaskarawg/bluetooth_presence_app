export type Role = 'STUDENT' | 'TEACHER';

export interface User {
  id: string;
  name: string;
  role: Role;
  // For students, id is NPM. For teachers, id is NIDN.
}

export interface ClassSession {
  id: string;
  subjectName: string;
  teacherId: string;
  isActive: boolean;
  startTime: string;
  endTime?: string;
}

export interface AttendanceRecord {
  id: string;
  classSessionId: string;
  studentId: string;
  studentName: string;
  timestamp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
