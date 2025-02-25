import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import indexRouter from "./routes/routes";
dotenv.config();



const app = express();

app.use(helmet());
app.use(cors({
    credentials: true,
}));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());

app.use("/", indexRouter);
app.get("/", (req, res) => {
  res.send("Hello World TypeScript");
});


const server = http.createServer(app);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
