require("dotenv").config({ path: "./config/.env" });
require("./config/db");
const express = require("express");
const app = express();
const cors = require("cors");
// const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const userRoute = require("./routes/user.route/user.routes");
const client_route = require("./routes/client.route/client.routes");
const rate_limiter = require("./utils/rateLimiter");
const helmet = require("helmet");
const path = require("path");
// const firewall = require("node-firewall");

// Environnement variable
const port = process.env.PORT;
const origineClient = process.env.CLIENT_URL;

//Middleware
// app.use(csrf());
app.use(rate_limiter(100, 60000));
app.use(express.json());
app.use(helmet());
app.use(cors({ credentials: true, origin: origineClient }));
app.use(cookieParser());
app.use(bodyParser.json());
// app.use(firewall.init());

// /*Configuration de firewall pour bloquer les requètes provénant d'Ip spécifiques */
// firewall.addRule("block", "ip", "deny", "1.2;3.4");

// Own routes..
app.use("/api/user", userRoute);
app.use("/api/client", client_route);
app.use("/", express.static(path.join(__dirname, "../client/public")));

// Starting the server
// if (require.index === module) {
//   app.listen(process.env.PORT, () =>
//     console.log(`Example app listening on port ${process.env.PORT}!`)
//   );
// }
app.listen(port || 7500, () =>
  console.log(`Le serveur est démarrer sur le port ${port}`)
);
