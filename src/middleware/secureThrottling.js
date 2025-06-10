const slowDown = require("express-slow-down");
const rateLimit = require("express-rate-limit");

exports.secureThrottling = [
  slowDown({
    windowMs: 1 * 60 * 1000,
    delayAfter: 50,
    delayMs: () => 5000,
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please try again later.",
    },
  }),
];
