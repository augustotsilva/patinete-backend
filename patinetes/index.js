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

app.get("/patinete/:id", async (req, res) => {
  const patinete = await prisma.patinete.findUnique({
    where: { id: req.params.id },
  });
  if (!patinete) return res.status(404).send("Patinete not found!");
  return res.send(patinete);
});

const schema = Joi.object({
  status: Joi.string().required().valid("DISPONIVEL", "ALUGADO", "INATIVO"),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  rentAt: Joi.date().iso().optional().allow(null),
});

app.post("/patinete", async (req, res) => {
  const patineteData = {
    status: req.body.status,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    rentAt: req.body.rentAt,
  };
  const { error } = schema.validate(patineteData);
  if (error) return res.status(400).send(error.details[0].message);

  if (!isNaN(new Date(patineteData.rentAt))) {
    const rentAt = new Date(patineteData.rentAt);
    const patinete = await prisma.patinete.create({
      data: { ...patineteData, rentAt },
    });
    return res.status(201).send(patinete);
  }

  const patinete = await prisma.patinete.create({
    data: patineteData,
  });
  return res.status(201).send(patinete);
});

app.put("/patinete/:id", async (req, res) => {
  const patinete = await prisma.patinete.findUnique({
    where: { id: req.params.id },
  });
  if (!patinete) return res.status(404).send("Patinete not found!");

  const patineteData = {
    status: req.body.status,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    rentAt: req.body.rentAt,
  };
  const { error } = schema.validate(patineteData);
  if (error) return res.status(400).send(error.details[0].message);

  if (!isNaN(new Date(patineteData.rentAt))) {
    const rentAt = new Date(patineteData.rentAt);
    const updated = await prisma.patinete.update({
      where: { id: patinete.id },
      data: {
        ...patineteData,
        rentAt,
      },
    });
    return res.send(updated);
  }
  const updated = await prisma.patinete.update({
    where: { id: patinete.id },
    data: patineteData,
  });
  return res.status(201).send(updated);
});

app.delete("/patinete/:id", async (req, res) => {
  const patinete = await prisma.patinete.findUnique({
    where: { id: req.params.id },
  });
  if (!patinete) return res.status(404).send("Patinete not found!");

  await prisma.patinete.delete({
    where: { id: req.params.id },
  });
  return res.status(204).send([]);
});

app.listen(process.env.PORT || 3001);
