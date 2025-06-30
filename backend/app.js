require("dotenv").config();
const express = require("express");
const app = express();
const { sequelize } = require("./models");
const documentRoutes = require("./routes/documentRoutes");
const authRoutes = require("./routes/authRoutes");

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

sequelize.sync().then(() => {
  console.log("DB synced.");
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
