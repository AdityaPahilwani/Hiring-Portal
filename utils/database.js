import { database, user, password, host, port } from "../Constants/dbCreds.js";
import SQL from "sequelize";
const { Sequelize, Model, DataTypes } = SQL;
const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: "postgres",
  logging: false,
});

export default sequelize;
