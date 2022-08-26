const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Users = require('../models/users-model');
const { SECRET } = require('./secrets/index')



router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (username == null || password == null) {
      next({ status: 401, message: "username and password required" })
      return;
    }

    if (username.trim() === '' || password.trim() === '') {
      next({ status: 401, message: "username and password required" })
      return;
    }

    req.user = { username: username.trim(), password: password.trim() }

    const existingUser = await Users.findBy({ username: req.user.username })
    if (existingUser.length) {
      next({ status: 422, message: "username taken"})
      return;
    }

    const hash = bcrypt.hashSync(req.user.password, 8)
    const savedUser = await Users.add({ username: req.user.username, password: hash })
    res.status(201).json(savedUser)

  } catch(err) {
    next(err)
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (username == null || password == null) {
      next({ status: 401, message: "username and password required" })
      return;
    }

    const existingUser = await Users.findBy({ username: username }).first()

    if (!existingUser) {
      next({ status: 401, message: "invalid credentials" })
      return;
    }

    if (bcrypt.compareSync(password, existingUser.password)) {
      const token = generateJwt(existingUser)
      res.status(200).json({ message: `welcome, ${existingUser.username}`, token })
    } else {
      next({ status: 401, message: "invalid credentials" })
    }

  } catch(err) {
    next(err)
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

function generateJwt(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const config = { expiresIn: '1d' };

  return jwt.sign(payload, SECRET, config)
}

module.exports = router;
