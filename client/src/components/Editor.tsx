// import { useEffect, useState } from 'react';
// import { Socket } from 'socket.io-client';
// import Editor from '@monaco-editor/react';

// interface CollaborativeEditorProps {
//   socket: Socket;
//   passkey: string;
// }

// export default function CollaborativeEditor({ socket, passkey }: CollaborativeEditorProps) {
//   const [content, setContent] = useState('');
//   const [isCodeMode, setIsCodeMode] = useState(false);
//   const [isCopied, setIsCopied] = useState(false);
  
//   useEffect(() => {
//     socket.emit('join-session', passkey);

//     socket.on('load-content', ({ content, isCodeMode }) => {
//       setContent(content);
//       setIsCodeMode(isCodeMode);
//     });

//     socket.on('content-update', (newContent) => {
//       setContent(newContent);
//     });

//     socket.on('mode-update', (newIsCodeMode) => {
//       setIsCodeMode(newIsCodeMode);
//     });

//     return () => {
//       socket.off('load-content');
//       socket.off('content-update');
//       socket.off('mode-update');
//     };
//   }, [socket, passkey]);

//   const handleContentChange = (value: string) => {
//     setContent(value);
//     socket.emit('content-change', { passkey, content: value });
//   };

//   const toggleMode = () => {
//     const newMode = !isCodeMode;
//     setIsCodeMode(newMode);
//     socket.emit('toggle-mode', { passkey, isCodeMode: newMode });
//   };

//   const copyPasskey = async () => {
//     await navigator.clipboard.writeText(passkey);
//     setIsCopied(true);
//     setTimeout(() => setIsCopied(false), 2000);
//   };

//   const copyContent = async () => {
//     await navigator.clipboard.writeText(content);
//     setIsCopied(true);
//     setTimeout(() => setIsCopied(false), 2000);
//   };

//   return (
//     <div className="h-screen flex flex-col bg-gray-900">
//       <header className="header flex items-center justify-between p-4">
//         <div className="flex items-center space-x-4">
//           <h1 className="text-gray-200 text-lg font-semibold flex items-center space-x-2">
//             <span>Session:</span>
//             <span className="text-blue-400 font-mono">{passkey}</span>
//           </h1>
//           <button
//             onClick={copyPasskey}
//             className="button"
//           >
//             {isCopied ? (
//               <span>Copied! ✓</span>
//             ) : (
//               <span>Copy Passkey</span>
//             )}
//           </button>
//         </div>
//       </header>
      
//       <main className="flex-1 relative">
//         {isCodeMode ? (
//           <Editor
//             height="100%"
//             language="javascript"
//             theme="vs-dark"
//             value={content}
//             onChange={(value) => handleContentChange(value || '')}
//             options={{
//               minimap: { enabled: false },
//               fontSize: 14,
//               wordWrap: 'on',
//               padding: { top: 16 },
//               scrollBeyondLastLine: false,
//               automaticLayout: true,
//               fontFamily: 'monospace',
//               renderWhitespace: 'selection',
//               lineNumbers: 'on',
//               roundedSelection: false,
//               tabSize: 2,
//             }}
//             className="w-full h-full"
//           />
//         ) : (
//           <textarea
//             value={content}
//             onChange={(e) => handleContentChange(e.target.value)}
//             className="code-area"
//             placeholder="Start typing here..."
//           />
//         )}
//         <button
//           onClick={copyContent}
//           className="button mt-4"
//         >
//           {isCopied ? (
//             <span>Content Copied! ✓</span>
//           ) : (
//             <span>Copy Content</span>
//           )}
//         </button>
//       </main>
//     </div>
//   );
// } 



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
  const [isCopiedPasskey, setIsCopiedPasskey] = useState(false);
  const [isCopiedContent, setIsCopiedContent] = useState(false);

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

  const copyToClipboard = async (text: string, setCopied: (value: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        body {
          font-family: Arial, sans-serif;
          background-color: #1e1e2e;
          color: #fff;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        .editor-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 90%;
          max-width: 800px;
          padding: 20px;
        }

        .session-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          text-align: center;
          margin-bottom: 20px;
          width: 100%;
          max-width: 500px;
        }

        .session-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .session-title span {
          color: #00e676;
        }

        .button {
          background-color: #00e676;
          color: #000;
          border: none;
          padding: 10px 16px;
          margin: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.3s;
        }

        .button:hover {
          background-color: #00c853;
        }

        .editor-wrapper {
          width: 100%;
          max-width: 700px;
          height: 300px;
          margin-top: 10px;
        }

        .code-area {
          width: 100%;
          height: 100%;
          padding: 10px;
          font-size: 14px;
          border-radius: 8px;
          border: 1px solid #444;
          background-color: #2a2a3b;
          color: white;
          resize: none;
        }

        .code-area:focus {
          outline: none;
          border-color: #00e676;
        }

        .copy-button {
          margin-top: 12px;
        }
      `}</style>

      <div className="editor-container">
        <div className="session-card">
          <h1 className="session-title">Session: <span>{passkey}</span></h1>
          <button onClick={() => copyToClipboard(passkey, setIsCopiedPasskey)} className="button">
            {isCopiedPasskey ? "Copied! ✓" : "Copy Passkey"}
          </button>
          <button onClick={toggleMode} className="button">
            {isCodeMode ? "Switch to Text Mode" : "Switch to Code Mode"}
          </button>
        </div>

        <div className="editor-wrapper">
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
              className="code-editor"
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="code-area"
              placeholder="Start typing here..."
            />
          )}
        </div>

        <button onClick={() => copyToClipboard(content, setIsCopiedContent)} className="button copy-button">
          {isCopiedContent ? "Content Copied! ✓" : "Copy Content"}
        </button>
      </div>
    </>
  );
}
