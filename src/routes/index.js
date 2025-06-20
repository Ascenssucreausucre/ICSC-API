const fs = require("fs");
const path = require("path");
const router = require("express").Router();

const routesPath = __dirname;

fs.readdirSync(routesPath).forEach((file) => {
  if (file !== "index.js" && file.endsWith(".js")) {
    const route = require(path.join(routesPath, file));

    const baseName = file.replace("Routes.js", "").replace(".js", "");
    const routeName = baseName
      .replace(/([a-z])([A-Z])/g, "$1-$2") // camelCase -> kebab-case
      .toLowerCase();

    const fullPath = `/${routeName}`;
    router.use(fullPath, route);

    console.log(`✅ Route loaded : /api${fullPath} -> ${file}`);
  }
});

module.exports = router;
