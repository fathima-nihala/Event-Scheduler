const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
require('dotenv').config();
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const eventRoutes = require("./routes/eventRoutes");
const cookieParser = require('cookie-parser');

const dotenvConfig = dotenv.config({
    path: path.resolve(__dirname, './config', '.env')
})

if (dotenvConfig.error) {
    console.log('Error Loading .env file', dotenvConfig.error);
}


const app = express();
app.use(cookieParser());


app.use(cors({
    // origin: 'https://event-scheduler-qpnt.vercel.app',
    origin:'http://localhost:5173',
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'] 
  }));

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL, {
}).then(() => {
    console.log("Database is connected successfully 😎 ");
    app.listen(process.env.PORT, () => {
        console.log(`Server connected at 🖥️ ${process.env.PORT}`);
    });
}).catch(error => {
    console.error('Database connection error:', error);
    process.exit(1);  
});

app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/event", eventRoutes);


module.exports = app;