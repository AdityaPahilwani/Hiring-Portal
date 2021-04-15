/** @format */

import USER from "../../Model/user.js";
import SQL from "sequelize";

const { Sequelize, Model, DataTypes, Op } = SQL;
import cloudinary from "../../utils/cloudinary.js";
import { getLoggedInUser } from "../Middleware/checkAuth.js";
import bcrypt from "bcryptjs";

export const createUser = async ({ args, context }) => {
  const { name, email, gender, bio, password, skills } = args.input;
  let resObj = {};
  let profilePic;
  if (gender === "Male") {
    profilePic =
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdDIZrF6XF_2t2UMsPyfkuwZfvagwvN-seTwA0LMHhlLAy7ykG56D7ALt54c-q9t3mMyc&usqp=CAU";
  } else {
    profilePic =
      "https://cdn1.vectorstock.com/i/1000x1000/45/70/female-avatar-profile-picture-silhouette-light-vector-4684570.jpg";
  }
  try {
    const userExist = await USER.findOne({ where: { email } });
    if (!userExist) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const res = await USER.create({
        name,
        email,
        gender,
        bio,
        profilePic: profilePic,
        password: hashedPassword,
        skills: skills,
      });
      context.req.session.userId = res.dataValues.id;
      resObj = {
        success: true,
        message: "user created",
        cookie: context.req.session.userId,
      };
    } else {
      resObj = {
        success: false,
        message: "user exist already",
        error: "Sign up with another email",
      };
    }
  } catch (err) {
    resObj = { error: "Custom error", success: false, message: "error" };
    console.log(err);
  }
  return resObj;
};

export const signIn = async ({ args, context }) => {
  const { email, password } = args.input;
  let resObj = {};
  try {
    const res = await USER.findOne({ where: { email } });
    const checkPass = await bcrypt.compare(password, res.dataValues.password);
    context.req.session.userId = res.dataValues.id;
    if (checkPass) {
      resObj = {
        success: true,
        message: "Success login",
        cookie: "",
        data: res.dataValues,
      };
    } else {
      resObj = {
        error: "Invalid email or password",
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

export const logout = async ({ context }) => {
  context.res.clearCookie("connect.sid", { path: "/" });
  const resObj = {
    success: true,
    success: true,
    message: "Logout Successfull",
    data: null,
  };
  return resObj;
};

export const getUserWithId = async ({ args, context }) => {
  const { userId } = args.input;
  let resObj = {};
  let loggedInUserDetails = await getLoggedInUser({ context });
  let data = {};
  let userRelation = {
    isAdmin: false,
    isFollowing: false,
    isFollower: false,
    hasSentRequest: false,
    hasReceivedRequest: false,
  };
  try {
    const loggedInId = context.req.session.userId;
    if (loggedInId === userId) {
      userRelation.isAdmin = true;
      data = loggedInUserDetails;
    } else {
      const res = await USER.findOne({ where: { id: userId } });
      data = res.dataValues;
      if (!data) {
        throw new Error("Not found");
      }
      if (loggedInUserDetails?.requestedTo?.includes(userId)) {
        userRelation.hasSentRequest = true;
      }
      if (loggedInUserDetails?.requestedBy?.includes(userId)) {
        userRelation.hasReceivedRequest = true;
      }
      if (loggedInUserDetails?.followers?.includes(userId)) {
        userRelation.isFollower = true;
      }
      if (loggedInUserDetails?.following?.includes(userId)) {
        userRelation.isFollowing = true;
      }
    }

    data.totalFollowers = data?.followers?.length || 0;
    data.totalFollowing = data?.following?.length || 0;
    delete data.password;
    delete data.requestedTo;
    delete data.requestedBy;
    delete data.followers;
    delete data.following;

    resObj = {
      success: true,
      message: "Fetch successful",
      userRelation: userRelation,
      data: data,
    };
  } catch (err) {
    resObj = { error: "Not found", success: false, message: "error" };
    console.log(err);
  }
  return resObj;
};

export const searchUsers = async ({ args, context }) => {
  let { search, skills, pageNo } = args.input;
  const limit = 10;
  let resObj = {};
  let searchObj = {};
  try {
    const ID = context.req.session.userId;
    if (search) {
      searchObj.name = { [Op.iLike]: `%${search}%` };
    }
    if (skills?.length > 0) {
      searchObj.skills = { [Op.overlap]: skills };
    }

    let res = await USER.findAll({
      offset: pageNo * limit,
      limit: limit,
      where: { id: { [Op.ne]: ID }, ...searchObj },
    });
    let data = res?.map((item, index) => {
      return { ...item.dataValues };
    });
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
    resObj = { error: "Not found", success: false, message: "error" };
  }
  return resObj;
};

export const getRequestedUsers = async ({ args, context }) => {
  let { requestedBy } = await getLoggedInUser({ args, context });
  requestedBy = requestedBy || [];
  let resObj = {};
  try {
    let res = await USER.findAll({
      where: { id: { [Op.in]: requestedBy } },
    });
    let data = res?.map((item, index) => {
      return { ...item.dataValues };
    });

    resObj = {
      success: true,
      message: "Fetch successful",
      data: data,
    };
  } catch (err) {
    console.log(err);
    resObj = { error: "Not found", success: false, message: "error" };
  }
  return resObj;
};
export const updateUser = async ({ args, context }) => {
  let body = {},
    resObj = {};

  for (const [key, value] of Object.entries(args.input)) {
    if (value) {
      body[key] = value;
    }
  }

  if (body["profilePic"]) {
    const mediaRes = await cloudinary.uploader.upload(body["profilePic"]);
    body["profilePic"] = mediaRes.url;
  }
  if (body["password"]) {
    const hashedPassword = await bcrypt.hash(body["password"], 12);
    body["password"] = hashedPassword;
  }

  try {
    const ID = context.req.session.userId;
    const res = await USER.update(body, { where: { id: ID }, returning: true });
    if (res) {
      resObj = {
        success: true,
        message: "user updated",
        cookie: context.req.session.userId,
        data: res.dataValues,
      };
    } else {
      resObj = {
        error: "Invalid email or password",
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

export const requestToFollowUser = async ({ args, context }) => {
  const { requestedTo } = args.input;
  const ID = context.req.session.userId;
  let resObj = {};
  if (requestedTo !== ID) {
    try {
      const getUser = await getLoggedInUser({ args, context });
      console.log(getUser);
      if (getUser.requestedTo?.includes(requestedTo)) {
        resObj = {
          error: "Request already sent",
          success: false,
          message: "operation failed",
        };
        return resObj;
      }
      console.log(
        getUser.following?.includes(requestedTo),
        getUser?.dataValues
      );
      if (getUser.following?.includes(requestedTo)) {
        resObj = {
          error: "You are already following user",
          success: false,
          message: "operation failed",
        };
        return resObj;
      }

      let adminBody = {
        requestedTo: Sequelize.fn(
          "array_append",
          Sequelize.col(`requestedTo`),
          requestedTo
        ),
      };
      let updateRequestedBody = {
        requestedBy: Sequelize.fn(
          "array_append",
          Sequelize.col(`requestedBy`),
          ID
        ),
      };
      await USER.update(adminBody, {
        where: { id: ID },
        returning: true,
      });
      const updateRequestedUser = await USER.update(updateRequestedBody, {
        where: { id: requestedTo },
        returning: true,
      });
      resObj = {
        success: true,
        message: "Request sent",
      };
    } catch (err) {
      console.log(err);
      resObj = { error: "Custom error", success: false, message: "error" };
    }
  } else {
    resObj = {
      error: "Admin can't send request to itself",
      success: false,
      message: "Admin can't send request to itself",
    };
  }
  console.log("TEMP LOG", resObj, "TEMP LOG");
  return resObj;
};

export const revokeToFollowUserRequest = async ({ args, context }) => {
  const { id, requestedTo } = args.input;
  const ID = context.req.session.userId;
  let resObj = {};
  try {
    let adminBody = {
      requestedTo: Sequelize.fn(
        "array_remove",
        Sequelize.col(`requestedTo`),
        requestedTo
      ),
    };
    let updateRequestedBody = {
      requestedBy: Sequelize.fn(
        "array_remove",
        Sequelize.col(`requestedBy`),
        ID
      ),
    };
    await USER.update(adminBody, {
      where: { id: ID },
      returning: true,
    });
    const updateRequestedUser = await USER.update(updateRequestedBody, {
      where: { id: requestedTo },
      returning: true,
    });
    resObj = {
      success: true,
      message: "Request revoked",
    };
  } catch (err) {
    resObj = { error: "Custom error", success: false, message: "error" };
  }
  return resObj;
};

export const acceptFollowRequest = async ({ args, context }) => {
  const { id, requestedTo } = args.input;
  const ID = context.req.session.userId;
  let resObj = {};

  try {
    const getUser = await getLoggedInUser({ args, context });
    if (getUser.requestedBy?.includes(requestedTo)) {
      let adminBody = {
        followers: Sequelize.fn(
          "array_append",
          Sequelize.col(`followers`),
          requestedTo
        ),
      };
      let updateRequestedBody = {
        following: Sequelize.fn("array_append", Sequelize.col(`following`), ID),
      };
      await USER.update(adminBody, {
        where: { id: ID },
        returning: true,
      });
      const updateRequestedUser = await USER.update(updateRequestedBody, {
        where: { id: requestedTo },
        returning: true,
      });
      const deleteFromRequestObj = await declineFollowRequest({
        args,
        context,
      });
      console.log(deleteFromRequestObj, "trial");
      resObj = {
        success: true,
        message: "Request accepted",
      };
      if (deleteFromRequestObj.error) {
        resObj = deleteFromRequestObj;
      }
    } else {
      resObj = {
        success: false,
        message: "not recived request by the user",
        error: "not recived request by the user",
      };
    }
  } catch (err) {
    console.log("from accept request", err);
    resObj = { error: "Custom error", success: false, message: "error" };
  }

  return resObj;
};

export const declineFollowRequest = async ({ args, context }) => {
  const { id, requestedTo } = args.input;
  const ID = context.req.session.userId;
  let resObj = {};
  try {
    let adminBody = {
      requestedBy: Sequelize.fn(
        "array_remove",
        Sequelize.col(`requestedBy`),
        requestedTo
      ),
    };
    let updateRequestedBody = {
      requestedTo: Sequelize.fn(
        "array_remove",
        Sequelize.col(`requestedTo`),
        ID
      ),
    };
    await USER.update(adminBody, {
      where: { id: ID },
      returning: true,
    });
    const updateRequestedUser = await USER.update(updateRequestedBody, {
      where: { id: requestedTo },
      returning: true,
    });
    resObj = {
      success: true,
      message: "Request declined",
    };
  } catch (err) {
    resObj = { error: "Custom error", success: false, message: "error" };
  }
  return resObj;
};
export const unFollowUser = async ({ args, context }) => {
  const { id, requestedTo } = args.input;
  const ID = context.req.session.userId;
  let resObj = {};
  try {
    let adminBody = {
      following: Sequelize.fn(
        "array_remove",
        Sequelize.col(`following`),
        requestedTo
      ),
    };
    let updateRequestedBody = {
      followers: Sequelize.fn("array_remove", Sequelize.col(`followers`), ID),
    };
    const res = await USER.update(adminBody, {
      where: { id: ID },
      returning: true,
    });
    console.log(res[1]);
    const updateRequestedUser = await USER.update(updateRequestedBody, {
      where: { id: requestedTo },
      returning: true,
    });
    resObj = {
      success: true,
      message: "unfollowed user",
    };
  } catch (err) {
    resObj = { error: "Custom error", success: false, message: "error" };
  }
  return resObj;
};
