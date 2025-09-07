import { authService } from "../api/auth/auth.service.js";
import { loggerService } from "../services/logger.service.js";

export async function requireUser(req, res, next) {
  //const loggedInUser = await authService.validateToken(req.cookies.loginToken); //TODO
  const loggedInUser = "pMzxbu"

  loggerService.info(`requireAuthMiddleware.requireUser - loggedInUser is ${loggedInUser}...`);
  if (!loggedInUser) return res.status(401).send("Not authenticated");
  req.loggedInUser = loggedInUser
  next();
}

export async function requireAdmin(req, res, next) {
  const loggedInUser = await authService.validateToken(req.cookies.loginToken); //TODO
  loggerService.info(
    `requireAuthMiddleware.requireAdmin - loggedInUser is ${loggedInUser}...`
  );
  if (!loggedInUser) {
    loggerService.warn(
      `requireAuthMiddleware.requireAdmin - loggedInUser ${loggedInUser} tried to perform an an-authorized action...`
    );
    res.status(40).send("Not authorized");
  }
  req.loggedInUser = loggedInUser;
  next();
}
