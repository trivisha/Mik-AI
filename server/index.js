const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Root route
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// Routes
const chatRoutes = require("./routes/chatRoutes"); // if you need this later
const togetherRoutes = require("./routes/togetherRoutes");

app.use("/api/chat", chatRoutes); // optional (currently unused)
app.use("/api/together", togetherRoutes); // ✅ MAIN AI route

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


