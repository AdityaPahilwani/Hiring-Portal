import { createPost, likePost,getPosts } from "./utils.js";
const postResolver = {
  Query: {
    getPosts: async (parent, args, context, info) => {
      const res = await getPosts({ args, context });
      return res;
    }
  },
  Mutation: {
    createPost: async (parent, args, context, info) => {
      const res = await createPost({ args, context });
      return res;
    },
    likePost: async (parent, args, context, info) => {
      const res = await likePost({ args, context });
      return res;
    },
  },
};


export default postResolver