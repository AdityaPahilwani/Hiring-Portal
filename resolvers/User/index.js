import {
  createUser,
  signIn,
  updateUser,
  requestToFollowUser,
  revokeToFollowUserRequest,
  acceptFollowRequest,
  declineFollowRequest,
  unFollowUser,
  getUserWithId,
  searchUsers,
  getRequestedUsers
} from "./utils.js";
import { isAuthorized,getLoggedInUser } from "../Middleware/checkAuth.js";
const userResolver = {
  Query: {
    getMe: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const data = await getLoggedInUser({ context });
      return data;
    },
    getUser: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await getUserWithId({ args, context });
      return res;
    },
    searchUsers: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await searchUsers({ args, context });
      return res;
    },
    getRequestedUsers: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await getRequestedUsers({ args, context });
      return res;
    },
  },
  Mutation: {
    signUp: async (parent, args, context, info) => {
      const res = await createUser({ args, context });
      return res;
    },
    signIn: async (parent, args, context, info) => {
      const res = await signIn({ args, context });
      return res;
    },
    updateUser: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await updateUser({ args, context });
      return res;
    },
    requestToFollowUser: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await requestToFollowUser({ args, context });
      return res;
    },
    revokeToFollowUserRequest: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await revokeToFollowUserRequest({ args, context });
      return res;
    },
    acceptFollowRequest: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await acceptFollowRequest({ args, context });
      return res;
    },
    declineFollowRequest: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await declineFollowRequest({ args, context });
      return res;
    },
    unFollowUser: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await unFollowUser({ args, context });
      return res;
    },
  },
};

export default userResolver;
