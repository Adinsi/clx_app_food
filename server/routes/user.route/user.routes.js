const router = require("express").Router();
const auth_controller = require("../../controller/auth.controller");
const middleware = require("../../middelware/verify.token");
const multer = require("multer");
/*Multer callback function */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../client/public/image/user");
  },

  filename: (req, file, cb) => {
    cb(null, `${req.body.name}.jpg`);
  },
});
const uploads = multer({ storage: storage });
/** */
/* Upload profil*/
router.post("/", uploads.single("user"), auth_controller.upload_profil);
/* */
/*Inscription */
router.post("/register", auth_controller.register);
/* */
/*Connexion */
router.post("/login", auth_controller.login);
/* */
/*forget password */
router.put("/forget", auth_controller.forgetPassword);
/* */
/*Reset password */
router.put(
  "/reset/:id/verify/:token",
  // middleware.verifyToken,
  auth_controller.resetPassword
);
/* */
/*Follow Client */
router.patch(
  "/follow/:id",
  // middleware.verifyToken,
  auth_controller.followClient
);
/* */
/*unFollow Client */
router.patch("/unfollow/:id", auth_controller.unfollowClient);
/* *
/*get user infos */
router.get("/user_info", middleware.verifyToken, auth_controller.getUser);
/** */
/*get user infos */
router.get("/refresh", auth_controller.refreshToken);
/** */
router.get("/:id", auth_controller.userInfo);
/** */
/*get All user infos */
router.get("/", middleware.verifyToken, auth_controller.getAllUsers);
/** */
/*delete user from db */
router.delete(
  "/delete_user/:id",
  // middleware.verifyToken,
  auth_controller.deleteUser
);
/** */
/**Update profil */
router.put("/update/:id", auth_controller.update_profil);
/* */
/*Deconnexion */
router.post("/logout", auth_controller.logOut);
/* */

module.exports = router;
