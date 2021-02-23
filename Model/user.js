import SQL from "sequelize";

const { Sequelize, Model, DataTypes } = SQL;
import sequelize from "../utils/database.js";

const USER = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      unique: true,
      primaryKey: true,
      
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: { type: DataTypes.STRING, allowNull: false },
    profilePic: DataTypes.STRING,
    bio: DataTypes.STRING,
    userType: DataTypes.STRING,
    skills: DataTypes.ARRAY(DataTypes.STRING),
    experience: DataTypes.ARRAY(DataTypes.STRING),
    followers: DataTypes.ARRAY(DataTypes.STRING),
    following: DataTypes.ARRAY(DataTypes.STRING),
    requestedTo: DataTypes.ARRAY(DataTypes.STRING),
    requestedBy: DataTypes.ARRAY(DataTypes.STRING),
  },
  {
    timestamps: true,
  }
);

export default USER;
