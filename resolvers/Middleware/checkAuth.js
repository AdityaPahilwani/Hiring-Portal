import pkg from "apollo-server-express";
import USER from "../../Model/user.js";
import SQL from "sequelize";
const { Sequelize, Model, DataTypes } = SQL;
const { ApolloError } = pkg;
export const isAuthorized = async ({ context }) => {
  if (!context.authScope.req.userSession.userId) {
    if (context.authScope.req.headers.authorization) {
      const id = context.authScope.req.headers.authorization;
      context.authScope.req.userSession.userId = id;
      const res = await USER.findOne({ where: { id: id } });
      context.authScope.req.userData = res.dataValues;
      console.log(
        "from auth check",
        context.authScope.req.userData,
        "from auth check"
      );
    } else {
      throw new ApolloError("not authorized");
    }
  }
};
