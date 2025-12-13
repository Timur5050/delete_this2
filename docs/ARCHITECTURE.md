# 🏗 АРХІТЕКТУРА ПРОЕКТУ

## 📐 Загальна архітектура

```
┌─────────────────────────────────────────────────────────────┐
│                    LINUX PROCESS VIEWER                     │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐  ┌──▼────────┐  ┌─▼─────────────┐
        │  FRONTEND    │  │  BACKEND  │  │   DATABASE    │
        │  (React)     │  │(Node.js)  │  │  (JSON Files) │
        │  :3000       │  │   :5000   │  │    ./data/    │
        └──────────────┘  └───────────┘  └───────────────┘
```

## 🎨 Frontend Architecture (React)

### Структура компонентів

```
src/
├── App.js                    # Główний компонент
├── App.css                   # Глобальні стилі
├── index.js                  # React точка входу
└── components/
    ├── ProcessTable.js       # Таблиця процесів
    ├── ProcessTable.css      # Стилі таблиці
    ├── SearchBar.js          # Поле пошуку
    ├── SearchBar.css         # Стилі пошуку
    ├── ProcessStats.js       # Статистика
    └── ProcessStats.css      # Стилі статистики
```

### Data Flow Frontend

```
┌─────────────────┐
│   App Component │ (main state holder)
└────────┬────────┘
         │
    ┌────┴─────────────────────────┐
    │                              │
    ▼                              ▼
┌──────────────┐         ┌─────────────────┐
│  SearchBar   │         │  ProcessTable   │
│  (input)     │         │  (display)      │
└──────────────┘         └────────┬────────┘
                                  │
                          ┌───────┴────────┐
                          │                │
                          ▼                ▼
                     ┌────────────┐  ┌──────────┐
                     │ProcessStats│  │Kill Btn  │
                     │(dashboard) │  │(action)  │
                     └────────────┘  └──────────┘
```

### State Management

```javascript
// App.js useState hooks
const [processes, setProcesses] = useState([])          // API data
const [filteredProcesses, setFilteredProcesses] = useState([])  // Filtered
const [searchTerm, setSearchTerm] = useState('')        // Search query
const [sortBy, setSortBy] = useState('pid')             // Sort field
const [sortOrder, setSortOrder] = useState('asc')       // Sort direction
const [refreshInterval, setRefreshInterval] = useState(5)  // Auto-refresh
```

### Lifecycle

```
1. Component Mount → fetchProcesses() & fetchStats()
2. Auto-refresh interval triggered
3. Filter & Sort processes based on state
4. Re-render with new data
5. User interaction → Update state → Re-render
```

## 🖥 Backend Architecture (Node.js/Express)

### Структура файлів

```
backend/
├── server.js         # Express server & API endpoints
├── db.js             # File-based database logic
├── package.json      # Dependencies
├── .env              # Configuration
├── node_modules/     # Dependencies
└── data/
    └── snapshots.json # Stored snapshots
```

### API Endpoints

```
GET  /api/health                  # Server health check
GET  /api/processes               # List all processes
GET  /api/processes/:pid          # Single process info
POST /api/processes/:pid/kill     # Terminate process
GET  /api/stats                   # System statistics
GET  /api/snapshots               # List all snapshots
POST /api/snapshots               # Create snapshot
GET  /api/snapshots/:id           # Get snapshot by ID
```

### Request-Response Flow

```
┌─────────────┐
│React Client │
└──────┬──────┘
       │ HTTP Request
       │ (axios)
       ▼
┌─────────────────┐
│  Express App    │
└──────┬──────────┘
       │
   ┌───┴────────┐
   │             │
   ▼             ▼
┌──────────┐  ┌──────────┐
│Process   │  │Database  │
│Commands  │  │(FileDB)  │
│(ps aux)  │  │JSON      │
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            │ Data
            ▼
      ┌───────────┐
      │Response   │
      │(JSON)     │
      └─────┬─────┘
            │
       ▼────────────
   React Component
   (Re-renders)
```

### Обробка процесів

```javascript
// Linux command execution
exec('ps aux', (error, stdout, stderr) => {
  // Parse output
  // Split by lines
  // Extract fields (user, pid, %cpu, %mem, vsz, rss, tty, stat, start, time, command)
  // Return array of process objects
})
```

## 💾 Database Architecture (File-based)

### Storage Strategy

```
backend/data/
└── snapshots.json

[
  {
    "id": 1,
    "name": "Morning Snapshot",
    "description": "System state at 9:00 AM",
    "data": "ps aux output...",
    "created_at": "2025-11-29T10:00:00Z",
    "updated_at": "2025-11-29T10:00:00Z"
  },
  ...
]
```

### FileDB Class Methods

```javascript
query(sql, params)          // Unified query interface
_readSnapshots()            // Read JSON from file
_writeSnapshots(data)       // Write JSON to file
```

## 🔄 Data Flow (Complete)

```
┌──────────────────────────────────────────────────────────┐
│                   SYSTEM PROCESSES                        │
│                    Linux kernel                           │
│                    ps aux output                          │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  Backend Server  │
         │  Express + Node  │
         └────────┬─────────┘
                  │
         ┌────────┴──────────┐
         │                   │
         ▼                   ▼
    ┌─────────────┐    ┌──────────────┐
    │ Parse Data  │    │FileDB (JSON) │
    │ Process     │    │Store Snapshot│
    │ Format JSON │    │Retrieve Data │
    └────────┬────┘    └──────────────┘
             │                │
             └────────┬───────┘
                      │
                      ▼
            ┌──────────────────┐
            │   HTTP/REST      │
            │   JSON Response  │
            └────────┬─────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   Frontend (React)    │
          │   axios API call      │
          └────────┬──────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
    ┌─────────────┐    ┌─────────────┐
    │Filter/Sort  │    │Update State │
    │Process List │    │Hooks        │
    └─────────────┘    └─────────────┘
         │                    │
         └─────────┬──────────┘
                   │
                   ▼
        ┌────────────────────┐
        │  Render UI         │
        │  ProcessTable      │
        │  SearchBar         │
        │  ProcessStats      │
        └────────────────────┘
```

## 🎯 Component Interaction

### ProcessTable ↔ App

```
App (parent)
  │
  ├─ processes: []           → ProcessTable (props)
  ├─ sortBy: 'pid'           → ProcessTable (props)
  ├─ sortOrder: 'asc'        → ProcessTable (props)
  ├─ onSort: function        → ProcessTable (props)
  └─ onKill: function        → ProcessTable (props)
       │
       └─ User clicks kill button
          → onKill(pid)
             → axios.post(/api/processes/:pid/kill)
                → fetchProcesses()
                   → setProcesses(newData)
```

### SearchBar ↔ App

```
App (parent)
  │
  ├─ searchTerm: string      → SearchBar (props)
  └─ setSearchTerm: function → SearchBar (props)
       │
       └─ User types
          → setSearchTerm(value)
             → useEffect triggers
                → Filter processes
                   → setFilteredProcesses()
```

## ⚙️ Performance Considerations

### Frontend Optimization
- ✅ React.memo for components (optional)
- ✅ useCallback for handlers
- ✅ Debounce search input
- ✅ Virtual scrolling for large lists (future)

### Backend Optimization
- ✅ Connection pooling ready (if using DB)
- ✅ Error handling
- ✅ Input validation

## 🔐 Security Flow

```
User Action
    │
    ▼
Input Validation (Frontend)
    │
    ├─ Check PID is valid number
    ├─ Confirm action
    │
    ▼
API Request with params
    │
    ▼
Backend Validation
    │
    ├─ Validate PID: isNaN, < 1
    ├─ Execute command with escaped params
    │
    ▼
Execute System Command
    │
    └─ kill -9 <PID>
```

## 📊 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI Components |
| Frontend | Axios | HTTP Client |
| Frontend | CSS3 | Styling |
| Backend | Node.js | Runtime |
| Backend | Express.js | Framework |
| Backend | child_process | System Commands |
| Storage | JSON File | Data Persistence |
| Comm. | REST API | Client-Server |
| Format | JSON | Data Exchange |

---

**End of Architecture Document**
