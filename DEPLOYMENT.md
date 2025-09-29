# MERN Stack Application Deployment Guide

## Quick Start Instructions

### 1. Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud)
- Git

### 2. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/6829nkhpas/mern_test.git
cd mern_test

# Install all dependencies
npm run install-all

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Create admin user
npm run setup
```

### 3. Development Mode

```bash
# Terminal 1: Start backend (from root directory)
npm run dev

# Terminal 2: Start frontend (from root directory)
npm run client
```

### 4. Production Deployment

#### Option A: Same Server (Recommended for testing)

```bash
# Build frontend
cd client && npm run build && cd ..

# Start production server
npm start
```

#### Option B: Separate Deployment

Deploy backend and frontend separately to different services (Heroku, Vercel, etc.)

## Default Login Credentials

- **Email**: admin@example.com
- **Password**: admin123

## Application Features Checklist

✅ User Authentication with JWT  
✅ Agent CRUD Operations  
✅ CSV/Excel File Upload  
✅ Automatic List Distribution  
✅ Dashboard with Statistics  
✅ Responsive UI Design  
✅ File Validation & Error Handling  
✅ Protected Routes

## Testing the Application

1. **Login**: Use admin credentials
2. **Add Agents**: Create 5 test agents
3. **Upload File**: Use the provided `sample-data.csv`
4. **View Distribution**: Check how 15 items are distributed among 5 agents
5. **Dashboard**: Verify statistics update correctly

## File Upload Test

- Use `sample-data.csv` (included)
- Contains 15 sample records
- Tests equal distribution logic

## Production Considerations

- Use environment variables for all secrets
- Enable CORS for your domain only
- Use HTTPS in production
- Set up proper MongoDB indexes
- Implement rate limiting
- Add input sanitization
- Set up logging and monitoring

## Support

For issues or questions, check the main README.md file for detailed documentation.
