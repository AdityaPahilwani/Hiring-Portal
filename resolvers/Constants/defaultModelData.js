import USER from "../../Model/user.js";
export const basicUserDetails={
    model: USER,
    attributes: [
      "id",
      "name",
      "email",
      "gender",
      "profilePic",
      "bio",
      "userType",
    ],
  };