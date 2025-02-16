'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import CollaborativeEditor from '@/components/Editor';

export default function EditorPage({ params }: { params: { passkey: string } }) {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  if (!socket) {
    return <div>Connecting...</div>;
  }

  return <CollaborativeEditor socket={socket} passkey={params.passkey} />;
} 