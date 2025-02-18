'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 

export default function Home() {
  const [passkey, setPasskey] = useState('');
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey.trim()) {
      router.push(`/editor/${passkey}`);
    }
  };

  return (
    <main>
      <div className="container">
        <h1>LivePro</h1>
        <p>Real-time collaborative editor</p>
        <div className="input-container">
          <input
            type="text"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            placeholder="Enter passkey to join or create session"
            required
          />
        </div>
        <button type="submit" className="button" onClick={handleJoin}>
          Join Session
        </button>
        <p>Share the passkey with others to collaborate in real-time</p>
      </div>
    </main>
  );
} 