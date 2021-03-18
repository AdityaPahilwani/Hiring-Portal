import SQL from "sequelize";

const { Sequelize, Model, DataTypes } = SQL;
import sequelize from "../utils/database.js";

const COMMENT = sequelize.define(
  "comment",
  {
    //id===commentId making it id so there
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    // parentId: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    // },
    // userId: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    // },
    comment: { allowNull: false, type: DataTypes.STRING },
  },
  {
    timestamps: true,
  }
);

export default COMMENT;
