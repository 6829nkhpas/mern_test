# MERN Stack Agent Management System

A full-stack web application built with MongoDB, Express.js, React.js, and Node.js for managing agents and distributing CSV lists among them.

## Features

### 1. User Authentication

- Admin login with JWT authentication
- Secure password hashing using bcrypt
- Protected routes and API endpoints

### 2. Agent Management

- Create, read, update, and delete agents
- Each agent has: Name, Email, Mobile Number, Password
- Agent status management (Active/Inactive)

### 3. CSV Upload & Distribution

- Upload CSV, XLS, or XLSX files
- Automatic validation of file format and content
- Equal distribution of items among active agents
- Support for files with columns: FirstName, Phone, Notes
- Handles remainder distribution intelligently

### 4. Dashboard

- Overview statistics (total agents, lists, items)
- Recent uploads display
- Real-time data updates

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: React.js with React Router
- **Authentication**: JWT (JSON Web Tokens)
- **File Processing**: Multer, csv-parser, xlsx
- **Styling**: Custom CSS with responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mern_test
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration
```

### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Return to root directory
cd ..
```

### 4. Database Setup

```bash
# Make sure MongoDB is running locally, then create admin user
node setup-admin.js
```

This will create an admin user with:

- Email: admin@example.com
- Password: admin123

### 5. Running the Application

#### Development Mode (Recommended)

```bash
# Terminal 1: Start backend server
npm run dev

# Terminal 2: Start frontend development server
cd client
npm start
```

#### Production Mode

```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

The application will be available at:

- Frontend: http://localhost:3000 (development) or http://localhost:5000 (production)
- Backend API: http://localhost:5000

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new admin (optional)
- `GET /api/auth/verify` - Verify JWT token

### Agents

- `GET /api/agents` - Get all agents
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `GET /api/agents/:id` - Get single agent

### Lists

- `GET /api/lists` - Get all uploaded lists
- `POST /api/lists/upload` - Upload and distribute CSV file
- `GET /api/lists/:id` - Get single list with distributions
- `DELETE /api/lists/:id` - Delete list

## File Upload Requirements

### Supported Formats

- CSV (.csv)
- Excel (.xlsx, .xls)

### Required Columns

Your file must contain these columns (case-insensitive):

- `FirstName` or `First Name` - Contact's first name
- `Phone` or `Mobile` - Contact's phone number
- `Notes` - Additional notes (optional)

### Example CSV Format

```csv
FirstName,Phone,Notes
John,+1234567890,Interested in product A
Jane,+1234567891,Follow up next week
Mike,+1234567892,Potential customer
```

### File Limitations

- Maximum file size: 5MB
- Must have at least FirstName and Phone columns
- Phone numbers should include country codes

## Distribution Logic

The system distributes list items equally among all active agents:

1. **Equal Distribution**: Items are divided equally among agents
2. **Remainder Handling**: If items don't divide evenly, remaining items are distributed sequentially
3. **Example**: 13 items with 5 agents = 2 items each for first 3 agents, 3 items each for last 2 agents

## Project Structure

```
mern_test/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── App.js
│   └── package.json
├── models/                 # MongoDB models
│   ├── User.js
│   ├── Agent.js
│   └── List.js
├── routes/                 # Express routes
│   ├── auth.js
│   ├── agents.js
│   └── lists.js
├── middleware/             # Custom middleware
│   └── auth.js
├── uploads/                # Temporary file uploads
├── server.js               # Express server
├── setup-admin.js          # Admin setup script
├── sample-data.csv         # Sample CSV file
└── package.json
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern_test
JWT_SECRET=your_jwt_secret_key_here_make_it_very_long_and_random
CLIENT_URL=http://localhost:3000
```

## Usage Instructions

1. **Login**: Use admin credentials to access the system
2. **Add Agents**: Navigate to Agents section and create new agents
3. **Upload Lists**: Go to Lists section and upload CSV files
4. **View Distribution**: See how items are distributed among agents
5. **Dashboard**: Monitor overall system statistics

## Sample Data

A sample CSV file (`sample-data.csv`) is included for testing the upload functionality.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- File upload validation and size limits
- CORS protection
- Environment variables for sensitive data

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running locally
   - Check MONGODB_URI in .env file

2. **File Upload Issues**

   - Verify file format (CSV, XLS, XLSX only)
   - Check file size (max 5MB)
   - Ensure required columns exist

3. **Port Already in Use**
   - Change PORT in .env file
   - Kill processes using the port

## License

This project is licensed under the MIT License.
