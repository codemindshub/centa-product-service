import { DatabaseError } from "../errors/errors.js";
export const sayHi = (req, res, next) => console.log(process.env.name);

