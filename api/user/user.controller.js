import { userService } from "./user.service.js";

async function getUsers(req, res) {
  try {
    const filterBy = {
      fullname: req.query.fullname || "",
      username: req.query.username || "",
      score: req.query.score || 0,
      pageIndex: req.query.pageIndex,
    };
    const users = await userService.query(filterBy);

    res.send(users);
  } catch (err) {
    res.status(400).send(`Couldn't get users`);
  }
}

async function getUserById(req, res) {
  var { userId } = req.params;
  try {
    const user = await userService.getById(userId);

    if (user) {
      var { visitedUsers = "" } = req.cookies;
      visitedUsers = userId + "," + visitedUsers;
      const visitedUsersArray = visitedUsers.split(",");
      if (
        visitedUsersArray.length > 0 &&
        visitedUsersArray[visitedUsersArray.length - 1] === ""
      ) {
        visitedUsersArray.pop();
      }

      if (visitedUsersArray.length > 3) throw "Wait for a bit";
      res.cookie("visitedUsers", visitedUsers, { maxAge: 5 * 1000 });
      res.send(user);
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (err) {
    if (err === "Wait for a bit") {
      console.error(err);
      res.status(401).send(err);
    } else {
      console.error(err);
      res.status(500).send({ error: "Internal server error" });
    }
  }
}

async function addUser(req, res) {
  console.log("req.body", req.body);
  const { _id, fullname, username, password, score , isAdmin } = req.body;
  const userToSave = {
    _id: _id,
    fullname: fullname,
    username: username,
    password: password,
    score: +score,
    isAdmin : isAdmin
  };

  console.log("userToSave", userToSave);

  try {
    const result = await userService.save(userToSave);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
}

async function updateUser(req, res) {
  const { _id, fullname, username, password, score , isAdmin } = req.body;
  const userToSave = {
    _id: _id,
    fullname: fullname,
    username: username,
    password: password,
    score: +score,
    isAdmin : isAdmin
  };

  try {
    const result = await userService.save(userToSave);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
}

async function deleteUser(req, res) {
  var { userId } = req.params;

  try {
    const result = userService.remove(userId);
    res.send(`User ${userId} was removed`);
  } catch (err) {
    console.log(err);
  }
}

export const userController = {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
};
