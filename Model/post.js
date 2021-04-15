import SQL from "sequelize";

const { Sequelize, Model, DataTypes } = SQL;
import sequelize from "../utils/database.js";

const POST = sequelize.define(
  "post",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    // postedBy: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    postType: DataTypes.STRING, //EXPERIMENTAL
    description: DataTypes.STRING,
    mediaLink: DataTypes.STRING,
    likes: DataTypes.ARRAY(DataTypes.STRING),
  },
  {
    timestamps: true,
  }
);

export default POST;
