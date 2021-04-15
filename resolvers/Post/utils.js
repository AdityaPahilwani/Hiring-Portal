/** @format */

import POST from "../../Model/post.js";
import USER from "../../Model/user.js";
import COMMENT from "../../Model/comment.js";
import { basicUserDetails } from "../Constants/defaultModelData.js";
import { skipTopComments } from "../Constants/randomConstant.js";
import SQL from "sequelize";
const { Sequelize, Model, DataTypes, Op } = SQL;
import cloudinary from "../../utils/cloudinary.js";
import { getLoggedInUser } from "../Middleware/checkAuth.js";

export const getPosts = async ({ args, context }) => {
  const { pageNo } = args.input;
  let limit = 10;
  let resObj = {};
  console.log(pageNo);
  try {
    let { following, id } = await getLoggedInUser({ args, context });
    following = following || [];
    console.log(following, id);
    let data = await POST.findAll({
      offset: pageNo * limit,
      limit: limit,
      order: [["createdAt", "DESC"]],
      // where: {
      //   postedBy: { [Op.in]: following },
      // },
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

    data = data?.map((item, index) => {
      const tempComments = item?.dataValues.comments;
      let comments = [];
      if (tempComments.length > 0) {
        comments = tempComments.map((commentItem, index) => {
          return {
            ...commentItem.dataValues,
            userData: commentItem.dataValues.user.dataValues,
          };
        });
      }
      let userId = context.req.session.userId;
      return {
        ...item.dataValues,
        postedBy: item.dataValues.user,
        likes: item?.dataValues?.likes ? item.dataValues.likes.length : 0,
        doesUserLike: item?.dataValues?.likes?.includes(userId),
        comments: comments,
      };
    });
    console.log(data.length);
    if (data?.length > 0) {
      resObj = {
        success: true,
        message: "Fetch successful",
        data: data,
      };
    } else {
      resObj = {
        success: true,
        message: "No Data",
        data: data,
      };
    }
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

export const getPostWithId = async ({ args, context }) => {
  const { id } = args.input;
  let resObj = {};
  try {
    let data = await POST.findOne(
      {
        where: { id: id },
        include: [
          {
            ...basicUserDetails,
          },
        ],
      },
      {
        include: [
          {
            ...basicUserDetails,
          },
          {
            model: COMMENT,
            attributes: ["id", "comment", "userId"],
            order: [["createdAt", "DESC"]],
            // limit: skipTopComments,
            include: [
              {
                ...basicUserDetails,
              },
            ],
          },
        ],
      }
    );

    data = data?.dataValues;

    const tempComments = data?.comments;
    let comments = [];
    if (tempComments?.length > 0) {
      comments = tempComments.map((commentItem, index) => {
        return {
          ...commentItem.dataValues,
          userData: commentItem?.dataValues?.user?.dataValues,
        };
      });
    }

    data.postedBy = data.user;
    data.comments = comments;
    data.likes = data.likes ? data.likes.length : 0;

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
  console.log(context.req.session.userId);
  body["postedBy"] = context.req.session.userId;
  if (body["mediaLink"]) {
    const mediaRes = await cloudinary.uploader.upload(body["mediaLink"]);
    body["mediaLink"] = mediaRes.url;
  } else {
    body["mediaLink"] = false;
  }

  try {
    let res = await POST.create({ ...body });
    let { id: postId, mediaLink } = res?.dataValues;
    let data = {
      id: postId,
      mediaLink: mediaLink,
    };
    if (res) {
      resObj = {
        success: true,
        message: "Post created",
        data: data,
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
    console.log("error", err);
  }

  return resObj;
};

export const likePost = async ({ args, context }) => {
  let { postId } = args.input;
  let resObj = {};
  const userId = context.req.session.userId;

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

export const unLikePost = async ({ args, context }) => {
  let { postId } = args.input;
  let resObj = {};
  const userId = context.req.session.userId;

  let body = {
    likes: Sequelize.fn("array_remove", Sequelize.col(`likes`), userId),
  };
  try {
    const getPost = await POST.findOne({ where: { id: postId } });

    if (!getPost?.dataValues?.likes?.includes(userId)) {
      resObj = {
        success: false,
        message: "user didn't liked the post , so can't unlike it",
        error: "user didn't liked the post , so can't unlike it",
      };
    } else {
      if (getPost) {
        await POST.update(body, {
          where: { id: postId },
          returning: true,
        });
        resObj = {
          success: true,
          message: "Post unLiked",
        };
      } else {
        resObj = {
          success: false,
          message: "postId doesn't exist",
          error: "user tried to unlike post which doesn't exist",
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
