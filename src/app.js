const express = require('express');
const app = express();
const path = require('path');
// Middlewares
app.use(express.json());

app.use((req, res, next) => {
    
    console.log("Incoming:", req.method, req.url);
    res.setHeader("Access-Control-Allow-Origin", "*"); // only for dev
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });
  
 // Serve .well-known folder statically
app.use('/.well-known', express.static(path.join(__dirname, '../.well-known'))); 
// Routes
const loginRoutes = require('./routes/loginRoutes');
app.use('/api/login', loginRoutes);

const registerUserRoutes = require('./routes/registerUserRoutes');
app.use('/api/registerUser', registerUserRoutes);

const otpRoutes = require('./routes/otpRoutes');
app.use('/api/sendotp', otpRoutes);

const otpVerifyRoutes = require('./routes/otpVerifyRoutes');
app.use('/api/verifyOTP', otpVerifyRoutes);

const activityRoutes = require('./routes/activityRoutes');
app.use('/api/activity', activityRoutes);

const groupRoutes = require('./routes/groupRoutes');
app.use('/api/group', groupRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/task', taskRoutes);

const subscriptionRoutes = require("./routes/subscription");
app.use("/api/subscriptionupdate", subscriptionRoutes);

const linkDataUpdateRoutes = require("./routes/linkDataUpdateRoutes");
app.use("/api/link-data", linkDataUpdateRoutes);

// Error handling middleware
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
