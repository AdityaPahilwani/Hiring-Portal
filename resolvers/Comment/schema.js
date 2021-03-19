import apollo from "apollo-server-express";
const { gql } = apollo;
const commentDefs = gql`
  type commentReturnType {
    success: Boolean
    message: String
    error: String
    data: returnCreatedCommentData
  }
  type returnCreatedCommentData {
    id: ID!
  }

  type commentWithUser {
    userData: basicUserDetails
    comment: String
    id: String
  }
  type getCommentReturnType {
    success: Boolean
    message: String
    error: String
    data: [commentWithUser]
  }

  input commentInput {
    postId: String!
    comment: String!
  }

  extend type Query {
    getComments(input: getPostInput): getCommentReturnType
  }

  extend type Mutation {
    createComment(input: commentInput): commentReturnType
  }
`;

export default commentDefs;
