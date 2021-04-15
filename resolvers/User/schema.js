/** @format */

import apollo from "apollo-server-express";
const { gql } = apollo;
const typeDefs = gql`
  type basicUserDetails {
    id: ID!
    name: String
    email: String
    gender: String
    profilePic: String
    bio: String
    userType: String
  }

  type fullUserDetails {
    id: ID
    name: String
    email: String
    gender: String
    profilePic: String
    bio: String
    userType: String
    skills: [String]
    experience: [String]
    followers: [basicUserDetails]
    following: [basicUserDetails]
    requestedTo: [basicUserDetails]
    requestedBy: [basicUserDetails]
  }

  type gistFullUserDetails {
    id: ID
    name: String
    email: String
    gender: String
    profilePic: String
    bio: String
    userType: String
    skills: [String]
    experience: [String]
    totalFollowers: Int
    totalFollowing: Int
  }

  input userDetailsInputs {
    id: ID
    name: String
    email: String
    password: String
    gender: String
    profilePic: String
    bio: String
    userType: String
    skills: [String]
    experience: [String]
  }

  input userFollowerInputs {
    requestedTo: ID!
  }

  type authReturnType {
    success: Boolean
    message: String
    cookie: String
    error: String
    data: fullUserDetails
  }

  type userFollowerReturnType {
    success: Boolean
    message: String
    error: String
  }
  type userRelation {
    isAdmin: Boolean
    isFollowing: Boolean
    isFollower: Boolean
    hasSentRequest: Boolean
    hasReceivedRequest: Boolean
  }
  type getUserWithId {
    success: Boolean
    message: String
    error: String
    userRelation: userRelation
    data: gistFullUserDetails
  }
  type searchUsersReturnType {
    success: Boolean
    message: String
    error: String
    data: [basicUserDetails]
  }
  input searchUsersInput {
    pageNo:Int!
    search: String
    skills: [String]
  }
  input getUserInputId {
    userId: ID!
  }
  type Query {
    getMe: fullUserDetails
    getUser(input: getUserInputId): getUserWithId
    searchUsers(input: searchUsersInput): searchUsersReturnType
    getRequestedUsers: searchUsersReturnType
  }

  type Mutation {
    signIn(input: userDetailsInputs): authReturnType
    logout: authReturnType
    signUp(input: userDetailsInputs): authReturnType
    updateUser(input: userDetailsInputs): authReturnType
    requestToFollowUser(input: userFollowerInputs): userFollowerReturnType
    revokeToFollowUserRequest(input: userFollowerInputs): userFollowerReturnType
    acceptFollowRequest(input: userFollowerInputs): userFollowerReturnType
    declineFollowRequest(input: userFollowerInputs): userFollowerReturnType
    unFollowUser(input: userFollowerInputs): userFollowerReturnType
  }
`;

export default typeDefs;
