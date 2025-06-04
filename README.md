# 🧵 Threads - Social Media Platform

![Threads Logo](./frontend/public/light-logo.svg)

A modern, full-stack social media platform inspired by Threads, built with React, Node.js, and MongoDB. Features real-time messaging, AI-powered assistant, and a beautiful responsive UI.

## 🌐 Live Demo

**Website:** [https://threads1.onrender.com/auth](https://threads1.onrender.com/auth)

## ✨ Features

### 🔐 Authentication & Users

- **Secure Authentication** - JWT-based login/signup with password hashing
- **User Profiles** - Customizable profiles with avatars and bio
- **Follow/Unfollow System** - Connect with other users
- **Suggested Users** - Discover new people to follow

### 📝 Posts & Content

- **Create Posts** - Share text and images with the community
- **Like & Comment** - Engage with posts through likes and comments
- **Image Upload** - Cloudinary integration for media storage
- **Real-time Updates** - Live post updates across all users

### 💬 Real-time Messaging

- **Direct Messages** - Private conversations between users
- **Socket.io Integration** - Real-time message delivery
- **Message History** - Persistent conversation storage
- **Online Status** - See who's currently active

### 🤖 AI Assistant

- **Smart Chatbot** - Powered by Google's Gemini AI
- **Post Creation** - AI can create posts on your behalf
- **Content Interaction** - Like, reply, and message users through AI
- **User Search** - Find users with natural language
- **Feed Reading** - AI can read and summarize your feed

### 🎨 Modern UI/UX

- **Responsive Design** - Works seamlessly on all devices
- **Dark/Light Mode** - Toggle between themes
- **Chakra UI** - Beautiful, accessible component library
- **Smooth Animations** - Enhanced user experience with Framer Motion
- **Mobile-First** - Optimized for mobile devices

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks
- **Chakra UI** - Component library for styling
- **Recoil** - State management
- **Vite** - Fast build tool and dev server
- **Socket.io Client** - Real-time communication
- **Framer Motion** - Animations and transitions

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing

### AI & Services

- **Google Gemini AI** - Advanced language model
- **Cloudinary** - Image upload and management
- **Cron Jobs** - Scheduled tasks

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account
- Google Gemini AI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/threads.git
   cd threads
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Environment Variables**

   Create a `.env` file in the backend directory:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the application**

   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev

   # Or run separately:
   # Backend (from root directory)
   npm run dev

   # Frontend (from frontend directory)
   cd frontend && npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 📁 Project Structure

```
threads/
├── backend/                 # Backend server code
│   ├── controllers/         # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middlewares/        # Custom middleware
│   ├── socket/             # Socket.io configuration
│   ├── utils/              # Helper functions
│   └── server.js           # Entry point
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── atoms/          # Recoil state
│   │   └── context/        # React context
│   └── public/             # Static assets
└── README.md
```

## 🔧 API Endpoints

### Authentication

- `POST /api/users/signup` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout

### Users

- `GET /api/users/profile/:query` - Get user profile
- `PUT /api/users/update/:id` - Update user profile
- `POST /api/users/follow/:id` - Follow/unfollow user
- `GET /api/users/suggested` - Get suggested users

### Posts

- `GET /api/posts/feed` - Get user feed
- `POST /api/posts/create` - Create new post
- `GET /api/posts/:id` - Get specific post
- `DELETE /api/posts/:id` - Delete post
- `PUT /api/posts/like/:id` - Like/unlike post
- `PUT /api/posts/reply/:id` - Reply to post

### Messages

- `GET /api/messages/:otherUserId` - Get conversation
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get all conversations

### AI Assistant

- `POST /api/ai/chat` - Chat with AI assistant

## 🤖 AI Assistant Features

The AI assistant can help you with:

- **📝 Creating Posts**: "Create a post about AI trends"
- **❤️ Liking Content**: "Like John's post about coffee"
- **💬 Replying**: "Reply to Sarah's post with 'Great point!'"
- **📨 Messaging**: "Send message to Alex: Hey there!"
- **🔍 Finding Users**: "Find user named Michael"
- **👁️ Reading Feed**: "What's new in my feed?"

## 🎨 UI Components

### Key Components

- **AiChatBox** - Interactive AI assistant with modern animations
- **Post** - Individual post component with actions
- **UserHeader** - User profile header with follow functionality
- **MessageContainer** - Real-time messaging interface
- **CreatePost** - Post creation with image upload

### Design Features

- Responsive grid layouts
- Smooth hover animations
- Loading states and skeletons
- Toast notifications
- Modal dialogs

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt for password security
- **Protected Routes** - Middleware for route protection
- **Input Validation** - Server-side validation
- **CORS Configuration** - Cross-origin request handling

## 📱 Mobile Optimization

- **Responsive Design** - Works on all screen sizes
- **Touch-Friendly UI** - Optimized for mobile interactions
- **Progressive Enhancement** - Graceful degradation for older devices
- **Fast Loading** - Optimized bundle sizes and lazy loading

## 🚀 Deployment

### Render (Recommended)

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with automatic builds

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- **Chakra UI** - For the amazing component library
- **Google Gemini** - For AI capabilities
- **MongoDB** - For reliable database services
- **Cloudinary** - For image management
- **Socket.io** - For real-time functionality

## 📊 Features Roadmap

- [ ] Voice messages
- [ ] Video calling
- [ ] Story feature
- [ ] Advanced AI features
- [ ] Push notifications
- [ ] Progressive Web App (PWA)
- [ ] Analytics dashboard

---

⭐ **Star this repository if you found it helpful!**

Made with ❤️ and ☕
