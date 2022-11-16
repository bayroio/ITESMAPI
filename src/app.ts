import "dotenv/config"
import express from "express";
import cors from "cors";
import { router } from "./routes";

const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3001;
const app = express();

//Restringir uso de la api
// app.use(cors({
//     origin:["http://localhost:4000"]
// }));
app.use(cors());

//Add endpoints
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(router);

//Activar puerto
app.listen(PORT, () => console.log(`Ready in port ${PORT}`))