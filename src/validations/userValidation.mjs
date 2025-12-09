import Joi from "joi";

const validateUser = Joi.object({
  name: Joi.string().min(3).max(50).required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(8).required(),

  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required(),
});
export default validateUser;
