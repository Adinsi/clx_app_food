module.exports.signUpError = (err) => {
  let errors = { ifu: "", id_piece: "" };

  if (err.keyPattern.ifu >= 1) errors.ifu = "Cet ifu est déja enrégistré";
  if (err.keyPattern.id_piece >= 1)
    errors.id_piece = "cet numéros de pièce d'identité existe déja";

  return errors;
};
module.exports.signUpErrorUser = (err) => {
  let errors = {
    firstName: "",
    lastName: "",
    tel: "",
    email: "",
    password: "",
  };
  if (
    err.message.includes(
      "user validation failed: firstName: Path `firstName` is required."
    )
  )
    errors.firstName = "Le champs nom est obligatoire";
  if (
    err.message.includes(
      "user validation failed: lastName: Path `lastName` is required."
    )
  )
    errors.lastName = "Le champs prénom est obligatoire";
  if (
    err.message.includes("user validation failed: tel: Path `tel` is required.")
  )
    errors.tel = "Le champs téléphone est obligatoire";
  if (
    err.message.includes(
      "user validation failed: email: Path `email` is required."
    )
  )
    errors.email = "Le champs email est obligatoire";
  if (
    err.message.includes(
      "user validation failed: password: Path `password` is required."
    )
  )
    errors.password = "Le champs mot de passe est obligatoire";

  return errors;
};

module.exports.upload_error = (error) => {
  let errors = { format: "", maxSize: "" };
  if (error.message.includes("Invalid File")) {
    errors.format = "Format incompatible";
  }
  if (error.message.includes("max Size")) {
    errors.maxSize = "Le fichier dépasse 500ko";
  }

  return errors;
};
