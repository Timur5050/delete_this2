# Linux Process Viewer - Course Project

## 📋 Project Description

This is a full-stack web application that provides real-time monitoring and management of Linux system processes. It includes:

- **Frontend**: Modern React.js interface
- **Backend**: Node.js/Express REST API
- **Database**: PostgreSQL for storing process snapshots
- **Core Features**: Process listing, filtering, sorting, and process termination

## 🎯 Features

✅ Real-time process monitoring
✅ Search and filter processes by name, PID, or user
✅ Sort processes by CPU, memory, time, etc.
✅ View detailed process information
✅ Terminate running processes (with confirmation)
✅ System resource statistics
✅ Auto-refresh with configurable intervals
✅ Save process snapshots to database
✅ Responsive design for desktop and tablet

## 🛠 Technology Stack

### Frontend
- **React 18** - UI library
- **Axios** - HTTP client
- **CSS3** - Styling with animations

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **File-based Storage** - JSON file system for development (no database required)
- **child_process** - System command execution

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- Linux/Unix system

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file (optional):
```
PORT=5000
NODE_ENV=development
```

3. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will open on `http://localhost:3000`

## 📡 API Endpoints

### Get all processes
```
GET /api/processes
```

### Get process by PID
```
GET /api/processes/:pid
```

### Kill process
```
POST /api/processes/:pid/kill
```

### Get system stats
```
GET /api/stats
```

### Get all snapshots
```
GET /api/snapshots
```

### Create process snapshot
```
POST /api/snapshots
Body: { name: string, description: string }
```

### Get snapshot by ID
```
GET /api/snapshots/:id
```

## 🗄 Data Storage

The application uses a file-based JSON storage system for simplicity and ease of deployment:
- **Snapshots** are stored in `backend/data/snapshots.json`
- No database installation required
- Perfect for course projects and development

To use a real PostgreSQL database, modify the `db.js` file accordingly.

## 🎨 UI Components

- **SearchBar** - Filter processes by name/PID/user
- **ProcessTable** - Display processes with sorting
- **ProcessStats** - Show system statistics
- **App** - Main container component

## 💡 Key Features Explained

### Process Listing
The application fetches all running processes using the `ps aux` Linux command and displays them in a sortable table.

### Resource Highlighting
- CPU usage > 50%: Red (critical)
- CPU usage > 20%: Orange (warning)
- Memory similar color coding

### Auto-Refresh
Automatically updates process list at configurable intervals (default: 5 seconds)

### Process Killing
Safely terminate processes with confirmation dialog. Requires appropriate permissions.

## 📊 Project Structure

```
course/
├── backend/
│   ├── server.js          # Main API server
│   ├── db.js              # Database connection
│   ├── init-db.js         # Database initialization
│   ├── package.json       # Dependencies
│   ├── .env               # Configuration
│   └── .gitignore         # Git ignore file
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProcessTable.js
│   │   │   ├── ProcessTable.css
│   │   │   ├── SearchBar.js
│   │   │   ├── SearchBar.css
│   │   │   ├── ProcessStats.js
│   │   │   └── ProcessStats.css
│   │   ├── App.js         # Main app component
│   │   ├── App.css        # App styling
│   │   ├── index.js       # React root
│   │   └── index.css      # Global styles
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── package.json       # Dependencies
│   └── .gitignore         # Git ignore file
└── docs/
    └── README.md          # This file
```

```bash
# Navigate to project root
cd course

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (in another terminal)
cd frontend
npm start
```

Frontend will open at `http://localhost:3000`
Backend API is at `http://localhost:5000`

## 🔒 Security Considerations

- Process killing requires appropriate system permissions
- Input validation on PIDs
- CORS enabled for local development
- Environment variables for sensitive config

## 📝 Notes for Course Project

This project demonstrates:
- ✅ Full-stack development (Frontend, Backend, Database)
- ✅ RESTful API design
- ✅ React component architecture
- ✅ Database integration
- ✅ System-level programming (Linux process handling)
- ✅ Real-time data updates
- ✅ Responsive UI design

## 🔧 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify `.env` file with correct DB credentials
- Run `npm install` to install dependencies

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify `API_URL` in App.js

### Permission denied for process killing
- Run with elevated privileges if needed
- Some processes require root/sudo access

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Linux Process Management](https://man7.org/linux/man-pages/man1/ps.1.html)

## 📄 License

MIT License - Feel free to use for educational purposes

## 👨‍💼 Author

Created as a course project in Full-Stack Web Development

---

**Happy Process Monitoring! 🐧**
# delete_this2
