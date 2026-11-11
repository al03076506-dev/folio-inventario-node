const mongoose = require('mongoose');
const config = require('./config');
let connecting;
module.exports = async function connectDB() {
 if (mongoose.connection.readyState === 1) return;
 if (!connecting) connecting = mongoose.connect(config().mongoUri, { serverSelectionTimeoutMS: 5000 }).catch(error => { connecting = null; throw error; });
 await connecting;
};
