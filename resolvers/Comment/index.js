
import { createComment,getComments } from "./utils.js";
import { isAuthorized } from "../Middleware/checkAuth.js";
const commentResolver = {
  Query: {
    getComments: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await getComments({ args, context });
      return res;
    }
  },
  Mutation: {
    createComment: async (parent, args, context, info) => {
      await isAuthorized({ context });
      const res = await createComment({ args, context });
      return res;
    },
  },
};

export default commentResolver;



