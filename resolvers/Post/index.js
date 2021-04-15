/** @format */

import {
  createPost,
  likePost,
  unLikePost,
  getPosts,
  getPostWithId,
} from "./utils.js";
import { isAuthorized } from "../Middleware/checkAuth.js";
const postResolver = {
  Query: {
    getPosts: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await getPosts({ args, context });
      return res;
    },
    getPostWithId: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await getPostWithId({ args, context });
      return res;
    },
  },
  Mutation: {
    createPost: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await createPost({ args, context });
      return res;
    },
    likePost: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await likePost({ args, context });
      return res;
    },
    unLikePost: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await unLikePost({ args, context });
      return res;
    },
  },
};

export default postResolver;
