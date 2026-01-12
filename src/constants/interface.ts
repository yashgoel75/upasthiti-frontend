export interface Admin {
  _id: string;
  adminId: string;
  name: string;
  profilePicture?: string;
  officialEmail: string;
  phoneNumber: number;
  uid: string;
  schoolId: string;
  school: {
    name: string;
  };
}

export interface Faculty {
  _id: string;
  name: string;
  officialEmail: string;
  phone: string;
  departmentId: string;
  subjects: string;
  timetable: string;
  type: string;
  uid: string;
  facultyId: string;
  schoolId: string;
  profilePicture: string;
}

export interface Student {
  _id: string;
  profilePicture: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  batchEnd: string;
  enrollmentNo: string;
  schoolId: string;
  uid: string;
  classId: string;
}