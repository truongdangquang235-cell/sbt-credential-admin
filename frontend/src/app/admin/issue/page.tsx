'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { GraduationCap, Send, Loader2 } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  studentCode: string;
}

export default function IssuePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(true);
  
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    major: '',
    issueDate: new Date().toISOString().split('T')[0]
  });

  // Lấy danh sách sinh viên từ Backend của Thịnh
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('http://localhost:3000/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (error) {
        console.error("Không thể kết nối đến API sinh viên:", error);
      } finally {
        setFetchingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // Hàm xử lý gửi yêu cầu cấp bằng
  const handleIssue = async () => {
    if (!formData.studentId || !formData.title || !formData.major) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("🎉 Cấp bằng thành công! Hệ thống đang khởi tạo SBT trên Blockchain.");
        // Reset form
        setFormData({ ...formData, title: '', major: '' });
      } else {
        alert("Có lỗi xảy ra khi cấp bằng.");
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
      alert("Lỗi: Không thể kết nối tới server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex justify-center items-start bg-gray-50 min-h-screen">
      <Card className="w-full max-w-2xl shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <GraduationCap className="w-8 h-8" />
            <CardTitle className="text-2xl font-bold uppercase">Cấp văn bằng SBT</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Khởi tạo chứng chỉ số không thể chuyển nhượng cho sinh viên.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Chọn sinh viên */}
          <div className="space-y-2">
            <Label className="font-semibold">Sinh viên thụ hưởng</Label>
            <Select 
              onValueChange={(value) => setFormData({...formData, studentId: value})}
              disabled={fetchingStudents}
            >
              <SelectTrigger>
                <SelectValue placeholder={fetchingStudents ? "Đang tải danh sách..." : "Chọn sinh viên..."} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} - {s.studentCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thông tin bằng cấp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold">Tên loại bằng</Label>
              <Input 
                id="title" 
                placeholder="VD: Cử nhân Xuất sắc" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="major" className="font-semibold">Chuyên ngành</Label>
              <Input 
                id="major" 
                placeholder="VD: Công nghệ thông tin" 
                value={formData.major}
                onChange={(e) => setFormData({...formData, major: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="font-semibold">Ngày cấp văn bằng</Label>
            <Input 
              id="date" 
              type="date" 
              value={formData.issueDate}
              onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-gray-50/50 p-6 rounded-b-lg">
          <Button variant="ghost" onClick={() => window.history.back()}>Quay lại</Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white gap-2 px-6"
            onClick={handleIssue}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "Đang xử lý..." : "Xác nhận cấp bằng"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}