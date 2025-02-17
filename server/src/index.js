const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

// MongoDB Connection (Updated to use MongoDB Atlas)
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://JSNinad:Ninad123@cluster0.ipidtet.mongodb.net/codecollab?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Session Schema
const sessionSchema = new mongoose.Schema({
  passkey: { type: String, required: true, unique: true },
  content: { type: String, default: '' },
  isCodeMode: { type: Boolean, default: false },
  language: { type: String, default: 'javascript' },
  lastUpdated: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  let currentSession = null;

  socket.on('join-session', async (passkey) => {
    currentSession = passkey;
    socket.join(passkey);
    
    try {
      // Find or create session
      let session = await Session.findOne({ passkey });
      if (!session) {
        session = await Session.create({ 
          passkey,
          content: '',
          isCodeMode: false
        });
      }
      
      socket.emit('load-content', {
        content: session.content,
        isCodeMode: session.isCodeMode,
        language: session.language
      });
    } catch (error) {
      console.error('Error joining session:', error);
    }
  });

  socket.on('content-change', async ({ passkey, content }) => {
    try {
      await Session.findOneAndUpdate(
        { passkey },
        { 
          content,
          lastUpdated: Date.now()
        }
      );
      socket.to(passkey).emit('content-update', content);
    } catch (error) {
      console.error('Error updating content:', error);
    }
  });

  socket.on('toggle-mode', async ({ passkey, isCodeMode }) => {
    try {
      await Session.findOneAndUpdate(
        { passkey },
        { 
          isCodeMode,
          lastUpdated: Date.now()
        }
      );
      socket.to(passkey).emit('mode-update', isCodeMode);
    } catch (error) {
      console.error('Error toggling mode:', error);
    }
  });

  socket.on('language-change', async ({ passkey, language }) => {
    try {
      await Session.findOneAndUpdate(
        { passkey },
        { 
          language,
          lastUpdated: Date.now()
        }
      );
      socket.to(passkey).emit('language-update', language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  });

  // Optional: Clean up old sessions periodically
  const cleanupOldSessions = async () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    try {
      await Session.deleteMany({ lastUpdated: { $lt: oneWeekAgo } });
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  };

  // Run cleanup every day
  setInterval(cleanupOldSessions, 24 * 60 * 60 * 1000);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
