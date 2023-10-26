import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import { schema } from "./userSchema.js";

const app = express();

const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

app.get("/user", async (req, res) => {
  const users = await prisma.user.findMany();
  return res.send(users);
});

app.get("/user/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id,
    },
  });
  if (!user) return res.status(404).send("User not found!");
  return res.send(user);
});

app.post("/user", async (req, res) => {
  const userData = {
    email: req.body.email,
    name: req.body.name,
    cpf: req.body.cpf,
    phone: req.body.phone,
  };
  const { error } = schema.validate(userData);
  if (error) return res.status(400).send(error.details[0].message);

  const isThereUser = await prisma.user.findFirst({
    where: { OR: [{ email: req.body.email }, { cpf: req.body.cpf }] },
  });

  if (isThereUser) return res.status(400).send("User already exists!");

  const user = await prisma.user.create({
    data: userData,
  });
  return res.status(201).send(user);
});

app.put("/user/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id,
    },
  });
  if (!user) return res.status(404).send("User not found!");

  const userData = {
    email: req.body.email,
    name: req.body.name,
    cpf: req.body.cpf,
    phone: req.body.phone,
  };
  const { error } = schema.validate(userData);
  if (error) return res.status(400).send(error.details[0].message);

  const updatedUser = await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: userData,
  });

  return res.send(updatedUser);
});

app.delete("/user/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id,
    },
  });
  if (!user) return res.status(404).send("User not found!");

  const deletedUser = await prisma.user.delete({
    where: {
      id: req.params.id,
    },
  });
  return res.send(deletedUser);
});

app.listen(process.env.PORT || 3000);
