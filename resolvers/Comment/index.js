
import { createComment,getComments } from "./utils.js";

const commentResolver = {
  Query: {
    getComments: async (parent, args, context, info) => {
      const res = await getComments({ args, context });
      return res;
    }
  },
  Mutation: {
    createComment: async (parent, args, context, info) => {
      const res = await createComment({ args, context });
      return res;
    },
  },
};

export default commentResolver;
