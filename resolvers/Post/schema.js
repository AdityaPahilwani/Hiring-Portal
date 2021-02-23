import apollo from "apollo-server-express";
const { gql } = apollo;
const postDefs = gql`
  type post {
    id: ID,
    postedBy: basicUserDetails,
    postType: String,
    description: String,
    mediaLink: String,
    likes: Int,
    comments: [commentWithUser]
  }

  input createPostInput {
    postType: String,
    description: String,
    mediaLink: String,
  }
  input likePostInput {
    postId: ID!,
  }

  type postReturnType {
    success: Boolean,
    message: String,
    error: String,
    data: [post]
  }

  input getPostInput{
    pageNo: Int
  }

  extend type Query {
    getPosts(input: getPostInput): postReturnType
  },
  
  extend type Mutation {
    createPost(input: createPostInput): postReturnType,
    likePost(input: likePostInput): postReturnType
  }

`;

export default postDefs;
