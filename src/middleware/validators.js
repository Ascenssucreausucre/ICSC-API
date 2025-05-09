// middlewares/validators.js
const { body, validationResult } = require("express-validator");

// Étape 1 : règles de validation
exports.verifyConference = [
  body("city").trim().notEmpty().withMessage("City is required."),
  body("country").trim().notEmpty().withMessage("Country is required."),
  body("year")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Invalid year. Must be a number between 2000 and 2100."),
  body("conference_index")
    .isInt({ min: 0 })
    .withMessage("Index has to be a positive integer."),
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("acronym").trim().notEmpty().withMessage("Acronym is required."),
];

exports.verifyImportantDates = [
  body("initial_submission_due")
    .notEmpty()
    .withMessage("Initial submission date is required.")
    .isISO8601()
    .withMessage("Initial submission must be a valid date."),

  body("paper_decision_notification")
    .notEmpty()
    .withMessage("Paper decision notification date is required.")
    .isISO8601()
    .withMessage("Paper decision must be a valid date."),

  body("final_submission_due")
    .notEmpty()
    .withMessage("Final submission date is required.")
    .isISO8601()
    .withMessage("Final submission must be a valid date."),

  body("registration")
    .notEmpty()
    .withMessage("Registration date is required.")
    .isISO8601()
    .withMessage("Registration must be a valid date."),

  body("congress_opening")
    .notEmpty()
    .withMessage("Congress opening date is required.")
    .isISO8601()
    .withMessage("Congress opening must be a valid date."),

  body("congress_closing")
    .notEmpty()
    .withMessage("Congress closing date is required.")
    .isISO8601()
    .withMessage("Congress closing must be a valid date.")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.congress_opening)) {
        throw new Error("Congress closing must be after congress opening.");
      }
      return true;
    }),
];

exports.verifyTopicWithContent = [
  body("title").trim().notEmpty().withMessage("Topic title can't be empty."),
  body("content").isArray().withMessage("Topic's content must be an array."),
  body("content.*").trim().notEmpty().withMessage("Subtopic can't be empty."),
];

exports.verifyNews = [
  body("title").trim().notEmpty().withMessage("New's title can't be empty."),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("New's content can't be empty."),
  body("from_date")
    .notEmpty()
    .withMessage("From date can't be empty")
    .isISO8601()
    .withMessage("From date must be a valid date"),
  body("to_date")
    .notEmpty()
    .withMessage("To date can't be empty")
    .isISO8601()
    .withMessage("To date must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.from_date)) {
        throw new Error("News must end after it's from date.");
      }
      return true;
    }),
];

exports.verifyCommittee = [
  body("type").trim().notEmpty().withMessage("Committee type can't be empty."),
  body("members")
    .isArray()
    .withMessage("Committee members must return an array."),
  body("members.*.affiliation")
    .trim()
    .notEmpty()
    .withMessage(
      "Affiliation can't be null. Fill in the committee member's country if 'affiliation' remains unclear."
    ),
  body("members.*.name")
    .trim()
    .notEmpty()
    .withMessage(
      "Name can't be empty. If the committee member has only one name, fill in the 'Name' input instead."
    ),
];

exports.verifyCommitteeMember = [
  body("affiliation")
    .trim()
    .notEmpty()
    .withMessage(
      "Affiliation can't be null. Fill in the committee member's country if 'affiliation' remains unclear."
    ),
  body("name")
    .trim()
    .notEmpty()
    .withMessage(
      "Name can't be empty. If the committee member has only one name, fill in the 'Name' input instead."
    ),
];

exports.verifyCommitteeMembers = [
  body("members.*.affiliation")
    .trim()
    .notEmpty()
    .withMessage(
      "Affiliation can't be null. Fill in the committee member's country if 'affiliation' remains unclear."
    ),
  body("members.*.name")
    .trim()
    .notEmpty()
    .withMessage(
      "Name can't be empty. If the committee member has only one name, fill in the 'Name' input instead."
    ),
];

exports.verifyRegistrationFeesWithcategories = [
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Registration Fee's description/country cannot be empty."),
  body("feecategories")
    .isArray()
    .withMessage("Fee Categories must be an array.")
    .bail()
    .custom((arr) => Array.isArray(arr) && arr.length > 0)
    .withMessage("At least one fee category is required."),
  body("feecategories.*.ieee_member")
    .notEmpty()
    .withMessage("IEEE Member's fee is required.")
    .bail()
    .isDecimal()
    .withMessage("IEEE Member's fee must be a valid number.")
    .bail()
    .custom((value) => parseFloat(value) >= 0)
    .withMessage("IEEE Member's fee must be a positive number."),
  body("feecategories.*.non_ieee_member")
    .notEmpty()
    .withMessage("Non-IEEE Member's fee is required.")
    .bail()
    .isDecimal()
    .withMessage("Non-IEEE Member's fee must be a valid number.")
    .bail()
    .custom((value) => parseFloat(value) >= 0)
    .withMessage("Non-IEEE Member's fee must be a positive number."),

  body("feecategories.*.virtual_attendance")
    .optional({ checkFalsy: true })
    .isDecimal()
    .withMessage("Virtual attendance fee must be a valid number.")
    .bail()
    .custom((value) => parseFloat(value) >= 0)
    .withMessage("Virtual attendance fee must be a positive number."),
  body("feecategories.*.type")
    .trim()
    .notEmpty()
    .withMessage("Fee categorie's type cannot be empty."),
];

exports.verifySponsors = [
  body("name").trim().notEmpty().withMessage("Sponsor's name can't be empty."),
  body("type").trim().notEmpty().withMessage("Sponsor's type can't be empty."),
];

exports.verifyArticle = [
  body("nr")
    .notEmpty()
    .withMessage("Nr is required.")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Nr must be a positive integer."),

  body("title").trim().notEmpty().withMessage("Title can't be empty."),

  body("affiliation")
    .trim()
    .notEmpty()
    .withMessage("Affiliation can't be null."),

  body("status")
    .optional()
    .isIn(["pending", "accepted", "rejected"])
    .withMessage("Status must be one of: pending, accepted, rejected."),

  body("profile")
    .optional()
    .isIn(["Invited", "Contributed"])
    .withMessage("Profile must be either 'Invited' or 'Contributed'."),

  body("conference_id")
    .notEmpty()
    .withMessage("Conference ID is required.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Conference ID must be a valid positive integer."),
  body("authors")
    .isArray({ min: 1 })
    .withMessage("The article must have at least 1 valid author."),
  body("authors.*.name")
    .notEmpty()
    .withMessage("Author name must not be empty.")
    .isString()
    .withMessage("Author name must be a string."),
  body("authors.*.surname")
    .notEmpty()
    .withMessage("Author surname must not be empty.")
    .isString()
    .withMessage("Author surname must be a string."),

  body("authors.*.country")
    .notEmpty()
    .withMessage("Author country must not be empty.")
    .isString()
    .withMessage("Author country must be a string."),
];

exports.verifyAuthors = [
  body("name")
    .notEmpty()
    .withMessage("Author name must not be empty.")
    .isString()
    .withMessage("Author name must be a string."),
  body("surname")
    .notEmpty()
    .withMessage("Surname can't be empty")
    .isString()
    .withMessage("Author surname must be a string."),
  body("country")
    .notEmpty()
    .withMessage("Author country must not be empty.")
    .isString()
    .withMessage("Author country must be a string."),
];

exports.verifyAdditionnalFees = [
  body("additionnal_paper_fee")
    .notEmpty()
    .withMessage("Additionnal paper fee is required.")
    .bail()
    .isDecimal()
    .withMessage("Additionnal paper fee must be a valid number.")
    .bail()
    .custom((value) => parseFloat(value) >= 0)
    .withMessage("Additionnal paper fee must be a positive number."),
  body("additionnal_page_fee")
    .notEmpty()
    .withMessage("Additionnal page fee is required.")
    .bail()
    .isDecimal()
    .withMessage("Additionnal page fee must be a valid number.")
    .bail()
    .custom((value) => parseFloat(value) >= 0)
    .withMessage("Additionnal page fee must be a positive number."),
];

// Étape 2 : middleware d'erreurs
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));
    return res.status(422).json({ errors: formattedErrors });
  }
  next();
};
