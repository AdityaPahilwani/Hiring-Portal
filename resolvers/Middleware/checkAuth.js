import pkg from "apollo-server-express";
import USER from "../../Model/user.js";
import SQL from "sequelize";
const { Sequelize, Model, DataTypes } = SQL;
const { ApolloError } = pkg;
export const isAuthorized = async ({ context }) => {
  try {
    let loggedInUserId = context.authScope.req.userSession.userId;
    if (!loggedInUserId) {
      console.log(
        context.authScope.req.headers.authorization,
        "from auth made"
      );
      const id = context.authScope.req.headers.authorization;
      if (id) {
        context.authScope.req.userSession.userId = id;
      } else {
        throw new ApolloError("not authorized");
      }
    }
  } catch (err) {
    console.log("error from auth check ", err);
  }
};

export const getLoggedInUser = async ({ context }) => {
  try {
    let loggedInUserId = context.authScope.req.userSession.userId;
    let userData = {};
    if (loggedInUserId) {
      const res = await USER.findOne({ where: { id: loggedInUserId } });
      userData = res.dataValues;
      delete userData.password;
      return userData;
    } else {
      throw new ApolloError("not authorized");
    }
  } catch (err) {
    console.log("error from auth check ", err);
  }
};
