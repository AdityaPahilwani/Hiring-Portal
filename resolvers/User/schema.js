import apollo from "apollo-server-express";
const { gql } = apollo;
const typeDefs = gql`
  type basicUserDetails {
    id: ID!,
    name: String,
    email: String,
    gender: String,
    profilePic: String,
    bio: String,
    userType: String,
  }

  type fullUserDetails {
    id: ID
    name: String,
    email: String,
    gender: String,
    profilePic: String,
    bio: String,
    userType: String,
    skills:[String],
    experience:[String],
    followers: [basicUserDetails],
    following: [basicUserDetails],
    requestedTo: [basicUserDetails],
    requestedBy: [basicUserDetails],
  }

  input userDetailsInputs {
    id: ID,
    name: String,
    email: String,
    password: String,
    gender: String,
    profilePic: String,
    bio: String,
    userType: String,
    skills:[String],
    experience:[String]
  }

  input userFollowerInputs{
    id: ID!,
    requestedTo: String!,
  }

  type authReturnType {
    success: Boolean,
    message: String,
    cookie: String,
    error:String,
    data:fullUserDetails
  }

  type userFollowerReturnType {
    success: Boolean,
    message: String,
    error:String,
  }

  type Query {
    getMe: fullUserDetails,
    getUser(input: ID): fullUserDetails
  }

  type Mutation {
    signIn(input: userDetailsInputs): authReturnType,
    signUp(input: userDetailsInputs): authReturnType,
    updateUser(input: userDetailsInputs): authReturnType,
    requestToFollowUser(input: userFollowerInputs): userFollowerReturnType,
    revokeToFollowUserRequest(input: userFollowerInputs): userFollowerReturnType,
    acceptFollowRequest(input: userFollowerInputs): userFollowerReturnType,
    declineFollowRequest(input: userFollowerInputs): userFollowerReturnType,
    unFollowUser(input: userFollowerInputs): userFollowerReturnType,
  }
`;

export default typeDefs;
