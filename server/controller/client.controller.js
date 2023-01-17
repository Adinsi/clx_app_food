const User = require(`../models/user/user.model`);
const Client = require(`../models/client/user.client`);
const mongoose = require(`mongoose`);
const bcrypt = require(`bcrypt`);
const jwt = require(`jsonwebtoken`);
const { signUpError } = require(`../utils/errror.util`);
const ObjectdId = mongoose.Types.ObjectId;
const sendEmail = require(`../utils/send_email.js`);
const crypto = require(`crypto`);

/* Inscription d'un client depuis la page admin */
module.exports.registerClient = async (req, res) => {
  let user;

  const { name, zone, ifu, commune, id_piece, email, tel } = req.body;

  /*Verifiez d'abord si le client existe dans notre base de donnée puisque le numéro de téléphone doit être unique par client pour permettre à leur clients de les appler immédiatement en cas d'une altercation*/

  try {
    user = await Client.findOne({
      tel: tel,
    });
  } catch (error) {
    let errors = signUpError(error);
    res.status(500).send({ message: "Erreur interne du serveur" });
  }
  if (user)
    return res.status(401).json({
      message: `L'utulisateur avec ce numéro de téléphone existe déja. Veuillez saisir vos propres coordonnées`,
    });

  try {
    user = await Client.findOne({
      email: email,
    });
  } catch (error) {
    res.status(500).send(error);
  }
  if (user)
    return res.status(401).json({
      message: `L'utulisateur avec cet email existe déja, veullez vous connectez.`,
    });
  /*Generer un mot de passe à 5 chiffre */
  const password_crypt = crypto.randomBytes(2).toString(`hex`);
  const passwordHashed = bcrypt.hashSync(password_crypt, 10);
  /*Inserer les données dans la base de donnée*/
  user = await Client.create({
    name,
    email,
    tel,
    ifu,
    zone,
    commune,
    id_piece,
    code: passwordHashed,
  });

  try {
    await user.save();
    //  const url = `${process.env.CLIENT_URL}/verify/${user.userId}/activate/${user.token}`;

    await sendEmail(
      user.email,
      `Votre code d'authentification`,
      `
       <div style="background-color: #FFFFFF;margin:auto;font-family:'Montserrat', sans-serif;@import url('https://fonts.cdnfonts.com/css/montserrat');max-height: 400px;width: 100%;text-align: center;"  class="container">
    <h1>Bienvenue sur FoodExpress</h1>
    <h3>connectez-vous à votre compte avec ce code.</h3> 
 <br>
 <h1 style="background-color: #000;color:gray"> ${password_crypt}</h1>

 <p>Vous vous ètes inscrits avec ce numéro de téléphone : ${user.tel}</p>
  </div> 
      `
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Erreur interne du serveur : ` + error });
  }
  res.status(201).json({
    message: `Vous avez réçu un mail de vérification pour finaliser l'inscription`,
    user,
  });
};
/*S'authentifier avec le code récu et son nouveau mot de passe */
module.exports.verificationClient = async (req, res) => {
  const { code, newPass, tel } = req.body;
  let clientexisting;
  /*Verifiez si le numéro de tel est valide */
  try {
    clientexisting = await Client.findOne({
      tel: tel,
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }

  if (clientexisting?.verified)
    return res.status(200).json({
      message: `ce compte est déja vérifié avec ce numéro de téléphone, Veuillez vous connectez.`,
    });
  if (!clientexisting)
    return res.status(404).json({
      message: `Le numéro de tél est invalid,veuillez vous inscrire d'abord`,
    });
  /*Verifiez si le code entrez est identique à celle de la base de donnée */

  const passwordHashed = bcrypt.compareSync(code, clientexisting.code);
  if (!passwordHashed)
    return res
      .status(404)
      .json({ message: `Le code d'authentification est incorrect` });
  /*Mettre à jour le mot de passe aevc son nuveau mot de passe */
  const newPaswwordCrypt = bcrypt.hashSync(newPass, 10);
  try {
    await clientexisting.updateOne({
      password: newPaswwordCrypt,
      verified: true,
      code: ``,
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }

  const tokenVerify = jwt.sign(
    { id: clientexisting._id },
    process.env.TOKEN_SECRETE,
    {
      expiresIn: `3d`,
    }
  );
  res.cookie(String(clientexisting._id), tokenVerify, {
    path: `/`,
    expires: new Date(Date.now() + 1000 * 1000 * 1000),
    httpOnly: true,
    sameSite: `lax`,
  });
  return res.status(200).json({
    message: `Authentification réussie`,
  });
};
/*Se connecter */
module.exports.login_client = async (req, res, next) => {
  const { tel, password } = req.body;

  let clientexisting;
  try {
    clientexisting = await Client.findOne({ tel: tel });
  } catch (error) {
    return res.status(500).json({
      message: `Erreur interne du serveur ${error}, veuillez vérifiez votre connexion internet`,
    });
  }
  if (!clientexisting) {
    return res.status(401).json({
      message: `Cet numéro de tel n'existe pas dans notre base de donnée, Inscrivez-vous ! `,
    });
  }
  if (!clientexisting.verified) {
    await sendEmail(
      clientexisting.email,
      `Authentification du votre compte`,
      `
       <div style="background-color: #FFFFFF;margin:auto;font-family:'Montserrat', sans-serif;@import url('https://fonts.cdnfonts.com/css/montserrat');max-height: 400px;width: 100%;text-align: center;"  class="container">
    <h1>Bienvenue sur FoodExpress</h1>
    <h3>Authentification sur FoodExpress.</h3> 
 <br>
 <h1>Nous vous avons envoyé un code lors de votre inscription. Veuillez vérifiez dans vos anciens mail</h1>

  </div> 
      `
    );

    return res.status(400).json({
      message: `Nous vous avons envoyé un code lors de votre inscription. Veuillez vérifiez dans vos ancien mail`,
    });
  }
  // comparer le mot de la bd au mot de passe saisie lors de la connexion
  const isPasswordCorrect = bcrypt.compareSync(
    password,
    clientexisting.password
  );
  if (!isPasswordCorrect) {
    return res.status(401).json({
      message: `Le mot de passe est invalide, veuillez bien saisir vos cordonnées`,
    });
  }

  // Si le compte n'est pas encore approuvé, on lui renvoie un autre mail de confirmation

  const token = jwt.sign(
    { id: clientexisting._id },
    process.env.TOKEN_SECRETE,
    {
      expiresIn: `3d`,
    }
  );

  res.cookie(String(clientexisting._id), token, {
    path: `/`,
    expires: new Date(Date.now() + 1000 * 1000 * 1000),
    httpOnly: true,
    sameSite: `lax`,
  });

  return res
    .status(200)
    .json({ message: `Connection réussie`, user: clientexisting, token });
};
/*Supprimez un client */
module.exports.deleteUserClient = async (req, res) => {
  if (!ObjectdId.isValid(req.params.id)) {
    return res.status(400).send(`Id Inconnue ` + req.params.id);
  }

  // try {

  // } catch (error) { }
  await Client.findByIdAndRemove(req.params.id, (error, docs) => {
    if (!error)
      res.status(200).json({ message: `L'utulisateur supprimez avec succèes` });
    else
      return res
        .status(500)
        .json({ message: `Erreur interne du serveur ${error} ` });
  });
};
//Changer le mot de passe en vérifiant l'émail d'inscription
module.exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  /*Verifiez si l'email existe déja dans la base de donnée */
  let existingUser;
  try {
    existingUser = await Client.findOne({ email: email });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Erreur interne du serveur ${error} ` });
  }
  if (!existingUser) {
    return res.status(400).json({
      message: `Aucun n'a été trouvé avec ce compte, vous devrez posséder un compte d'abord inscrit avec cet émail `,
    });
  }
  /*Envoyer un lien crypter lui permettant de vérifez si c'est vraiment l'utulisateur du coté front-end en utilisant useEffect */
  const resetLink = crypto.randomBytes(14).toString(`hex`);
  const resetId = crypto.randomBytes(14).toString(`hex`);
  await existingUser.updateOne({ resetLink, resetId });
  try {
    const url = `${process.env.CLIENT_URL}/reset/${resetId}/verify/${resetLink}`;

    await sendEmail(
      existingUser.email,
      `Changer votre mot de passe`,
      `
       <div style="background-color: #FFFFFF;margin:auto;font-family:'Montserrat', sans-serif;@import url('https://fonts.cdnfonts.com/css/montserrat');max-height: 400px;width: 100%;text-align: center;"  class="container">
    <h1>Confirmez votre adresse e-mail pour changer votre mot de passe</h1>
    <p>Appuyez sur le bouton ci-dessous pour confirmer votre adresse e-mail. Si vous n'avez pas créé de compte avec , vous pouvez supprimer cet e-mail en toute sécurité.</p>
    <p>Ce lien <b> expire dans un délai de 1h</b></p>
    <button style="background-color: #1A82E2;border:none;padding:15px;border-radius: 10px;cursor:pointer;">  <a style="color: black;" href=${url}> Cliquez sur ce lien pour changer votre mot de passe</a></button>
    <p>Si cela ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur : ${url}</p> 

  </div> 
      `
    );
  } catch (error) {
    res.status(500).json({
      message: `Envoie du message échoué, veuillez réessayer plus tard svp`,
    });
  }

  res.status(200).json({
    message: `Vouas avez réçu un mail pour changer votre mot de passe. Veuillez consultez votre boite mail.`,
  });
};
/*Mettre un nouveau mot de passe si l'email est vérifier */
module.exports.resetPassword = async (req, res) => {
  const { newPass } = req.body;
  let exinstinguser;
  try {
    exinstinguser = await Client.findOne({
      resetId: req.params.id,
      resetLink: req.params.token,
    });

    if (!exinstinguser)
      return res.status(400).json({
        message: `Votre lien de vérification à problablement expirer ou a déja été cliquer. Veuillez recommencer le processus de changement du mot de passe.`,
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
      message: `Votre mot de passe a été changer, connectez-vous maintenant !`,
    });
  }
};
/*La liste de touts les clients */
module.exports.getAllClient = async (req, res) => {
  Client.find((error, docs) => {
    if (!error) res.send(docs);
    else
      return res.status(500).json({
        message: `Vous pouvez pas récuperer les données`,
      });
  }).select(`-password`);
};

/*Mettre a jour son profil */
module.exports.update_profil = async (req, res) => {
  const { name, zone, ifu, commune, id_piece, email, tel } = req.body;
  if (!ObjectdId.isValid(req.params.id))
    return res
      .status(404)
      .send({ messsage: `Vous id est incorrect ${req.params.id}` });

  try {
    Client.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: name,
          zone: zone,
          ifu: ifu,
          commune: commune,
          id_piece: id_piece,
          email: email,
          tel: tel,
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
};
/*Créer un met */
module.exports.createMet = async (req, res) => {
  if (!ObjectdId.isValid(req.params.id))
    return res.status(400).json("Id Inconnue " + req.params.id);
  try {
    return await Client.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          met: {
            clientId: req.body.clientId,
            nameMet: req.body.nameMet,
            priceMet: req.body.priceMet,
            imgMet: req.body.imgMet,
            nameBoisson: req.body.nameBoisson,
            priceBoisson: req.body.priceBoisson,
            imgBoisson: req.body.imgBoisson,
            timestamp: new Date().getTime(),
          },
        },
      },
      {
        new: true,
      }
    ).then((err, docs) => {
      if (!err) return res.status(201).send(docs);
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Erreur interne du serveur, réessayez plus tard" });
  }
};

module.exports.updateMet = (req, res) => {
  if (!ObjectdId.isValid(req.params.id))
    return res.status(400).send("Id inconnu : " + req.params.id);

  try {
    return Client.findById(req.params.id, (err, docs) => {
      const theMet = docs.met.find((met) => met._id.equals(req.body.clientId));

      if (!theMet)
        return res.status(404).send("Aucun commentaire trouvé avec cet id");

      theMet.nameMet = req.body.nameMet;
      theMet.priceMet = req.body.priceMet;
      theMet.imgMet = req.body.imgMet;

      return docs.save((err) => {
        if (!err) return res.status(200).send(docs);
        return res.status(500).send(err);
      });
    });
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.deleteMet = (req, res) => {
  if (!ObjectdId.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    return Client.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          met: {
            _id: req.body.clientId,
          },
        },
      },
      { new: true }
    )
      .then((data) => res.send(data))
      .catch((err) => res.status(500).send({ message: err }));
  } catch (err) {
    return res.status(400).send(err);
  }
};

/*Les transactions */
