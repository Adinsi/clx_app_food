const router = require("express").Router();
const client_controller = require("../../controller/client.controller");

/*Register Client */
router.post("/register_client", client_controller.registerClient);
/* */
/*Verification Client */
router.post("/verification_client", client_controller.verificationClient);
/* */
/*Login Client */
router.post("/login_client", client_controller.login_client);
/* */
/**forget password */
router.put("/forget-password", client_controller.forgetPassword);
/** */
/*Reset password */
router.put("/reset/:id/verify/:token", client_controller.resetPassword);
/** */
/*update profil */
router.put("/update/:id", client_controller.update_profil);
/*delete client from db */
router.delete("/delete_client/:id", client_controller.deleteUserClient);
/** */

/*Get All Client */
router.get("/", client_controller.getAllClient);
/* */

// Creation de met des restaurateur//
router.patch("/create_met/:id", client_controller.createMet);
router.patch("/update_met/:id", client_controller.updateMet);
router.patch("/delete_met/:id", client_controller.deleteMet);
module.exports = router;
