# File Management System

This project is a backend implementation for managing files using Node.js, Mongoose, Joi for validation, and Supabase for file storage.

## Features
- File upload to Supabase storage
- Data validation using Joi
- MongoDB integration using Mongoose
- RESTful API endpoints

## Prerequisites
Ensure you have the following installed:
- Node.js (v14 or later)
- MongoDB
- A Supabase account

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd <project-folder>
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory with the following:
   ```env
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_API_KEY=<your-supabase-api-key>
   MONGODB_URI=<your-mongodb-uri>
   ```

## Project Structure
```
project-folder/
├── model/
│   ├── file.model.js         # Mongoose schema and Joi validation for file
│   ├── user.model.js         # Mongoose schema and Joi validation for user
├── controllers/
│   ├── file.controller.js    # Logic for handling file-related operations
│   ├── user.controller.js    # Logic for handling user-related operations
├── routes/
│   ├── file.routes.js        # Routes for file operations
│   ├── user.routes.js        # Routes for user operations
├── app.js                    # Express app setup
├── .env                      # Environment variables
├── package.json              # Dependencies and scripts
└── README.md                 # Project documentation
```

## Usage
1. Start the development server:
   ```bash
   npm start
   ```

2. API Endpoints:

### User Endpoints
- **Create User**
  ```http
  POST /users
  ```
  Request Body:
  ```json
  {
    "fullname": "John Doe",
    "companyName": "Tech Corp",
    "role": "Developer",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "websiteLink": "https://example.com",
    "fileId": "<file-id>"
  }
  ```

### File Endpoints
- **Create File**
  ```http
  POST /files
  ```
  Request Body:
  ```json
  {
    "lookingFor": "IT Services",
    "description": "Need IT support for a project",
    "communicationChannel": "email",
    "files": [<file-data>]
  }
  ```

## Technologies Used
- **Node.js**: Backend framework
- **Express**: API framework
- **Mongoose**: MongoDB ORM
- **Joi**: Data validation
- **Supabase**: File storage

## License
This project is licensed under the MIT License.

## Contributions
Contributions are welcome! Please fork the repository and submit a pull request.

## Contact
For questions or support, contact the maintainer at [your-email@example.com].

## after rollback commit first with rollback-b branch
## in this commit i merge some branch with rollback-b