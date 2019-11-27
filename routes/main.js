const express = require("express");
const router = express.Router();
const models = require("../models");

/* GET main page. */
router.get("/", function(req, res, next) {
  res.render("game/mafia", { name: req.session.name });
});

module.exports = router;
