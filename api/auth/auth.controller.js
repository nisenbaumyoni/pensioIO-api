import { authService } from "./auth.service.js";
import { loggerService } from "../../services/logger.service.js";

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const userToLogin = {
      username: username,
      password: password,
    };
    const miniUser = await authService.login(userToLogin);

    loggerService.info(` user logged-in ${JSON.stringify(miniUser)}`);

    const loginToken = await authService.getLoginToken(miniUser);
    loggerService.debug(
      `authController.login - loggedin and returned mini user ${JSON.stringify(
        miniUser
      )} `
    );
    res.cookie("loginToken", loginToken, { sameSite: "None", secure: true });
    res.json(miniUser);
    // res.send(miniUser);
  } catch (err) {
    loggerService.error("Failed to Login " + err);
    res.status(401).send({ err: "Failed to Login : " + err });
  }
}

async function signup(req, res) {
  try {
    // const credentials = req.body;
    const { fullname, username, password, isAdmin } = req.body;
    const userToSignup = {
      fullname: fullname,
      username: username,
      password: password,
      isAdmin: isAdmin,
    };
    const signedUpUser = await authService.signup(userToSignup);

    const userToLogin = {
      username: userToSignup.username,
      password: userToSignup.password,
    };
    const miniUser = await authService.login(userToLogin);

    loggerService.info(` user logged-in ${JSON.stringify(miniUser)}`);

    const loginToken = await authService.getLoginToken(miniUser);

    res.cookie("loginToken", loginToken, { sameSite: "None", secure: true });
    res.json(miniUser);
    // res.send(miniUser);
  } catch (err) {
    loggerService.error("Failed to signup " + err);
    res.status(400).send({ err: "Failed to signup : " + err });
  }
}

async function logout(req, res) {
  try {
    res.send({ msg: "Logged out successfully" });
  } catch (err) {
    console.log(err);
  }
}

export const authController = {
  login,
  signup,
  logout,
};
