import POST from "../../Model/post.js";
import USER from "../../Model/user.js";
import COMMENT from "../../Model/comment.js";
import { basicUserDetails } from "../Constants/defaultModelData.js";
import { skipTopComments } from "../Constants/randomConstant.js";
import SQL from "sequelize";
const { Sequelize, Model, DataTypes } = SQL;
export const getPosts = async ({ args, context }) => {
  const { pageNo } = args.input;
  let limit = 10;
  let resObj = {};
  try {
    let data = await POST.findAll({
      offset: pageNo * limit,
      limit: limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          ...basicUserDetails,
        },
        {
          model: COMMENT,
          attributes: ["id", "comment", "userId"],
          order: [["createdAt", "DESC"]],
          limit: skipTopComments,
          include: [
            {
              ...basicUserDetails,
            },
          ],
        },
      ],
    });
    
    data = data.map((item, index) => {
     
      const tempComments = item.dataValues.comments;
      let comments = [];
      if (tempComments.length > 0) {
        comments = tempComments.map((commentItem, index) => {
          
          return {
            ...commentItem.dataValues,
            userData: commentItem.dataValues.user.dataValues,
          };
        });
      }
      return {
        ...item.dataValues,
        postedBy: item.dataValues.user,
        likes: item.dataValues.likes ? item.dataValues.likes.length : 0,
        comments: comments,
      };
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
export const createPost = async ({ args, context }) => {
  let body = {},
    resObj = {};

  for (const [key, value] of Object.entries(args.input)) {
    if (value) {
      body[key] = value;
    }
  }
  body["postedBy"] = context.authScope.req.userSession.userId;
  try {
    const res = await POST.create({ ...body });
    if (res) {
      resObj = {
        success: true,
        message: "Post created",
      };
    } else {
      resObj = {
        error: "Failed to create post ",
        success: false,
        message: "Invalid email or password",
      };
    }
  } catch (err) {
    resObj = { error: "Custom error", success: false, message: "error" };
    console.log(err);
  }
  return resObj;
};
export const likePost = async ({ args, context }) => {
  let { postId } = args.input;
  let resObj = {};
  const userId = context.authScope.req.userSession.userId;
  
  let body = {
    likes: Sequelize.fn("array_append", Sequelize.col(`likes`), userId),
  };
  try {
    const getPost = await POST.findOne({ where: { id: postId } });
  
    if (getPost?.dataValues?.likes?.includes(userId)) {
      resObj = {
        success: false,
        message: "already liked",
        error: "User already liked this post",
      };
    } else {
      if (getPost) {
        await POST.update(body, {
          where: { id: postId },
          returning: true,
        });
        resObj = {
          success: true,
          message: "Post liked",
        };
      } else {
        resObj = {
          success: false,
          message: "postId doesn't exist",
          error: "user tried to like post which doesn't exist",
        };
      }
    }
  } catch (err) {
    resObj = {
      success: false,
      message: "operation failed",
      error: "operation failed",
    };
  }
  return resObj;
};
