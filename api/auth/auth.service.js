import 'dotenv/config'
import Crypter from "cryptr";
import Bcrypt from "bcrypt";

import { userService } from "../user/user.service.js";
import { loggerService } from "../../services/logger.service.js";

// const cryptr = new Crypter(process.env.SECRET1 || "secret-puk-1234");
const cryptr = new Crypter(process.env.SECRET1);

export const authService = {
  getLoginToken,
  validateToken,
  login,
  signup,
};

async function getLoginToken(user) {
  try {
    const str = JSON.stringify(user);
    const encryptedStr = cryptr.encrypt(str);
    return encryptedStr;
  } catch (err) {
    loggerService.debug(err);
    throw err;
  }
}

async function validateToken(token) {
  try {
    const json = cryptr.decrypt(token);
    const loggedinUser = JSON.parse(json);
    return loggedinUser;
  } catch (err) {
    console.log("Invalid login token");
  }
  return null;
}

async function login(userToLogin) {
  loggerService.debug(`authService.login userToLogin ${userToLogin}`)
  try {
    const loggingUser = await userService.getByUsername(userToLogin.username);
    if (!loggingUser) throw "Invalid username or password";

    const match = await Bcrypt.compare(
      userToLogin.password,
      loggingUser.password
    );
    if (!match) throw "Invalid username or password";

    const miniUser = {
      _id: loggingUser._id,
      username: loggingUser.username,
      fullname: loggingUser.fullname,
      score: loggingUser.score,
      isAdmin: loggingUser.isAdmin || false,
    };
    return miniUser;
  } catch (err) {
    loggerService.error(err);
    throw err;
  }
}

async function signup(userToSignup) {
  try {
    loggerService.debug(
      `authService.signup - signup with username: ${userToSignup.username}, fullname: ${userToSignup.fullname}`
    );
    if (
      !userToSignup.username ||
      !userToSignup.password ||
      !userToSignup.fullname
    )
      throw "Missing required signup fields";

    const userExist = await userService.getByUsername(userToSignup.username);

    if (userExist) throw "Username already exists";

    const saltRounds = 10;
    const hash = await Bcrypt.hash(userToSignup.password, saltRounds);
    const userToSave = {
      username: userToSignup.username,
      password: hash,
      fullname: userToSignup.fullname,
      isAdmin: userToSignup.isAdmin,
    };

    const savedUser = userService.save(userToSave);

    loggerService.debug(
      `authService.signup - saved user: ${JSON.stringify(savedUser)}`
    );
    return savedUser;
  } catch (err) {
    loggerService.error(err);
    throw err;
  }
}
