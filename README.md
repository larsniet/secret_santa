# Secret Santa App

A modern web application for organizing Secret Santa gift exchanges with your friends, family, or colleagues. Built with React, TypeScript, Node.js, and MongoDB.

## Features

- 🎁 Create and manage Secret Santa sessions
- 👥 Invite participants via email
- 🎯 Set gift preferences and wishlists
- 🎲 Automatic random assignment of gift pairs
- 🔒 Secure authentication system
- 📱 Responsive design for all devices

## Tech Stack

### Frontend

- React 18
- TypeScript
- React Router v6
- Tailwind CSS
- Axios for API calls
- Jest & React Testing Library

### Backend

- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Email service integration

## Project Structure

```
secret_santa/
├── backend/         # Express.js backend
├── frontend/        # React frontend
└── README.md       # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm
- MongoDB instance
- SMTP server for emails

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd secret_santa
   ```

2. **Backend Setup**

   ```bash
   cd backend
   pnpm install

   # Create .env file:
   touch .env
   echo "MONGODB_URI=your_mongodb_connection_string" >> .env
   echo "PORT=5001" >> .env
   echo "SMTP_HOST=smtp.provider.com" >> .env
   echo "SMTP_PORT=465" >> .env
   echo "SMTP_USER=your_email" >> .env
   echo "SMTP_PASS=your_password" >> .env
   echo "SMTP_FROM=\"Father Christmas <your_email>\"" >> .env

   # Start development server
   pnpm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   pnpm install

   # Create .env.local file:
   touch .env.local
   echo "REACT_APP_API_URL=http://localhost:5001/api" >> .env.local

   # Start development server
   pnpm run dev
   ```

## Testing

### Frontend Tests

```bash
cd frontend
pnpm test
```

The frontend includes comprehensive tests for:

- Authentication flows
- Session management
- Participant interactions
- UI components

### Backend Tests

```bash
cd backend
pnpm test
```

## Deployment

### Backend Deployment (Render.com)

1. Create a new Web Service on Render
2. Configure build settings:
   - Build Command: `pnpm install`
   - Start Command: `node server.js`
   - Root Directory: `backend`
3. Add environment variables as listed in the Backend Setup section

### Frontend Deployment (Render.com)

1. Create a new Static Site on Render
2. Configure build settings:
   - Build Command: `pnpm install && pnpm run build`
   - Publish Directory: `build`
   - Root Directory: `frontend`
3. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

## Environment Variables

### Backend (.env)

```
MONGODB_URI=your_mongodb_connection_string
PORT=5001
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=your_email
SMTP_PASS=your_password
SMTP_FROM="Father Christmas <your_email>"
```

### Frontend

Development (.env.local):

```
REACT_APP_API_URL=http://localhost:5001/api
```

Production (.env.production.local):

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Security Notes

- Never commit sensitive environment variables
- Keep your MongoDB connection string secure
- Use HTTPS in production
- Regularly update dependencies

## License

This project is licensed under the MIT License - see the LICENSE file for details.
