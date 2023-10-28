import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/controle/:id", (req, res) => {
  if (req.query.type !== "start" && req.query.type !== "end")
    return res
      .status(400)
      .send("Please include a query string parameter at the request URL");

  res.send({ idPatinete: req.params.id, type: req.query.type });
});

app.listen(process.env.PORT || 3003);
