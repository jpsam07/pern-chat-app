import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const app = express();

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(7000, () => {
    console.log("Server is running on port 7000");
});