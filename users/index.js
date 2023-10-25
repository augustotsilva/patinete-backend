import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/user", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT);
