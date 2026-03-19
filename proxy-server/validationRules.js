import { body, param } from "express-validator";

export const userValidationRules = {
  registerUser: [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
    body("firstName").notEmpty().withMessage("First name is required."),
    body("lastName").notEmpty().withMessage("Last name is required."),
  ],
  loginUser: [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  refreshAccessToken: [
    body("token").notEmpty().withMessage("Refresh Token is required."),
  ],
  profile: [
    param("id").notEmpty().withMessage("User ID is required."),
  ]
};
