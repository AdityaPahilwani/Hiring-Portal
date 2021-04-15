import pkg from "apollo-server-express";
import USER from "../../Model/user.js";
import SQL from "sequelize";
const { Sequelize, Model, DataTypes } = SQL;
const { ApolloError } = pkg;

/**
 * It is used to check whether user is logged in or not based on session
 */
export const isAuthorized = async ({ context }) => {
  // console.log(context.req, "from Middleware ",context.req.session);
  try {
    if (!context.req.session.userId) {
      throw new Error("not authenticated");
    }
  } catch (err) {
    console.log(err, "here");
    throw new Error(err);
  }
};

/**
 * It is used to check whether user is logged in or not based on session
 * @return logged in user details like id , name , bio , profilePic , follower , following etc
 */
export const getLoggedInUser = async ({ context }) => {
  try {
    // console.log(context.req.session, "from getMiddleware ");
    let loggedInUserId = context.req.session.userId;
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
