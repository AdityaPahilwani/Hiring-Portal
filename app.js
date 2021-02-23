import express from "express";
import http from "http";
import apollo from "apollo-server-express";
import session from "client-sessions";
import userDefs from "./resolvers/User/schema.js";
import userResolver from "./resolvers/User/index.js";
import postResolver from "./resolvers/Post/index.js";
import postDefs from "./resolvers/Post/schema.js";
import commentResolver from "./resolvers/Comment/index.js";
import commentDefs from "./resolvers/Comment/schema.js";
import sequelize from "./utils/database.js";
import POST from "./Model/post.js";
import COMMENT from "./Model/comment.js";
import USER from "./Model/user.js";
const { ApolloServer, gql } = apollo;

const app = express();

const PORT = 4000;
app.use(
  session({
    cookieName: "userSession",
    secret: "cat",
    duration: 28 * 24 * 60 * 60 * 1000, // 28 Days
    cookie: {
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 Days
      // secure: true,
    },
  })
);

const server = new ApolloServer({
  typeDefs: [userDefs, postDefs, commentDefs],
  resolvers: [userResolver, postResolver, commentResolver],
  context: (req) => ({
    authScope: req,
  }),
});

POST.belongsTo(USER, { sourceKey: "id", foreignKey: "postedBy" });
POST.hasMany(COMMENT, { sourceKey: 'id', targetKey: 'parentId' });
COMMENT.belongsTo(USER, { sourceKey: "id", foreignKey: "userId" });

sequelize
  .sync()
  .then((result) => {
    console.log("hwllloooo");
  })
  .catch((err) => {
    console.log(err);
  });

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`Now browse to http://localhost:${PORT}` + server.graphqlPath)
);
