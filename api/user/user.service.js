//DEFECT : Error: ENOENT: no such file or directory, open './data/user.json'

import fs from "fs";
import { loggerService } from "../../services/logger.service.js";

export const userService = {
  query,
  getById,
  getByUsername,
  remove,
  save,
};

const USER_PAGE_SIZE = 10;
var users = _readJsonFile("./data/user.json");

async function query(filterBy) {
  try {
    let usersToReturn = [...users];

    if (filterBy) {
      var { fullname, username, score, pageIndex } = filterBy;
      fullname = fullname || "";
      username = username || "";
      score = +score;
      pageIndex = pageIndex || 1;

      usersToReturn = usersToReturn.filter(
        (user) =>
          user.fullname.toLowerCase().includes(fullname.toLowerCase()) &&
          user.username.toLowerCase().includes(username.toLowerCase()) &&
          user.score >= score
      );

      const startIndex = (pageIndex - 1) * USER_PAGE_SIZE;
      usersToReturn = usersToReturn.slice(
        startIndex,
        startIndex + USER_PAGE_SIZE
      );
    }
    return usersToReturn;
  } catch (err) {
    loggerService.error(`Had problems getting users...`);
    throw err;
  }
}

async function getById(userId) {
  try {
    const user = users.find((user) => user._id === userId);
    return user;
  } catch (err) {
    loggerService.error(`Had problems getting user ${userId}...`);
    throw err;
  }
}

async function getByUsername(username) {
  try {
    const user = users.find((user) => user.username === username);
    return user;
  } catch (err) {
    loggerService.error(`Had problems getting username ${username}...`);
    throw err;
  }
}

async function remove(userId) {
  const idx = users.findIndex((user) => user._id === userId);
  users.splice(idx, 1);

  try {
    _saveUsersToFile("./data/user.json");
  } catch (err) {
    loggerService.error(`Had problems removing user ${userId}...`);
    throw err;
  }

  return `Ok`;
}

//update or create
async function save(userToSave) {
  loggerService.debug(
    `userService.save is about to save  ${JSON.stringify(userToSave)}`
  );
  try {
    if (userToSave._id) {
      const idx = users.findIndex((user) => user._id === userToSave._id);
      if (idx === -1) throw "Bad Id";
      userToSave = {
        _id: userToSave._id,
        fullname: userToSave.fullname,
        username: userToSave.username,
        password: userToSave.password,
        score: +userToSave.score || 100,
        isAdmin : userToSave.isAdmin || false
      };
      users.splice(idx, 1, userToSave);
    } else {
      userToSave._id = _makeId();
      userToSave = {
        _id: userToSave._id,
        fullname: userToSave.fullname,
        username: userToSave.username,
        password: userToSave.password,
        score: +userToSave.score || 100,
        isAdmin : userToSave.isAdmin || false
      };
      users.push(userToSave);
    }

    _saveUsersToFile("./data/user.json");

    loggerService.debug(`userService.save saved ${JSON.stringify(userToSave)}`);
    return userToSave;
  } catch (err) {
    loggerService.error(
      `Had problems saving user ${JSON.stringify(userToSave)}...`
    );
    throw err;
  }
}

function _makeId(length = 6) {
  var txt = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return txt;
}

function _readJsonFile(path) {
  const str = fs.readFileSync(path, "utf8");
  const json = JSON.parse(str);
  return json;
}

function _saveUsersToFile(path) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(users, null, 2);
    fs.writeFile(path, data, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
