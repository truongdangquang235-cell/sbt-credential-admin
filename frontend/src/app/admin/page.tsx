'use client';

import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Building2, CheckCircle, XCircle, Trash2, Eye, FileCheck, Pencil, Bell } from 'lucide-react';
import { connectSocket, disconnectSocket, joinAdminRoom, onCredentialIssued, onCredentialStatusChanged, onTxConfirmed, onRegistrationUpdate, RegistrationEvent } from '@/lib/socket';
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

export default function AdminPage() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updatingSchool, setUpdatingSchool] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Auth check
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

  // Socket setup
  useEffect(() => {
    connectSocket();
    joinAdminRoom();

    const cleanups: Array<() => void> = [];

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
  }, []);

  const fetchSchools = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
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
      }
    } catch (err) {
      console.error('Failed to fetch schools:', err);
    }
  };

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
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
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data || data);
      } else {
        setError('Không thể lấy danh sách yêu cầu');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
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
        fetchSchools();
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
      }
    } catch (err) {
      alert('Lỗi khi từ chối yêu cầu');
    }
  };

  const handleViewRequest = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) setSelectedRequest(request);
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setEditName(school.name);
    setEditEmail(school.email);
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool) return;
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
        setSchools(schools.map(s => s.id === editingSchool.id ? { ...s, name: editName, email: editEmail } : s));
        alert('Đã cập nhật trường thành công!');
        setEditingSchool(null);
      }
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
              <h1 className="text-xl font-bold uppercase tracking-tight">Super Admin Dashboard</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>Đăng xuất</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Bell className="h-4 w-4 text-green-600" />
            <span className="text-green-800 font-medium">{notification}</span>
          </div>
        )}

        <div className="grid gap-8">
          {/* 1. Danh sách Schools */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-white/50">
              <CardTitle className="text-xl">Danh sách Schools</CardTitle>
              <CardDescription>Các trường học đã được duyệt và đang hoạt động trên hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-3">
                {schools.length === 0 ? (
                    <p className="text-center py-4 text-gray-500 italic">Chưa có trường học nào hoạt động</p>
                ) : (
                    schools.map((school) => (
                    <div key={school.id} className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2.5 rounded-full">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{school.name}</p>
                            <p className="text-sm text-gray-500">{school.email}</p>
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none px-3">Hoạt động</Badge>
                        <Button size="icon" variant="ghost" onClick={() => handleEditSchool(school)} className="h-9 w-9 text-gray-500">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteSchool(school.id)} className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Yêu cầu đăng ký School */}
          <Card className="shadow-sm border-blue-100">
            <CardHeader className="border-b bg-blue-50/30">
              <CardTitle className="text-xl text-blue-900">Yêu cầu đăng ký School</CardTitle>
              <CardDescription>Phê duyệt hoặc từ chối các yêu cầu gia nhập hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <p className="text-center py-12 text-gray-400 animate-pulse">Đang tải dữ liệu...</p>
              ) : error ? (
                <p className="text-center py-8 text-red-500 bg-red-50 rounded-lg border border-red-100">{error}</p>
              ) : pendingRequests.length === 0 ? (
                <p className="text-center py-12 text-gray-500 italic">Hiện tại không có yêu cầu nào chờ duyệt</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="p-5 border-2 border-blue-50 rounded-xl bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-gray-900">{request.name}</p>
                            <p className="text-sm text-gray-600">{request.email}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-tighter">
                                Wallet: {request.walletAddress}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">{request.type}</Badge>
                      </div>
                      <div className="flex gap-3 pt-2 border-t border-gray-50 mt-4">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewRequest(request.id)}>
                          <Eye className="h-4 w-4 mr-2" /> Chi tiết
                        </Button>
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 shadow-sm" onClick={() => handleApprove(request.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" /> Duyệt
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1 shadow-sm" onClick={() => handleReject(request.id)}>
                          <XCircle className="h-4 w-4 mr-2" /> Từ chối
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Lịch sử yêu cầu */}
          <Card className="shadow-sm opacity-90">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-lg">Lịch sử yêu cầu</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {requests.filter(r => r.status !== 'pending').length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-sm italic">Chưa có lịch sử xử lý</p>
              ) : (
                <div className="grid gap-2">
                  {requests.filter(r => r.status !== 'pending').map((request, index) => (
                    <div key={`${request.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50/50 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{request.name}</p>
                          <p className="text-[11px] text-gray-500">{request.email}</p>
                        </div>
                      </div>
                      <Badge className={request.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'} variant="outline">
                        {request.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals - Giữ nguyên logic xử lý */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chi tiết yêu cầu</DialogTitle></DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Loại</p><Badge variant="outline">{selectedRequest.type}</Badge></div>
                <div><p className="text-xs text-gray-500">Trạng thái</p><Badge>{selectedRequest.status}</Badge></div>
              </div>
              <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{selectedRequest.email}</p></div>
              <div><p className="text-xs text-gray-500">Ví</p><p className="font-mono text-[10px] break-all">{selectedRequest.walletAddress}</p></div>
              {selectedRequest.description && (
                <div><p className="text-xs text-gray-500">Mô tả</p><p className="text-sm">{selectedRequest.description}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingSchool} onOpenChange={() => setEditingSchool(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cập nhật trường</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Tên trường" />
            <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Email" />
            <Button className="w-full" onClick={handleUpdateSchool} disabled={updatingSchool}>{updatingSchool ? 'Đang cập nhật...' : 'Cập nhật'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}