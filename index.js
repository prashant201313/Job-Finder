const express = require('express');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const authMiddleware = require('./middlewares/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:5000",
    credentials: true
}));
app.use(express.json());

// log every incoming request
app.use((req, res, next) => {
    const log = `${req.method} - ${req.url} - ${req.ip} - ${new Date()}\n`;
    fs.appendFile("log.txt", log, (err) => {
        if(err) {
            console.log(err);
        }
    });
    next();
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", authMiddleware, jobRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

//error handling middleware
app.use((err, req, res, next) => {
    let log;
    log = err.stack;
    log += `${req.method} - ${req.url} - ${req.ip} - ${new Date()}\n\n`;
    fs.appendFile("error.txt", log, (err) => {
        if(err) {
            console.log(err);
        }
    });
    res.status(500).send("Something went wrong!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
