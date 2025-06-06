const slowDown = require("express-slow-down");
const rateLimit = require("express-rate-limit");

exports.secureThrottling = [
  slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 100,
    delayMs: () => 1000,
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  }),
];
