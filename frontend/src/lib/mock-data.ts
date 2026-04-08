// User (Super Admin)
export interface MockUser {
  id: string;
  username: string;
  passwordHash: string;
  role: 'super_admin';
}

export const MOCK_USER: MockUser = {
  id: 'super-admin-001',
  username: 'admin',
  passwordHash: '$2b$10$xVqYLGQKkL8ZqJ3Q5kHzKOqY3Q5kHzKOqY3Q5kHzKOqY3Q5kHzKOq',
  role: 'super_admin'
};

// School (Nhà trường)
export interface MockSchool {
  id: string;
  name: string;
  walletAddress: string;
  isActive: boolean;
}

export const MOCK_SCHOOLS: MockSchool[] = [
  { id: 'school-001', name: 'Đại học Bách Khoa', walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb1', isActive: true },
  { id: 'school-002', name: 'Đại học Kinh Tế', walletAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA7', isActive: true },
];

// Student (Sinh viên)
export interface MockStudent {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  walletAddress: string;
  studentCode: string;
  status: 'active' | 'inactive' | 'graduated';
}

export const MOCK_STUDENT: MockStudent = {
  id: 'student-001',
  schoolId: 'school-001',
  name: 'Nguyễn Văn A',
  email: 'a.nguyenvan@example.com',
  walletAddress: '0x1111111111111111111111111111111111111111',
  studentCode: 'SV001',
  status: 'active'
};

export const MOCK_STUDENTS: MockStudent[] = [
  { id: 'student-001', schoolId: 'school-001', name: 'Nguyễn Văn A', email: 'a.nguyenvan@example.com', walletAddress: '0x1111111111111111111111111111111111111111', studentCode: 'SV001', status: 'active' },
  { id: 'student-002', schoolId: 'school-001', name: 'Trần Thị B', email: 'b.tranthi@example.com', walletAddress: '0x2222222222222222222222222222222222222222', studentCode: 'SV002', status: 'active' },
  { id: 'student-003', schoolId: 'school-001', name: 'Lê Văn C', email: 'c.levan@example.com', walletAddress: '0x3333333333333333333333333333333333333333', studentCode: 'SV003', status: 'active' },
  { id: 'student-004', schoolId: 'school-002', name: 'Phạm Thị D', email: 'd.phamthi@example.com', walletAddress: '0x4444444444444444444444444444444444444444', studentCode: 'SV101', status: 'active' },
  { id: 'student-005', schoolId: 'school-002', name: 'Vũ Văn E', email: 'e.vuvan@example.com', walletAddress: '0x5555555555555555555555555555555555555555', studentCode: 'SV102', status: 'active' },
];

// Credential (Văn bằng - IMMUTABLE trên blockchain)
export interface MockCredential {
  id: string;
  studentId: string;
  schoolId: string;
  name: string;
  description: string;
  status: 'pending' | 'issued' | 'confirmed' | 'revoked' | 'expired';
  verifyCode: string;
  issuedAt: string;
  tokenId: string;
  txHash: string;
  ipfsHash: string;
  fileHash: string;
  student: {
    name: string;
    email: string;
  };
  classification?: string;
  major?: string;
  expiryDate?: string;
  issuerName?: string;
}

export const MOCK_CREDENTIALS: MockCredential[] = [
  { 
    id: 'cred-001', 
    studentId: 'student-001',
    schoolId: 'school-001',
    name: 'Cử nhân Công nghệ Thông tin', 
    description: 'Hoàn thành chương trình đào tạo Cử nhân Công nghệ Thông tin',
    status: 'confirmed', 
    verifyCode: 'CRED-20240115-ABC123', 
    tokenId: '1',
    txHash: '0xabc123def456789',
    issuedAt: '2024-01-15',
    ipfsHash: 'QmXyZ1234567890abcdef',
    fileHash: 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef12345678',
    student: { name: 'Nguyễn Văn A', email: 'a.nguyenvan@example.com' },
    classification: 'Giỏi',
    major: 'Công nghệ phần mềm',
    issuerName: 'Trường Đại học Bách Khoa'
  },
  { 
    id: 'cred-002', 
    studentId: 'student-001',
    schoolId: 'school-001',
    name: 'Chứng chỉ React Developer', 
    description: 'Hoàn thành khóa học React Developer với thời lượng 40 giờ',
    status: 'confirmed', 
    verifyCode: 'CRED-20240125-DEF456', 
    tokenId: '2',
    txHash: '0xdef456789abc123',
    issuedAt: '2024-01-25',
    ipfsHash: 'QmXyZ098cba',
    fileHash: '7654321fedb2c3d4e5f678901234567890abcdef1234567890abcdef1234567890',
    student: { name: 'Nguyễn Văn A', email: 'a.nguyenvan@example.com' },
    classification: 'Xuất sắc',
    major: 'Phát triển Web',
    issuerName: 'Trường Đại học Bách Khoa'
  },
  { 
    id: 'cred-003', 
    studentId: 'student-002',
    schoolId: 'school-001',
    name: 'Chứng chỉ Node.js Backend', 
    description: 'Hoàn thành khóa học Node.js Backend Development',
    status: 'issued', 
    verifyCode: 'CRED-20240201-GHI789', 
    tokenId: '3',
    txHash: '0x789abc123def456',
    issuedAt: '2024-02-01',
    ipfsHash: 'QmXyZ1111222233334444',
    fileHash: 'c3d4e5f678901234567890abcdef01234567890abcdef0123456789',
    student: { name: 'Trần Thị B', email: 'b.tranthi@example.com' },
    classification: 'Giỏi',
    major: 'Lập trình Backend',
    issuerName: 'Trường Đại học Bách Khoa',
    expiryDate: '2026-02-01'
  },
  { 
    id: 'cred-004', 
    studentId: 'student-003',
    schoolId: 'school-001',
    name: 'Chứng chỉ TypeScript', 
    description: 'Hoàn thành khóa học TypeScript Fundamentals',
    status: 'pending', 
    verifyCode: 'CRED-20240210-JKL012', 
    tokenId: '',
    txHash: '',
    issuedAt: '',
    ipfsHash: '',
    fileHash: '',
    student: { name: 'Lê Văn C', email: 'c.levan@example.com' },
    classification: 'Khá',
    major: 'Lập trình TypeScript',
    issuerName: 'Trường Đại học Bách Khoa'
  },
  { 
    id: 'cred-005', 
    studentId: 'student-004',
    schoolId: 'school-002',
    name: 'Chứng chỉ Blockchain Basics', 
    description: 'Hoàn thành khóa học Blockchain Basics',
    status: 'confirmed', 
    verifyCode: 'CRED-20240215-MNO456', 
    tokenId: '4',
    txHash: '0xaaa111bbb222ccc',
    issuedAt: '2024-02-15',
    ipfsHash: 'QmXyZ5555666677777888',
    fileHash: 'd4e5f678901234567890abcdef01234567890abcdef01234567890a',
    student: { name: 'Phạm Thị D', email: 'd.phamthi@example.com' },
    classification: 'Xuất sắc',
    major: 'Công nghệ Blockchain',
    issuerName: 'Trường Đại học Kinh Tế',
    expiryDate: '2027-02-15'
  },
  { 
    id: 'cred-006', 
    studentId: 'student-001',
    schoolId: 'school-001',
    name: 'Chứng chỉ Tiếng Anh B1', 
    description: 'Hoàn thành khóa đào tạo Tiếng Anh B1',
    status: 'expired', 
    verifyCode: 'CRED-20200115-EXP001', 
    tokenId: '5',
    txHash: '0xexpired001',
    issuedAt: '2020-01-15',
    ipfsHash: 'QmXyZ99990000001111',
    fileHash: 'e5f678901234567890abcdef01234567890abcdef012345678901',
    student: { name: 'Nguyễn Văn A', email: 'a.nguyenvan@example.com' },
    classification: 'Khá',
    major: 'Tiếng Anh',
    issuerName: 'Trường Đại học Bách Khoa',
    expiryDate: '2023-01-15'
  },
];

// Registration Request (Yêu cầu đăng ký)
export interface MockRegistrationRequest {
  id: string;
  walletAddress: string;
  type: 'school' | 'student';
  schoolName?: string;
  schoolDocument?: string;
  studentCode?: string;
  schoolId?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const MOCK_REGISTRATION_REQUESTS: MockRegistrationRequest[] = [
  { 
    id: 'req-001', 
    walletAddress: '0x9999999999999999999999999999999999999999', 
    type: 'school', 
    schoolName: 'Đại học FPT', 
    schoolDocument: 'QmDoc123456789',
    status: 'pending' 
  },
  { 
    id: 'req-002', 
    walletAddress: '0x8888888888888888888888888888888888888888', 
    type: 'student', 
    studentCode: 'SV201', 
    schoolId: 'school-001',
    status: 'pending' 
  },
];
