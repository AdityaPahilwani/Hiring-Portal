import USER from "../../Model/user.js";
import SQL from "sequelize";

const { Sequelize, Model, DataTypes } = SQL;
import cloudinary from "../../utils/cloudinary.js";
import { getLoggedInUser } from "../Middleware/checkAuth.js";
import bcrypt from "bcryptjs";

export const createUser = async ({ args, context }) => {
  const { name, email, gender, bio, password } = args.input;
  let resObj = {};
  let profilePic;
  console.log(args.input);
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
      });
      context.authScope.req.userSession.userId = res.dataValues.id;
      resObj = {
        success: true,
        message: "user created",
        cookie: context.authScope.req.userSession.userId,
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
    context.authScope.req.userData = res.dataValues;
    context.authScope.req.userSession.userId = res.dataValues.id;
    console.log("cookie set", context.authScope.req.userSession.userId);
    if (checkPass) {
      resObj = {
        success: true,
        message: "Success login",
        cookie: context.authScope.req.userSession.userId,
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
  console.log(loggedInUserDetails);
  try {
    const loggedInId = context.authScope.req.userSession.userId;
    if (loggedInId === userId) {
      userRelation.isAdmin = true;
      data = loggedInUserDetails;
    } else {
      const res = await USER.findOne({ where: { id: userId } });
      data = res.dataValues;
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
    console.log(data, " from get User with id");
    resObj = {
      success: true,
      message: "Fetch successful",
      userRelation: userRelation,
      data: data,
    };
  } catch (err) {
    resObj = { error: "Custom error", success: false, message: "error" };
    console.log(err);
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
    const ID = context.authScope.req.userSession.userId;
    const res = await USER.update(body, { where: { id: ID }, returning: true });
    if (res) {
      resObj = {
        success: true,
        message: "user updated",
        cookie: context.authScope.req.userSession.userId,
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
  const { id, requestedTo } = args.input;
  const ID = context.authScope.req.userSession.userId;

  let resObj = {};
  try {
    const getUser = await USER.findOne({ where: { id: ID } });
    if (getUser?.dataValues?.requestedTo?.includes(requestedTo)) {
      resObj = {
        error: "Request already sent",
        success: false,
        message: "operation failed",
      };
    } else {
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
    }
  } catch (err) {
    console.log(err);
    resObj = { error: "Custom error", success: false, message: "error" };
  }
  return resObj;
};

export const revokeToFollowUserRequest = async ({ args, context }) => {
  const { id, requestedTo } = args.input;
  const ID = context.authScope.req.userSession.userId;
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
      message: "Request revoked",
    };
  } catch (err) {
    resObj = { error: "Custom error", success: false, message: "error" };
  }
  return resObj;
};

export const acceptFollowRequest = async ({ args, context }) => {
  const { id, requestedTo } = args.input;
  const ID = context.authScope.req.userSession.userId;
  let resObj = {};

  try {
    const getUser = await USER.findOne({ where: { id: requestedTo } });
    console.log(getUser?.dataValues?.requestedTo?.includes(ID));
    if (getUser?.dataValues?.requestedTo?.includes(ID)) {
      let adminBody = {
        following: Sequelize.fn(
          "array_append",
          Sequelize.col(`following`),
          requestedTo
        ),
      };
      let updateRequestedBody = {
        followers: Sequelize.fn("array_append", Sequelize.col(`followers`), ID),
      };
      await USER.update(adminBody, {
        where: { id: ID },
        returning: true,
      });
      const updateRequestedUser = await USER.update(updateRequestedBody, {
        where: { id: requestedTo },
        returning: true,
      });
      const deleteFromRequestObj = await revokeToFollowUserRequest({
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
    }
    else{
      resObj = {
        success: false,
        message: "not recived request by the user",
        error: "not recived request by the user"
      };
    }
  } catch (err) {
    console.log("from accept request", err);
    resObj = { error: "Custom error", success: false, message: "error" };
  }
  console.log(resObj);
  return resObj;
};

export const declineFollowRequest = async ({ args, context }) => {
  const resObj = await revokeToFollowUserRequest({
    args,
    context,
  });
  if (resObj.success) {
    resObj.message = "Request declined";
  }
  return resObj;
};
export const unFollowUser = async ({ args, context }) => {
  const { id, requestedTo } = args.input;
  const ID = context.authScope.req.userSession.userId;
  let resObj = {};
  try {
    let adminBody = {
      following: Sequelize.fn(
        "array_remove",
        Sequelize.col(`following`),
        requestedTo
      ),
    };
    const res = await USER.update(adminBody, {
      where: { id: ID },
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
