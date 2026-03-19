import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelizeSqlite = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "proxy_settings.db"),
  logging: false,
});

export default sequelizeSqlite;
