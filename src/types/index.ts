export type Role = 'STUDENT' | 'TEACHER';

export interface User {
  id: string;
  name: string;
  role: Role;
  // For students, id is NPM. For teachers, id is NIDN.
}

export interface ClassSession {
  id: string;
  name: string;
  teacher_id: string;
  is_active: boolean;
  start_time: string;
  end_time?: string;
}

export interface AttendanceRecord {
  id: string;
  classSessionId: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  photo_url?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
