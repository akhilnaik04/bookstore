const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const bookRoutes = require("./routes/book-routes");

dotenv.config();
const app = express();

app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API routes
app.use("/api/books", bookRoutes);

// ✅ Default route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// ✅ Start the server
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
