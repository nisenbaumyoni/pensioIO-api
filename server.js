import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { pensionRoutes } from "./api/pension/pension.routes.js";
import { userRoutes } from "./api/user/user.routes.js";
import { authRoutes } from "./api/auth/auth.routes.js";
import { loggerService } from "./services/logger.service.js";

loggerService.info('Starting up the server...new');

const app = express();
const port = process.env.PORT;

const corsOptions = {
  origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  credentials: true,
};

loggerService.info('CORS options set...');

app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/pension", pensionRoutes);
app.use("/api/auth", authRoutes);

app.get("/**", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
