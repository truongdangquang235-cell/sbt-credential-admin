import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002';
    socket = io(wsUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function joinStudentRoom(studentId: string) {
  const s = connectSocket();
  s.emit('join:student', { studentId });
}

export function joinSchoolRoom(schoolId: string) {
  const s = connectSocket();
  s.emit('join:school', { schoolId });
}

export function joinAdminRoom() {
  const s = connectSocket();
  s.emit('join:admin');
}

export interface CredentialIssuedEvent {
  event: string;
  credentialId?: string;
  tokenId: string;
  recipient: string;
  studentId: string;
  studentName: string;
  degreeTitle: string;
  ipfsCID: string;
  documentHash: string;
  txHash: string;
  status?: string;
}

export interface CredentialStatusChangedEvent {
  credentialId: string;
  status: string;
}

export interface TxConfirmedEvent {
  credentialId: string;
  txHash: string;
  tokenId: string;
}

export interface RegistrationEvent {
  requestId: string;
  type: 'school' | 'student';
  name: string;
  status: string;
}

export function onCredentialIssued(callback: (data: CredentialIssuedEvent) => void) {
  const s = getSocket();
  s.on('credential:issued', callback);
  return () => {
    s.off('credential:issued', callback);
  };
}

export function onCredentialStatusChanged(callback: (data: CredentialStatusChangedEvent) => void) {
  const s = getSocket();
  s.on('credential:statusChanged', callback);
  return () => {
    s.off('credential:statusChanged', callback);
  };
}

export function onTxConfirmed(callback: (data: TxConfirmedEvent) => void) {
  const s = getSocket();
  s.on('credential:txConfirmed', callback);
  return () => {
    s.off('credential:txConfirmed', callback);
  };
}

export function onRegistrationUpdate(callback: (data: RegistrationEvent) => void) {
  const s = getSocket();
  s.on('registration:updated', callback);
  return () => {
    s.off('registration:updated', callback);
  };
}
