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
      await getMe({ context });
    } else {
      throw new ApolloError("not authorized");
    }
  }
};

export const getMe = async ({ context }) => {
  const id = context.authScope.req.userSession.userId;
  if (id) {
    const res = await USER.findOne({ where: { id: id } });
    context.authScope.req.userData = res.dataValues;
    return res.dataValues;
  } else {
    throw new ApolloError("not logged in");
  }
};
