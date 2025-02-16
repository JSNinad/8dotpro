import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import Editor from '@monaco-editor/react';

interface CollaborativeEditorProps {
  socket: Socket;
  passkey: string;
}

export default function CollaborativeEditor({ socket, passkey }: CollaborativeEditorProps) {
  const [content, setContent] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  useEffect(() => {
    socket.emit('join-session', passkey);

    socket.on('load-content', ({ content, isCodeMode }) => {
      setContent(content);
      setIsCodeMode(isCodeMode);
    });

    socket.on('content-update', (newContent) => {
      setContent(newContent);
    });

    socket.on('mode-update', (newIsCodeMode) => {
      setIsCodeMode(newIsCodeMode);
    });

    return () => {
      socket.off('load-content');
      socket.off('content-update');
      socket.off('mode-update');
    };
  }, [socket, passkey]);

  const handleContentChange = (value: string) => {
    setContent(value);
    socket.emit('content-change', { passkey, content: value });
  };

  const toggleMode = () => {
    const newMode = !isCodeMode;
    setIsCodeMode(newMode);
    socket.emit('toggle-mode', { passkey, isCodeMode: newMode });
  };

  const copyPasskey = async () => {
    await navigator.clipboard.writeText(passkey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const copyContent = async () => {
    await navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <header className="header flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-gray-200 text-lg font-semibold flex items-center space-x-2">
            <span>Session:</span>
            <span className="text-blue-400 font-mono">{passkey}</span>
          </h1>
          <button
            onClick={copyPasskey}
            className="button"
          >
            {isCopied ? (
              <span>Copied! ✓</span>
            ) : (
              <span>Copy Passkey</span>
            )}
          </button>
        </div>
      </header>
      
      <main className="flex-1 relative">
        {isCodeMode ? (
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={content}
            onChange={(value) => handleContentChange(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: 'monospace',
              renderWhitespace: 'selection',
              lineNumbers: 'on',
              roundedSelection: false,
              tabSize: 2,
            }}
            className="w-full h-full"
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="code-area"
            placeholder="Start typing here..."
          />
        )}
        <button
          onClick={copyContent}
          className="button mt-4"
        >
          {isCopied ? (
            <span>Content Copied! ✓</span>
          ) : (
            <span>Copy Content</span>
          )}
        </button>
      </main>
    </div>
  );
} 