const mongoose = require("mongoose");
const mongourl = process.env.mongoURL;

module.exports = {
    name: "ready",
        once: true,
        async execute(client) {
    // Connect to MongoDB
    if (!mongourl) return;
    await mongoose.connect(mongourl || '', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
  
      if (mongoose.connect){
      console.log("Connected to MongoDB");
      } else {
      console.log("Failed to connect to MongoDB");
      }
    }
}