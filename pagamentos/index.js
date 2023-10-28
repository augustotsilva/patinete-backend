import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";

const app = express();

app.use(cors());
app.use(bodyParser.json());

const prisma = new PrismaClient();

app.get("/pagamento", async (req, res) => {
  const pagamentos = await prisma.pagamento.findMany();
  res.send(pagamentos);
});

const pagamentoSchema = Joi.object({
  cartao: Joi.string()
    .regex(/^\d{4} \d{4} \d{4} \d{4}$/)
    .required(),
  amount: Joi.number().required(),
  aluguelId: Joi.string().required(),
});

app.post("/pagamento", async (req, res) => {
  const pagamentoData = {
    cartao: req.body.cartao,
    amount: req.body.amount,
    aluguelId: req.body.aluguelId,
  };

  const { error } = await pagamentoSchema.validate(pagamentoData);
  if (error) return res.status(400).send(error.details[0].message);

  const doesAluguelExists = await fetch(
    `http://localhost:3002/aluguel/${pagamentoData.aluguelId}`
  );

  if (!doesAluguelExists.ok)
    return res.status(404).send("The given aluguel register was not found!");

  const pagamento = await prisma.pagamento.create({
    data: pagamentoData,
  });

  return res.status(201).send(pagamento);
});

app.listen(process.env.PORT || 3004);
