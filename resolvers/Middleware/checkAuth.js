import pkg from "apollo-server-express";
import USER from "../../Model/user.js";
import SQL from "sequelize";
const { Sequelize, Model, DataTypes } = SQL;
const { ApolloError } = pkg;
// export const isAuthorized = async ({ context }) => {
//   try {
//     let loggedInUserId = context.req.session.userId;
//     if (!loggedInUserId) {

//       const id = context.req.headers.authorization;
//       console.log("PASSEDDDD",id)
//       if (id) {
//         context.req.session.userId = id;
//         console.log("PASSES")
//       } else {
//         throw new ApolloError("not authorized");
//       }
//     }
//   } catch (err) {
//     console.log("error from auth check ", err);
//   }
// };

export const isAuthorized = async ({ context }) => {
  console.log(context.req, "from Middleware ",context.req.session);
  try {
    if (!context.req.session.userId) {
      throw new Error("not authenticated");
    }
  } catch (err) {
    console.log(err, "here");
    throw new Error(err);
  }
};

export const getLoggedInUser = async ({ context }) => {
  try {
    console.log(context.req.session, "from getMiddleware ");
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
