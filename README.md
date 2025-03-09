# Event Scheduler

A robust event scheduling application built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication:**  
  - Secure signup/login with password hashing and JWT-based session management.  
  - Personalized user dashboard upon login.

- **Global & Private Task Management:**  
  - **Global Tasks:**  
    - Accessible to every user.  
    - Create, edit, and delete tasks stored in a shared repository.
  - **Private Tasks:**  
    - Manage tasks specific to each user.  
    - Only accessible by the task owner.
  - **Task Details:**  
    - Unique identifier, description, estimated duration, dependencies, and timing relative to the event date.

- **Event Management:**  
  - Create, edit, and delete multiple events.  
  - Each event includes a unique title, description, event date, and additional metadata.
  - Assign tasks (global or private) to events with options to customize task details for the event.

- **Scheduling & Time Calculation:**  
  - Compute an ordered list of tasks based on dependencies.  
  - Calculate the minimum total time required to complete all tasks (supporting parallel execution of independent tasks).  
  - Display individual task schedules along with overall event plan start and end dates.
  - Detect and notify users of cyclic dependencies with clear error messages.

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance

## 🛠️ Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/fathima-nihala/Event-Scheduler.git
   cd Event-Scheduler

2. **Install dependencies:**

npm install
# or
yarn install

# 🚀 Development

npm run dev


# 📚 Tech Stack

Core
Node.js
Express
MongoDB & Mongoose
Authentication & Security
JWT for session management
bcrypt for password hashing
Task & Event Management
RESTful API design for task and event operations
Scheduling & Calculations
Custom algorithms to compute task execution order and time estimations

# 📄 License
This project is private and not licensed for public use.

# 🤝 Contributing
This is a private project. Contact the project maintainers for contribution guidelines.