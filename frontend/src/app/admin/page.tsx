'use client';

import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Building2, User, CheckCircle, XCircle, Trash2, Eye, FileCheck, Pencil, ExternalLink, Bell } from 'lucide-react';
import { connectSocket, disconnectSocket, joinAdminRoom, onCredentialIssued, onCredentialStatusChanged, onTxConfirmed, onRegistrationUpdate, CredentialIssuedEvent, CredentialStatusChangedEvent, TxConfirmedEvent, RegistrationEvent } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface RegistrationRequest {
  id: string;
  type: 'school' | 'student';
  name: string;
  email: string;
  walletAddress: string;
  schoolName?: string;
  studentCode?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface School {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  isActive: boolean;
  createdAt: string;
}

interface Credential {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'issued' | 'confirmed' | 'revoked';
  verifyCode: string;
  issuedAt: string;
  student: {
    name: string;
    studentCode: string;
  };
  classification?: string;
  major?: string;
  issuerName?: string;
  expiryDate?: string;
  txHash?: string;
  tokenId?: string;
  ipfsHash?: string;
}

export default function AdminPage() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  
  // School edit modal
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updatingSchool, setUpdatingSchool] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  }, []);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const role = params.get('role');

  if (token) {
    localStorage.setItem('token', token);
    if (role) localStorage.setItem('userType', role);
    window.history.replaceState({}, '', '/admin');
    return;
  }

  const existed = localStorage.getItem('token');
  if (!existed) {
    window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL || 'https://sbt-credential-student.vercel.app';
  }
}, []);

  useEffect(() => {
    connectSocket();
    joinAdminRoom();

    const cleanups: Array<() => void> = [];

    cleanups.push(onCredentialIssued((data: CredentialIssuedEvent) => {
      showNotification(`Văn bằng mới: ${data.degreeTitle || 'Credential'}`);
      fetchCredentials();
    }));

    cleanups.push(onCredentialStatusChanged((data: CredentialStatusChangedEvent) => {
      setCredentials((prev) => prev.map((c) =>
        c.id === data.credentialId ? { ...c, status: data.status as Credential['status'] } : c,
      ));
      showNotification(`Trạng thái văn bằng: ${data.status}`);
    }));

    cleanups.push(onTxConfirmed((data: TxConfirmedEvent) => {
      setCredentials((prev) => prev.map((c) =>
        c.id === data.credentialId ? { ...c, txHash: data.txHash, tokenId: data.tokenId, status: 'confirmed' } : c,
      ));
      showNotification('Giao dịch blockchain đã xác nhận');
    }));

    cleanups.push(onRegistrationUpdate((data: RegistrationEvent) => {
      showNotification(`Yêu cầu ${data.type}: ${data.name} (${data.status})`);
      fetchRequests();
      fetchSchools();
    }));

    return () => {
      cleanups.forEach((fn) => fn());
      disconnectSocket();
    };
  }, [showNotification]);

  useEffect(() => {
    fetchSchools();
    fetchRequests();
    fetchCredentials();
  }, []);

  const fetchSchools = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Vui lòng đăng nhập lại');
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSchools(data.data || data);
      } else {
        setError('Không thể lấy danh sách trường');
      }
    } catch (err) {
      console.error('Failed to fetch schools:', err);
      setError('Lỗi kết nối server');
    }
  };

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    console.log('Token in admin:', token);
    
    if (!token) {
      setError('Vui lòng đăng nhập lại');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-requests?type=school`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data || data);
      } else {
        const errorData = await res.json();
        console.log('Error:', errorData);
        setError(errorData.message || 'Không thể lấy danh sách yêu cầu');
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const fetchCredentials = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credentials`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCredentials(data.data || data);
      }
    } catch (err) {
      console.error('Failed to fetch credentials:', err);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL || 'https://sbt-credential-student.vercel.app';
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-requests/${id}/approve`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
        alert('Đã duyệt yêu cầu!');
      } else {
        alert('Lỗi khi duyệt yêu cầu');
      }
    } catch (err) {
      alert('Lỗi khi duyệt yêu cầu');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Bạn có chắc muốn từ chối yêu cầu này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-requests/${id}/reject`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
        alert('Đã từ chối yêu cầu!');
      } else {
        alert('Lỗi khi từ chối yêu cầu');
      }
    } catch (err) {
      alert('Lỗi khi từ chối yêu cầu');
    }
  };

  const handleViewRequest = async (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      setSelectedRequest(request);
    } else {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-requests/${id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedRequest(data);
        }
      } catch (err) {
        alert('Lỗi lấy chi tiết yêu cầu');
      }
    }
  };

  const handleViewCredential = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credentials/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCredential(data);
      }
    } catch (err) {
      alert('Lỗi lấy chi tiết văn bằng');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa sinh viên này? Hành động này không thể hoàn tác.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        alert('Đã xóa sinh viên!');
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi khi xóa sinh viên');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setEditName(school.name);
    setEditEmail(school.email);
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool) return;
    
    if (!editName.trim() || !editEmail.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setUpdatingSchool(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/${editingSchool.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editName, email: editEmail })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSchools(schools.map(s => s.id === editingSchool.id ? { ...s, name: editName, email: editEmail } : s));
        alert('Đã cập nhật trường thành công!');
        setEditingSchool(null);
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi khi cập nhật trường');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    } finally {
      setUpdatingSchool(false);
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (!confirm('Bạn có chắc muốn xóa trường này? Tất cả sinh viên và văn bằng của trường sẽ bị xóa. Hành động này không thể hoàn tác.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/${schoolId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        setSchools(schools.filter(s => s.id !== schoolId));
        alert('Đã xóa trường!');
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi khi xóa trường');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">Super Admin Dashboard</h1>
            </div>
            <div className="flex gap-4 items-center">
              <Button variant="outline" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-green-600" />
            <span className="text-green-800 font-medium">{notification}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng số trường học</CardTitle>
              <Building2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{schools.length}</div>
              <p className="text-xs text-gray-500">Trường học đã đăng ký</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Yêu cầu chờ duyệt</CardTitle>
              <Badge variant="destructive">{pendingRequests.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-gray-500">Yêu cầu đăng ký School</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{requests.filter(r => r.status === 'approved').length}</div>
              <p className="text-xs text-gray-500">Yêu cầu đã duyệt</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCredentials(!showCredentials)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng văn bằng</CardTitle>
              <FileCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{credentials.length}</div>
              <p className="text-xs text-gray-500">Click để xem</p>
            </CardContent>
          </Card>
        </div>

        {/* Credentials Section */}
        {showCredentials && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Danh sách văn bằng</CardTitle>
              <CardDescription>Tất cả văn bằng trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              {credentials.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Chưa có văn bằng nào</p>
              ) : (
                <div className="space-y-2">
                  {credentials.map((cred) => (
                    <div key={cred.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{cred.name}</p>
                          <p className="text-xs text-gray-500">{cred.student?.name} - {cred.student?.studentCode}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cred.status === 'confirmed' ? 'bg-green-100 text-green-800' : cred.status === 'issued' ? 'bg-blue-100 text-blue-800' : cred.status === 'revoked' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                          {cred.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleViewCredential(cred.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schools List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Danh sách Schools</CardTitle>
            <CardDescription>Các trường học đã được duyệt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {schools.map((school) => (
                <div key={school.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{school.name}</p>
                      <p className="text-xs text-gray-500">{school.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
                    <Button size="sm" variant="outline" onClick={() => handleEditSchool(school)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteSchool(school.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu đăng ký School</CardTitle>
            <CardDescription>Quản lý yêu cầu đăng ký từ các trường học</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Đang tải...</p>
            ) : error ? (
              <p className="text-center py-8 text-red-500">{error}</p>
            ) : pendingRequests.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Không có yêu cầu nào</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <p className="text-sm text-gray-500">{request.email}</p>
                          <p className="text-xs text-gray-400 font-mono mt-1">
                            {request.walletAddress.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{request.type}</Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewRequest(request.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Requests History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Lịch sử yêu cầu</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.filter(r => r.status !== 'pending').length === 0 ? (
              <p className="text-center py-4 text-gray-500">Chưa có lịch sử</p>
            ) : (
              <div className="space-y-2">
                {requests.filter(r => r.status !== 'pending').map((request, index) => (
                  <div key={`${request.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{request.name}</p>
                        <p className="text-xs text-gray-500">{request.email}</p>
                      </div>
                    </div>
                    <Badge className={request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {request.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Request Details Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu đăng ký</DialogTitle>
            <DialogDescription>
              Xem chi tiết yêu cầu đăng ký mới
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Loại</p>
                  <Badge variant="outline">{selectedRequest.type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Trạng thái</p>
                  <Badge className={selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : selectedRequest.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>
              {selectedRequest.type === 'student' && (
                <div>
                  <p className="text-xs text-gray-500">Tên</p>
                  <p className="font-medium">{selectedRequest.name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{selectedRequest.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Địa chỉ ví</p>
                <p className="font-mono text-xs">{selectedRequest.walletAddress}</p>
              </div>
              {selectedRequest.schoolName && (
                <div>
                  <p className="text-xs text-gray-500">Tên trường</p>
                  <p className="font-medium">{selectedRequest.schoolName}</p>
                </div>
              )}
              {selectedRequest.studentCode && (
                <div>
                  <p className="text-xs text-gray-500">Mã sinh viên</p>
                  <p className="font-medium">{selectedRequest.studentCode}</p>
                </div>
              )}
              {selectedRequest.description && (
                <div>
                  <p className="text-xs text-gray-500">Mô tả</p>
                  <p className="text-sm">{selectedRequest.description}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Ngày đăng ký</p>
                <p className="text-sm">{new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              </div>
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-green-600" onClick={() => { handleApprove(selectedRequest.id); setSelectedRequest(null); }}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Duyệt
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => { handleReject(selectedRequest.id); setSelectedRequest(null); }}>
                    <XCircle className="h-4 w-4 mr-2" /> Từ chối
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit School Modal */}
      <Dialog open={!!editingSchool} onOpenChange={() => setEditingSchool(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trường</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin trường học
            </DialogDescription>
          </DialogHeader>
          {editingSchool && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tên trường</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Nhập tên trường"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Nhập email"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 bg-primary" 
                  onClick={handleUpdateSchool}
                  disabled={updatingSchool}
                >
                  {updatingSchool ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setEditingSchool(null)}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Credential Details Modal */}
      <Dialog open={!!selectedCredential} onOpenChange={() => setSelectedCredential(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết văn bằng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết văn bằng của sinh viên
            </DialogDescription>
          </DialogHeader>
          {selectedCredential && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{selectedCredential.name}</h3>
                <Badge className={selectedCredential.status === 'confirmed' ? 'bg-green-100 text-green-800' : selectedCredential.status === 'issued' ? 'bg-blue-100 text-blue-800' : selectedCredential.status === 'revoked' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                  {selectedCredential.status}
                </Badge>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Mã xác minh</p>
                <p className="font-mono text-sm">{selectedCredential.verifyCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Sinh viên</p>
                  <p className="font-medium text-sm">{selectedCredential.student?.name}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Mã SV</p>
                  <p className="font-medium text-sm">{selectedCredential.student?.studentCode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Đơn vị cấp</p>
                  <p className="font-medium text-sm">{selectedCredential.issuerName || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Ngày cấp</p>
                  <p className="font-medium text-sm">{selectedCredential.issuedAt ? new Date(selectedCredential.issuedAt).toLocaleDateString('vi-VN') : '-'}</p>
                </div>
              </div>
              {selectedCredential.classification && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Xếp loại</p>
                  <p className="font-medium text-sm">{selectedCredential.classification}</p>
                </div>
              )}
              {selectedCredential.txHash && (
                <a
                  href={`https://amoy.polygonscan.com/tx/${selectedCredential.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Xem trên Polygon Scan</span>
                </a>
              )}
              {selectedCredential.ipfsHash && (
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${selectedCredential.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="text-sm font-medium text-blue-600">Xem file gốc trên IPFS</span>
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
