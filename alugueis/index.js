import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Joi from "joi";
import { PrismaClient } from "@prisma/client";

const app = express();

app.use(cors());
app.use(bodyParser.json());

const prisma = new PrismaClient();

app.get("/aluguel", async (req, res) => {
  const alugueis = await prisma.aluguel.findMany();
  return res.send(alugueis);
});

const schema = Joi.object({
  fim: Joi.date().iso().optional().allow(null),
  idPatinete: Joi.string().required(),
});

app.post("/aluguel", async (req, res) => {
  const aluguelData = {
    inicio: new Date(),
    idPatinete: req.body.idPatinete,
  };
  const { error } = schema.validate({ idPatinete: aluguelData.idPatinete });
  if (error) return res.status(400).send(error.details[0].message);

  const doesPatineteExists = await fetch(
    `http://localhost:3001/patinete/${aluguelData.idPatinete}`
  );

  if (!doesPatineteExists.ok)
    return res.status(404).send("Patinete does not exists!");

  const response = await fetch(
    `http://localhost:3001/patinete/${aluguelData.idPatinete}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "ALUGADO",
        rentAt: new Date(),
      }),
    }
  );

  if (!response.ok) return res.status(400).send("Could not modify patinete!");

  const isThereRent = await prisma.aluguel.findUnique({
    where: { idPatinete: req.body.idPatinete },
  });

  if (isThereRent) return res.status(400).send("The patinete is being used!");

  const aluguel = await prisma.aluguel.create({
    data: aluguelData,
  });

  return res.status(201).send(aluguel);
});

app.listen(process.env.PORT || 3002);
