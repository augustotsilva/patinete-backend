import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";

const app = express();

app.use(cors());
app.use(bodyParser.json());

const prisma = new PrismaClient();

app.get("/patinete", async (req, res) => {
  const patinetes = await prisma.patinete.findMany();
  return res.send(patinetes);
});

const schema = Joi.object({
  status: Joi.string().required().valid("DISPONIVEL", "ALUGADO", "INATIVO"),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
});

app.post("/patinete", async (req, res) => {
  const patineteData = {
    status: req.body.status,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  };
  const { error } = schema.validate(patineteData);
  if (error) return res.status(400).send(error.details[0].message);

  const patinete = await prisma.patinete.create({
    data: patineteData,
  });
  return res.status(201).send(patinete);
});

app.listen(process.env.PORT || 3001);
