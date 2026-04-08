'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Hash } from 'lucide-react';

interface StudentInfoProps {
  student: {
    name: string;
    email: string;
    studentCode: string;
  } | null;
}

export function StudentInfo({ student }: StudentInfoProps) {
  if (!student) return null;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {student.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              {student.name}
            </h2>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {student.email}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              {student.studentCode}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
