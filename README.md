# 🎩 myCloset Backend

Welcome to the **myCloset Backend** repository! This backend, powered by **Node.js**, **Express** and **MongoDB Atlas**, forms the core of the *myCloset* fashion app,managing everything from user authentication and wardrobe management to outfit planning and advanced image processing for clothing and color recognition.

- 🔗 **Frontend Repository**: [myCloset Frontend](https://github.com/AlaaMuhissen/myCloset_frontend)
- 🔗 **Machine Leaning Repository**: [myCloset ML](https://github.com/AlaaMuhissen/myCloset_ML)

## 📑 Table of Contents
- [✨ Features](#features)
- [🚀 Technologies](#technologies)
- [⚙️ Setup](#setup)
- [🔑 Environment Variables](#environment-variables)
- [🌐 API Endpoints](#api-endpoints)
- [📈 Usage](#usage)
- [🤝 Contributing](#contributing)

---

### ✨ Features
- **User Authentication**: Integrated with Firebase (transitioning to Clerk), linking users to MongoDB for secure, seamless access.
- **Wardrobe Management**: Full CRUD operations to add, delete, and view clothing, accessories, and more.
- **Outfit Planning**: Allows users to plan stylish, season-appropriate outfits, ensuring a balanced and aesthetically cohesive combination of clothing items.
- **Image Processing**: Communicates with our dedicated machine learning repository to analyze images, enabling clothing and color recognition for more intuitive wardrobe management.
- **Statistics & Tracking**: Provides insights on frequently worn items over specific time periods, maximizing wardrobe utility.

### 🚀 Technologies
- **Node.js & Express**: The backbone of the server-side application, enabling efficient request handling.
- **MongoDB Atlas**: A cloud-based, scalable database for storing user data, wardrobe items, and statistics.
- **Firebase / Clerk Authentication**: Provides secure user authentication.
- **Docker**: Containerized development for easy deployment and consistency.
- **AWS**: Optional integration for secure file storage.

---

### ⚙️ Setup
1. **Clone the Repository**
   ```bash
   git clone https://github.com/AlaaMuhissen/myCloset_backend.git
   cd myCloset_backend
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Run the Backend**
   ```bash
   npm start
   ```

---

### 🔑 Environment Variables
Create a `.env` file in the root directory with the following variables:

| Variable            | Description                                |
|---------------------|--------------------------------------------|
| `DATABASE_URL`      | MongoDB Atlas connection string            |
| `FIREBASE_API_KEY`  | Firebase API key (or Clerk credentials)    |
| `AWS_S3_BUCKET`     | (Optional) AWS bucket for file uploads     |
| `CLOTHES_API_URL`   | Endpoint for image processing integration  |

---

### 🌐 API Endpoints

**Authentication**
- `POST /auth/register`: Register a new user
- `POST /auth/login`: User login

**Wardrobe Management**
- `POST /api/items`: Add a clothing item
- `GET /api/items`: Retrieve all items
- `GET /api/items/:id`: Retrieve a single item by ID
- `PUT /api/items/:id`: Update an item by ID
- `DELETE /api/items/:id`: Delete an item by ID

**Outfit Management**
- `POST /api/outfits`: Create a new outfit
- `GET /api/outfits`: Retrieve all outfits
- `GET /api/outfits/:id`: Retrieve a single outfit by ID
- `PUT /api/outfits/:id`: Update an outfit by ID
- `DELETE /api/outfits/:id`: Delete an outfit by ID

**Statistics**
- **Wearable Items Statistics**
  - `GET /api/statistics/wearable-items` - Retrieve data on frequently worn items.
  - `POST /api/statistics/wearable-items` - Add new data for wearable item statistics.
  - `PUT /api/statistics/wearable-items/:id` - Update wearable item statistics by ID.

- **Seasonal Outfits Statistics**
  - `GET /api/statistics/seasonal-outfits` - Retrieve statistics on the number of outfits created per season.
  - `POST /api/statistics/seasonal-outfits` - Add data for seasonal outfit statistics.
  - `PUT /api/statistics/seasonal-outfits/:id` - Update seasonal outfit statistics by ID.

- **Item Types Statistics**
  - `GET /api/statistics/item-types` - Retrieve a breakdown of different item types in the wardrobe.
  - `POST /api/statistics/item-types` - Add new data for item type statistics.
  - `PUT /api/statistics/item-types/:id` - Update item type statistics by ID.

- **Wardrobe Usage Summary**
  - `GET /api/statistics/usage-summary` - Retrieve an overall summary of wardrobe usage, including frequently worn and least-used items.
  - `POST /api/statistics/usage-summary` - Add summary data for wardrobe usage.
  - `PUT /api/statistics/usage-summary/:id` - Update the wardrobe usage summary by ID.

---

### 📈 Usage
To see the backend in action:
1. Run the backend following the setup instructions above.
2. Ensure your frontend (React Native) and Python ML service are configured to communicate with this backend via the provided API endpoints.
3. Test API requests from the frontend to manage wardrobe items, plan outfits, and more.

---

### 🤝 Contributing
We welcome all contributions! Here’s how to get started:
1. **Fork** this repository.
2. **Create a branch**: `git checkout -b feature-name`
3. **Make your changes** and **commit**: `git commit -m 'Add feature'`
4. **Push to your branch**: `git push origin feature-name`
5. **Open a Pull Request**

Thank you for helping make *myCloset* even better! 😊

---
