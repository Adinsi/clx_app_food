const User = require("../models/user/user.model");
const jwt = require("jsonwebtoken");

module.exports.verifyToken = async (req, res, next) => {
  const cookies = req.headers.cookie;
  const token = cookies?.split("=")[1];
  try {
    if (!token) {
      return res
        .status(404)
        .json({ message: "Vous n'avez pas de token d'authentification" });
    }
  } catch (error) {
    return res.status(500).json({
      message:
        "Erreur interne du serveur, veuillez vérifiez votre connexion internet",
    });
  }

  jwt.verify(String(token), process.env.TOKEN_SECRETE, (err, user) => {
    if (err) {
      return res.status(400).json({ message: "Votre Token est invalide." });
    }

    req.id = user?.id;
    next();
  });
};
