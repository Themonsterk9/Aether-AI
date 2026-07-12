const express = require("express");

const router = express.Router();

const { body } = require("express-validator");

const authController = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

const validationMiddleware =
    require("../middleware/validation.middleware");

router.post(

    "/register",

    [

        body("name")
            .notEmpty()
            .withMessage("Name is required"),

        body("email")
            .isEmail()
            .withMessage("Valid email is required"),

        body("password")
            .isLength({ min: 6 })
            .withMessage(
                "Password must be at least 6 characters"
            )

    ],

    validationMiddleware,

    authController.register

);

router.post(

    "/login",

    [

        body("email")
            .isEmail()
            .withMessage("Valid email is required"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")

    ],

    validationMiddleware,

    authController.login

);

router.get(
    "/profile",
    authMiddleware,
    authController.profile
);

router.post(
    "/logout",
    authMiddleware,
    authController.logout
);

module.exports = router;