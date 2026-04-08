'use client';

import { useEffect, useRef } from 'react';
import {
  connectSocket,
  disconnectSocket,
  joinStudentRoom,
  onCredentialIssued,
  onCredentialStatusChanged,
  onTxConfirmed,
  CredentialIssuedEvent,
  CredentialStatusChangedEvent,
  TxConfirmedEvent,
} from '@/lib/socket';

interface UseCredentialSocketOptions {
  studentId?: string;
  onIssued?: (data: CredentialIssuedEvent) => void;
  onStatusChanged?: (data: CredentialStatusChangedEvent) => void;
  onTxConfirmed?: (data: TxConfirmedEvent) => void;
}

export function useCredentialSocket(options: UseCredentialSocketOptions) {
  const { studentId } = options;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    connectSocket();

    if (studentId) {
      joinStudentRoom(studentId);
    }

    const cleanups: Array<() => void> = [];

    cleanups.push(
      onCredentialIssued((data) => {
        optionsRef.current.onIssued?.(data);
      }),
    );

    cleanups.push(
      onCredentialStatusChanged((data) => {
        optionsRef.current.onStatusChanged?.(data);
      }),
    );

    cleanups.push(
      onTxConfirmed((data) => {
        optionsRef.current.onTxConfirmed?.(data);
      }),
    );

    return () => {
      cleanups.forEach((fn) => fn());
      disconnectSocket();
    };
  }, [studentId]);
}
