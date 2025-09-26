# Novavantix Project Management System

A modern task and project management system built with **Next.js** (frontend) and **FastAPI with Python** (backend). Features secure user authentication, role-based access control, comprehensive task management, and a beautiful responsive UI.

## 🚀 About

The Novavantix Project Management System is designed to streamline project workflows and task management for teams of any size. Built with cutting-edge technologies, it provides a secure, intuitive environment where administrators can orchestrate projects and assign tasks, while team members can efficiently manage their workload. The system emphasizes real-time collaboration, smart search capabilities, and a responsive design that works seamlessly across all devices.

## ✨ Features

### 🔐 Authentication & Security
- **Secure Authentication**: JWT-based login and registration system
- **Role-Based Access Control**: Distinct admin and member permissions
- **OAuth2 Integration**: Industry-standard security protocols

### 📋 Task Management
- **Complete CRUD Operations**: Create, read, update, and delete tasks
- **Status Tracking**: Three-stage workflow (To Do, In Progress, Done)
- **Due Date Management**: Set and track task deadlines
- **Smart Assignment**: Assign tasks to specific team members
- **Real-time Updates**: Instant status synchronization

### 🏗️ Project Organization
- **Project Creation**: Organize tasks within dedicated projects
- **Project Descriptions**: Detailed project information and context
- **Search & Filter**: Quick project discovery by name
- **Member Management**: Control project access and permissions

### 💻 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Loading States**: Smooth user interactions with visual feedback
- **Error Handling**: Comprehensive error management and user notifications

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - Modern React with hooks and state management
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling framework

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Pydantic** - Data validation and settings management
- **JWT** - JSON Web Token authentication

### Database
- **SQL Database** - Flexible database support (SQLite for development)
- **Alembic** - Database migration tool

## 📦 Installation

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v18 or higher) and **npm**
- **Python** (v3.9 or higher)
- **pip** (Python package manager)
- **Git** for version control

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Tharushi-Umesha/novavantix_project.git
   cd novavantix_project
   ```

2. **Backend Setup**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Create virtual environment (recommended)
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   SECRET_KEY=your-super-secure-secret-key-here
   JWT_EXPIRATION_MINUTES=1440
   DATABASE_URL=sqlite:///./app.db
   CORS_ORIGINS=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Initialize and run database migrations
   python db.py
   
   # Or if using Alembic:
   alembic upgrade head
   ```

5. **Frontend Setup**
   ```bash
   # Navigate to project root (or frontend directory)
   cd ..
   
   # Install dependencies
   npm install
   
   # Set up environment variables (if needed)
   cp .env.example .env.local
   ```

6. **Start the Application**
   ```bash
   # Start backend server (from backend directory)
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # Start frontend server (from project root in new terminal)
   npm run dev
   ```

7. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs

## 🎯 Usage

### Getting Started
1. **Registration**: Create a new account or use demo credentials
2. **Login**: Access the system with your credentials
3. **Dashboard**: View your projects and tasks overview

### Demo Accounts
- **Admin**: `admin@demo.test` / `password`
- **Member**: `member@demo.test` / `password`

### Admin Features
- Create and manage projects
- Assign tasks to team members
- Monitor project progress
- Manage user permissions

### Member Features
- View assigned tasks and projects
- Update task statuses
- Track personal progress
- Collaborate within assigned projects

### Key Workflows
1. **Project Creation**: Admin creates project with description
2. **Task Assignment**: Tasks are created and assigned to members
3. **Progress Tracking**: Members update task statuses as work progresses
4. **Project Completion**: All tasks marked as "Done" indicates project completion

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Process
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Reporting Issues
- Use the GitHub Issues tab to report bugs
- Provide detailed reproduction steps
- Include system information and error messages
- Suggest improvements and new features

## 📄 API Documentation

The backend API is fully documented with interactive Swagger UI:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /tasks` - List tasks
- `POST /tasks` - Create task
- `PUT /tasks/{id}` - Update task

## 🚀 Deployment

### Production Considerations
- Use a production-grade database (PostgreSQL, MySQL)
- Set up environment variables securely
- Configure CORS for your domain
- Use HTTPS in production
- Set up proper logging and monitoring

### Environment Variables
```env
# Security
SECRET_KEY=your-production-secret-key
JWT_EXPIRATION_MINUTES=1440

# Database
DATABASE_URL=postgresql://user:password@localhost/dbname

# CORS
CORS_ORIGINS=https://yourdomain.com

# Optional
DEBUG=false
LOG_LEVEL=info
```

## 📋 Roadmap

### Upcoming Features
- [ ] Email notifications for task assignments
- [ ] File attachments for tasks
- [ ] Time tracking and reporting
- [ ] Calendar integration
- [ ] Team chat functionality
- [ ] Advanced analytics dashboard
- [ ] Mobile application

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced UI and search functionality (Planned)
- **v1.2.0** - Advanced reporting features (Planned)

## 📞 Support & Contact

- **Email**: umemahee@gmail.com
- **GitHub Issues**: [Report bugs or request features](https://github.com/Tharushi-Umesha/novavantix_project/issues)
- **Discussions**: [Community discussions and Q&A](https://github.com/Tharushi-Umesha/novavantix_project/discussions)

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Tharushi Umesha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

- **Built with ❤️** on September 27, 2025, at 01:35 AM IST by **Tharushi Umesha**
- Thanks to the amazing open-source community for:
  - [Next.js](https://nextjs.org/) - The React Framework
  - [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [SQLAlchemy](https://www.sqlalchemy.org/) - Python SQL toolkit

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/Tharushi-Umesha/novavantix_project)
![GitHub forks](https://img.shields.io/github/forks/Tharushi-Umesha/novavantix_project)
![GitHub issues](https://img.shields.io/github/issues/Tharushi-Umesha/novavantix_project)
![GitHub license](https://img.shields.io/github/license/Tharushi-Umesha/novavantix_project)

---

<div align="center">
  <strong>Built with passion for efficient project management</strong><br>
  © 2025 Tharushi Umesha. All rights reserved.
</div>
