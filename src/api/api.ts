import { User, ClassSession, AttendanceRecord, Role } from '../types';

const BASE_URL = 'https://bpb.on-forge.com/api';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const getHeaders = () => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const Api = {
  login: async (nidn_npm: string, password: string, role: Role): Promise<{ user: User; token: string }> => {
    const response1 = await fetch(`https://jsonplaceholder.typicode.com/todos/1`, {
      method: 'GET', // Change method to GET for the test API
      headers: { 'Accept': 'application/json' },
    });

    console.log(response1.json()); // CHECK THIS LINE!

    console.log('base', BASE_URL, getHeaders())
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nidn_npm, password, role: role.toLowerCase() }),
    });

    console.log(response);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  },

  // Teacher Methods
  getTeacherClasses: async (): Promise<ClassSession[]> => {
    const response = await fetch(`${BASE_URL}/teacher/classes`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch classes');
    return response.json();
  },

  createClassSession: async (name: string): Promise<ClassSession> => {
    const response = await fetch(`${BASE_URL}/classes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) throw new Error('Failed to create class');
    return response.json();
  },

  getClassSession: async (id: string): Promise<ClassSession> => {
    const response = await fetch(`${BASE_URL}/classes/${id}`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch class details');
    return response.json();
  },

  endClassSession: async (id: string): Promise<ClassSession> => {
    const response = await fetch(`${BASE_URL}/classes/${id}/end`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to end class');
    return response.json();
  },

  getLiveAttendance: async (classId: string): Promise<AttendanceRecord[]> => {
    const response = await fetch(`${BASE_URL}/classes/${classId}/attendance`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      // Fallback or empty if endpoint doesn't exist yet, but ideally it should.
      // For now, return empty array if 404 to prevent crash, or throw if we want to be strict.
      // Let's assume the backend has this endpoint.
      console.warn('Failed to fetch live attendance');
      return [];
    }
    return response.json();
  },

  // Student Methods
  submitAttendance: async (classId: string, photo: any): Promise<AttendanceRecord> => {
    const formData = new FormData();
    formData.append('class_id', classId);

    if (photo) {
      // @ts-ignore
      formData.append('photo', {
        uri: photo.uri,
        name: 'selfie.jpg',
        type: 'image/jpeg',
      });
    }

    const headers = getHeaders();
    delete headers['Content-Type']; // Let fetch set the correct content type for FormData

    const response = await fetch(`${BASE_URL}/attendance`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit attendance');
    }
    return response.json();
  },

  getStudentAttendance: async (): Promise<any[]> => {
    const response = await fetch(`${BASE_URL}/attendance`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch attendance history');
    return response.json();
  },
};
