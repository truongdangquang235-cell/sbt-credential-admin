'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileCheck, 
  ExternalLink, 
  Calendar,
  CheckCircle, 
  Clock, 
  AlertCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface CredentialCardProps {
  credential: {
    id: string;
    name: string;
    description?: string;
    status: string;
    verifyCode: string;
    tokenId: string | null;
    issuedAt?: string;
    school?: string;
    grade?: string;
  };
  onViewDetails: (credential: any) => void;
}

const statusConfig = {
  confirmed: { label: 'Đã xác nhận', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  issued: { label: 'Đã cấp', color: 'bg-blue-100 text-blue-800', icon: Clock },
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  revoked: { label: 'Đã thu hồi', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export function CredentialCard({ credential, onViewDetails }: CredentialCardProps) {
  const status = statusConfig[credential.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">{credential.name}</CardTitle>
          <Badge variant="secondary" className={`${status.color} transition-transform group-hover:scale-105`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
        {credential.school && (
          <p className="text-sm text-gray-500">{credential.school}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {credential.grade && (
              <Badge variant="outline" className="text-green-600">
                {credential.grade}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>
                {credential.issuedAt 
                  ? new Date(credential.issuedAt).toLocaleDateString('vi-VN')
                  : 'Chưa cấp'}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {credential.description || 'Chứng chỉ được cấp bởi hệ thống SBT Credential'}
          </p>

          <p className="text-xs text-gray-400 font-mono">
            Token ID: #{credential.tokenId || '-'}
          </p>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 group-hover:bg-primary/5 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(credential);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Chi tiết
            </Button>
            <Button 
              size="sm" 
              className="flex-1 group-hover:bg-primary/90 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/verify/${credential.verifyCode}`, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Verify
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
