import POST from "../../Model/post.js";
import USER from "../../Model/user.js";
import COMMENT from "../../Model/comment.js";
import SQL from "sequelize";
import { basicUserDetails } from "../Constants/defaultModelData.js";
import { skipTopComments } from "../Constants/randomConstant.js";
const { Sequelize, Model, DataTypes } = SQL;

export const createComment = async ({ args, context }) => {
  let body = {},
    resObj = {};

  for (const [key, value] of Object.entries(args.input)) {
    if (value) {
      body[key] = value;
    }
  }
  body["userId"] = context.authScope.req.userSession.userId;
  try {
    let res = await COMMENT.create(body);
    
    resObj = { success: true, message: "comment posted" };
  } catch (err) {
    console.log(err)
    resObj = { error: "Custom error", success: false, message: "error" };
  }
  return resObj;
};

export const getComments = async ({ args, context }) => {
  const { pageNo } = args.input;
  let limit = 10;
  let resObj = {};
  const postId = "a0e84607-3a85-4028-af43-55c1a87c280d";
  try {
    let data = await COMMENT.findAll({
      where: { postId: postId },
      offset:  pageNo * limit,
      limit: limit,
      order: [["createdAt", "DESC"]],
      attributes: ["comment",'id'],
      include: [
        {
          ...basicUserDetails,
        },
      ],
    });

    data = data.map((item, index) => {
      return { ...item.dataValues, userData: item.dataValues.user };
    });
    
    resObj = {
      success: true,
      message: "Fetch successful",
      data: data,
    };
  } catch (err) {
    console.log(err);
    resObj = {
      success: false,
      message: "Fetch unsuccessful",
      error: "error",
    };
  }
  return resObj;
};
