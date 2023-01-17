const User = require(`../models/user/user.model`);
const Client = require(`../models/client/user.client`);
const mongoose = require(`mongoose`);
const bcrypt = require(`bcrypt`);
const jwt = require(`jsonwebtoken`);
const { upload_error, signUpErrorUser } = require(`../utils/errror.util`);
const ObjectdId = mongoose.Types.ObjectId;
const sendEmail = require(`../utils/send_email.js`);
const crypto = require(`crypto`);
const validator = require("validator");
const async_handler = require("express-async-handler");

/* Inscription d'un utiulisateur */
module.exports.register = async_handler(async (req, res) => {
  let user;
  const { firstName, lastName, password, tel, email } = req.body;
  /*Verifiez d'abord s'il s'est déja inscrit*/
  try {
    20;
    user = await User.findOne({ email: email, tel: tel });
  } catch (error) {
    res.status(500).json({
      message: `Erreur du serveur, veuillez réessayez plus tard ! ${error}`,
    });
  }
  if (user)
    return res.status(403).json({
      message: `L'utulisateur avec cet email ou tel existe déja. Veuillez vous connectez ${user}`,
    });
  /*Fin de la vérification */

  /*Vérifiez maintenant si les données saisir respecte notre schéma */
  if (!validator.isEmail(email))
    return res.status(401).json({ message: `Votre adress email est invalid` });
  if (!validator.isLength(password, { min: 6 }))
    return res.status(401).json({
      message: `Votre mot de passe doit contenir au moins 6 caractères`,
    });
  if (!validator.isLength(firstName, { min: 4 }))
    return res.status(401).json({
      message: `Votre nom doit contenir au moins 4 caractéres`,
    });
  if (!validator.isLength(lastName, { min: 4 }))
    return res.status(401).json({
      message: `Votre prénom doit contenir au moins 4 caractéres`,
    });
  /*FIn de la vérification */

  /*Crypter le mot de passe avant de l'inserer dans la base de donnée*/
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    user = await User.create({
      firstName,
      lastName,
      tel,
      email,
      password: hashedPassword,
    });
    res.status(201).json({ message: `L'utulisateur crée avec succees`, user });
  } catch (error) {
    res.status(403).json({
      message: `L'utulisateur avec cet email ou tel existe déja. Veuillez vous connectez ${error}`,
    });
  }
});
/*Connexion d'un utulisateur*/
module.exports.login = async_handler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(401)
      .json({ message: "Veuillez remplir touts les champs" });
  let existingUser;
  /*Verifiez si l'email est inscrit dans la base de donnée */
  try {
    existingUser = await User.findOne({
      email: email,
    });
  } catch (error) {
    res.status(500).json({
      mesage: `Erreur interne du serveur, veuillez réessayez plus tard`,
    });
  }

  if (!existingUser)
    return res.status(401).json({
      message: `L'utilsateur avec cet email n'existe pas,Veuillez vous inscrire d'abord !`,
    });

  /*Décrypter le mot de passe avant de le vérifiez avec celle de la base de donnée */
  const passwordHashed = bcrypt.compareSync(password, existingUser.password);
  if (!passwordHashed) {
    return res.status(401).json({ message: `Le mot de passe est incorrect` });
  }

  /*Envoyer un cookie pour l'authentification*/
  const { id } = existingUser._id;
  const token = jwt.sign({ id }, process.env.TOKEN_SECRETE, {
    expiresIn: `7d`,
  });
  /*Envoyer la réponse dans le cookie */
  res.cookie(String(existingUser._id), token, {
    path: `/`,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: `lax`,
    secure: true,
  });

  return res
    .status(200)
    .json({ message: ` Connection réussie`, user: existingUser, token });
});

/*Refresh Token  */
module.exports.refreshToken = async_handler(async (req, res) => {});
/*Changer le mot de passe en validant son email */
module.exports.forgetPassword = async_handler(async (req, res) => {
  const { email } = req.body;

  let existingUser;
  if (!validator.isEmail(email))
    return res.status(401).json({ message: `Votre adress email est invalid` });
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return res.status(500).json({
      message: `Erreur interne du serveur, veuillez réessayez plus tard ! `,
    });
  }
  if (!existingUser) {
    return res.status(401).json({
      message: `Cet émail n'existe pas dans notre base de donnée, Inscrivez-vous ! `,
    });
  }

  const resetLink = crypto.randomBytes(14).toString(`hex`);
  const resetId = crypto.randomBytes(14).toString(`hex`);
  await existingUser.updateOne({ resetLink, resetId });
  try {
    const url = `${process.env.CLIENT_URL}/reset/${resetId}/verify/${resetLink}`;

    await sendEmail(
      existingUser.email,
      `Changer votre mot de passe`,
      `
       <div style="background-color: #FFFFFF;margin:auto;font-family:'Montserrat', sans-serif;@import url('https://fonts.cdnfonts.com/css/montserrat');max-height: 400px;width: 100%;text-align: center; " class="container">
    <h1>Confirmez votre adresse e-mail pour changer votre mot de passe</h1>
    <p>Appuyez sur le bouton ci-dessous pour confirmer votre adresse e-mail. Si vous n'avez pas créé de compte avec , vous pouvez supprimer cet e-mail en toute sécurité.</p>
    <p>Ce lien <b> expire dans un délai de 1h</b></p>
    <button style="background-color: #1A82E2;border:none;padding:15px;border-radius: 10px;cursor:pointer;">  <a style="color: black;" href=${url}> Cliquez sur ce lien pour changer votre mot de passe</a></button>
    <p>Si cela ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur : ${url}</p> 

  </div> 
      `
    );
  } catch (error) {
    res.status(500).json({ message: `Erreur interne du serveur` });
  }

  res.status(200).json({
    message: `Vous avez réçu un mail pour changer votr mot de passe. Cliquez dessus et mettez un nouveau mot de passe.`,
  });
});
/*Entrer un nouveau mot de passe en cliqaunt sur le lien */
module.exports.resetPassword = async_handler(async (req, res) => {
  const { newPass } = req.body;
  let exinstinguser;
  try {
    exinstinguser = await User.findOne({
      resetId: req.params.id,
      resetLink: req.params.token,
    });

    if (!exinstinguser)
      return res.status(400).json({
        message: `Votre lien de vérification à problablement expirer ou a déja été cliquer. Veuillez recommencer le processus de changement du mot de passe.`,
      });
    if (!validator.isLength(newPass, { min: 6 }))
      return res.status(401).json({
        message: `Votre mot de passe doit contenir au moins 6 caractères`,
      });
    const hashedPassword = bcrypt.hashSync(newPass, 10);
    await exinstinguser.updateOne({
      resetLink: ``,
      resetId: ``,
      password: hashedPassword,
    });
  } catch (error) {
    res.status(500).json({
      message: `Erreur interne du serveur` + error,
    });
  }

  if (exinstinguser) {
    res.status(200).json({
      message: `Votre mot de passe changé a été changer, connectez-vous maintenant !`,
    });
  }
});
/*Suivre un restaurateur préferer en s'abonnant à son profil */
module.exports.followClient = async_handler(async (req, res) => {
  const { idToFollow } = req.body;
  if (!ObjectdId.isValid(req.params.id) || !ObjectdId.isValid(idToFollow)) {
    return res.status(400).json(`Id Inconnue` + req.params.id);
  }
  try {
    await Client.findByIdAndUpdate(
      idToFollow,
      {
        $addToSet: { followers: req.params.id },
      },
      { new: true, upsert: true },
      (error, docs) => {
        if (error) return res.send(error);
        if (!error) return res.status(201).json(docs);
      }
    );
    // followers add
    await User.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { following: idToFollow },
      },
      { new: true, upsert: true },
      (error, docs) => {
        if (!error) res.status(201).json(docs);
        else res.status(400).json(error);
      }
    );
  } catch (error) {
    // res.status(500).json({ message: error });
    // res.status(500).json({ message: error });
  }
});
/*Ne plus Suivre un restaurateur préferer en se desabonnant à son profil */
module.exports.unfollowClient = async_handler(async (req, res) => {
  if (!ObjectdId.isValid(req.params.id)) {
    return res.status(400).json(`Id Inconnue` + req.params.id);
  }

  try {
    await User.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { following: req.body.idToFollow },
      },
      { new: true, upsert: true },
      (error, docs) => {
        if (!error) res.status(201).json(docs);
        else return res.status(400).json(error);
      }
    );
    await Client.findByIdAndUpdate(
      req.body.idToFollow,
      {
        $pull: { followers: req.params.id },
      },
      { new: true, upsert: true },
      (error, docs) => {
        if (error) return res.send(error);
      }
    );
  } catch (error) {
    // res.status(500).json({ message: error });
  }
});
/*Recuperer les données avec l'id */
module.exports.userInfo = async (req, res) => {
  if (!ObjectdId.isValid(req.params.id)) {
    return res.status(400).send("Id Inconnue" + req.params.body);
  }

  User.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message: "Id de l'utilisateur est inconnu",
      });
  }).select("-password");
};
/*Recuperer les données d'un utulisateur aprés avoir verifez son token  */
module.exports.getUser = async_handler(async (req, res) => {
  const id = req.id;
  let user;

  try {
    user = await User.findById(id, `-password`);
  } catch (error) {
    return new Error(error);
  }
  try {
    if (user) {
      return res.status(200).json({ user });
    }
  } catch (error) {
    res.status(404).json({ message: `L'utilisateur n'existe pas` });
  }
});
/*Supprimez un utulisateur */
module.exports.deleteUser = async_handler(async (req, res) => {
  if (!ObjectdId.isValid(req.params.id)) {
    return res.status(400).send(`Id Inconnue ` + req.params.id);
  }

  try {
    await User.findByIdAndRemove(req.params.id, (error, docs) => {
      if (!error)
        res
          .status(200)
          .json({ message: `L'utulisateur supprimez avec succèes` });
      else
        return res.status(500).json({
          message: `Erreur interne du serveur, veuillez vérifiez votre connexion internet`,
        });
    });
  } catch (error) {
    // res.status(500).json({ message: error });
  }
});
/*Recuperer touts les utilisateurs */
module.exports.getAllUsers = async_handler(async (req, res) => {
  User.find((error, docs) => {
    if (!error) res.send(docs);
    else
      return res.status(500).json({
        message: `Vous pouvez pas récuperer les données`,
      });
  }).select(`-password`);
});

/*Mettre a jour son profil */
module.exports.update_profil = async_handler(async (req, res) => {
  const { firstName, lastName, tel, email } = req.body;
  if (!ObjectdId.isValid(req.params.id))
    return res
      .status(404)
      .send({ messsage: `Vous id est incorrect ${req.params.id}` });

  try {
    User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
          tel: tel,
          email: email,
        },
      },
      {
        new: true,
      },
      (err, docs) => {
        if (!err) return res.status(200).json(docs);
        else res.status(500).json({ message: err });
      }
    ).select(`-password`);
  } catch (error) {
    res.status(500).json({
      message: `Erreur interne du serveur,veuillez réessayez plus tard !`,
    });
  }
});

/*Changer le profil par défaut */
module.exports.upload_profil = async_handler(async (req, res) => {
  if (req.file.size > 500000)
    return res.status(404).json({ message: "Fichier volumineux" });

  if (
    req.file.detectedMineType != "image/jpeg" &&
    req.file.detectedMineType != "image/jpg" &&
    req.file.detectedMineType != "image/png"
  )
    return res.status(404).json({ message: "File invalid" });

  try {
    await User.findByIdAndUpdate(
      req.body.userId,
      {
        $set: { picture: `./image/user/${req.body.name}.jpg` },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
      (error, docs) => {
        if (!error) return res.status(200).json(docs);
        else return res.status(500).json({ message: error });
      }
    );
  } catch (error) {
    // return res.status(500).json({ message: error });
  }
});

/*Déconnecter du site */
module.exports.logOut = async_handler(async (req, res) => {
  const cookies = req.headers.cookie;
  const preventToken = cookies?.split(`=`)[1];
  if (!preventToken) {
    return res.status(404).json({ message: `Vous n'avez pas de token` });
  }
  jwt.verify(String(preventToken), process.env.TOKEN_SECRETE, (err, user) => {
    if (err) {
      return res.status(400).json({ message: `Authentification échoué` });
    }
    res.clearCookie(`${user.id}`);
    req.cookies[`${user._id}`] = ``;
    return res.status(200).json({ message: `Déconnexion` });
  });
});
