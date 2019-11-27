const express = require("express");
const router = express.Router();
const models = require("../models");
const crypto = require("crypto");

// 회원가입
router.get("/sign_up", (req, res, next) => {
  res.render("user/signup");
});
router.post("/sign_up", async (req, res, next) => {
  let body = req.body;

  let inputPassword = body.password;
  let salt = Math.round(new Date().valueOf() * Math.random()) + "";
  let hashPassword = crypto
    .createHash("sha512")
    .update(inputPassword + salt)
    .digest("hex");

  let result = models.mafiauser.create({
    uid: body.uid,
    name: body.name,
    password: hashPassword,
    salt: salt
  });
  // 했으면 로그인 페이지로 이동해야지
  res.redirect("/users/login");
});

//로그인
router.get("/login", (req, res, next) => {
  let session = req.session;

  res.render("user/login", {
    session: session
  });
});
router.post("/login", async (req, res, next) => {
  let body = req.body;
  let result = await models.mafiauser.findOne({
    where: {
      uid: body.uid
    }
  });
  // 나중에 입력한 아이디가 없을 경우도 구현해놓자.
  if (result) {
    let dbPassword = result.dataValues.password;
    let inputPassword = body.password;
    let salt = result.dataValues.salt;
    let hashPassword = crypto
      .createHash("sha512")
      .update(inputPassword + salt)
      .digest("hex");
    // 자동 로그인 여부
    let autoLogin = body.autoLogin;

    if (dbPassword === hashPassword) {
      console.log("비밀번호 일치");
      // 자동 로그인 선택 시 세션 아이디 설정
      if (autoLogin) {
        req.session.uid = body.uid;
      }
      // 세션에 저장
      let dbName = result.dataValues.name;
      req.session.name = dbName;

      res.redirect("/main");
    } else {
      console.log("비밀번호 불일치");
      res.redirect("/users/login");
    }
    //없는 아이디
  } else {
    console.log("일치하는 아이디 없음");
    // 일단 보류
    res.redirect("/users/wrongId");
  }
});
router.get("/wrongId", (req, res, next) => {
  res.render("user/wrongId");
});

// 로그아웃
router.delete("/logout", (req, res, next) => {
  req.session.destroy();
  res.clearCookie("sid");

  res.redirect("/users/login");
});

module.exports = router;
