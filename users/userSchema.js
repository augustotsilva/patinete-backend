import Joi from "joi";

export const schema = Joi.object({
  email: Joi.string().required().email(),
  name: Joi.string().required(),
  cpf: Joi.string().required().length(11),
  phone: Joi.string().required(),
});
