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

app.get("/aluguel/:id", async (req, res) => {
  const aluguel = await prisma.aluguel.findUnique({
    where: { id: req.params.id },
  });
  if (!aluguel) return res.status(404).send("Aluguel not found!");

  return res.send(aluguel);
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

  const patinete = await doesPatineteExists.json();

  if (patinete.status !== "DISPONIVEL" && patinete.rentAt !== null) {
    return res
      .status(403)
      .send("Patinete is unavailable or already under rent!");
  }

  const isThereRent = await prisma.aluguel.findFirst({
    where: { idPatinete: req.body.idPatinete, fim: null },
  });

  if (isThereRent) return res.status(403).send("The patinete is being used!");

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

  const aluguel = await prisma.aluguel.create({
    data: aluguelData,
  });

  const unlock = await fetch(
    `http://localhost:3003/controle/${aluguelData.idPatinete}?type=start`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!unlock.ok) return res.status(400).send("Could not unlock patinete!");

  const unlockResponse = await unlock.json();

  if (unlockResponse.type === "start") {
    console.log("Patinete has been successfully unlocked!");
  }

  return res.status(201).send(aluguel);
});

app.patch("/aluguel/:id", async (req, res) => {
  if (req.query.type !== "end")
    return res
      .status(400)
      .send("Please include a query string parameter at the request URL");

  const aluguel = await prisma.aluguel.findUnique({
    where: { id: req.params.id },
  });
  if (!aluguel) return res.status(404).send("Aluguel not found!");

  if (aluguel.fim !== null)
    return res.status(403).send("There is nothing to modify here!");

  const response = await fetch(
    `http://localhost:3001/patinete/${aluguel.idPatinete}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "DISPONIVEL",
        rentAt: null,
      }),
    }
  );

  if (!response.ok) return res.status(400).send("Could not modify patinete!");

  const aluguelModified = await prisma.aluguel.update({
    where: { id: aluguel.id },
    data: {
      fim: new Date(),
    },
  });

  const reset = await fetch(
    `http://localhost:3003/controle/${aluguelModified.idPatinete}?type=end`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!reset.ok) return res.status(400).send("Could not reset patinete!");

  const resetResponse = await reset.json();

  if (resetResponse.type === "end") {
    console.log("Patinete has been successfully reset!");
  }

  return res.send(aluguelModified);
});

app.listen(process.env.PORT || 3002);
