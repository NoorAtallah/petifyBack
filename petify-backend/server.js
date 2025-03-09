const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const User = require('./models/user');
const Message = require('./models/Chat');
require('dotenv').config();
// Initialize the app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"], // Replace with your frontend's address
    methods: ["GET", "POST"],
  },
});

// Connect to the database
connectDB();
const messageChangeStream = Message.watch();

messageChangeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
        const messageData = change.fullDocument;
        io.emit('receiveMessage', messageData);
    }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New user connected');
  
  socket.on('sendMessage', async (messageData) => {
    try {
      const user = await User.findById(messageData.userId);
      if (user) {
        const newMessage = new Message({
          user: user._id,
          username: user.fullName,
          text: messageData.text,
        });
        await newMessage.save();
        
        const fullMessageData = {
          ...newMessage.toObject(),
          username: user.fullName,
          timestamp: new Date()
        };
        
        // Emit to all clients, including the sender
        io.emit('receiveMessage', fullMessageData);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
});

// Middleware
app.use(cors());
app.use(express.json()); 

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/profile', require('./routes/profile')); // Add profile routes
app.use('/api/vets', require('./routes/vet'));
// app.use('/api/subscribe', require('./routes/subscription'));
app.use('/api', require('./routes/contact')); 
app.use('/api/book', require('./routes/booking'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/adopt', require('./routes/adopt'));
app.use('/api/pay', require('./routes/braintree'));
// app.use(('/api/calendar') , require('./routes/booking'))
app.use('/api/admin' , require('./routes/admin'))
app.use('/api/blog' , require('./routes/blog'))
app.use('/api/sym' , require('./routes/symptopm'))
app.use('/api/history' , require('./routes/history'))
app.use('/api/pets' , require('./routes/matchPets'))


// Error Handling
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
