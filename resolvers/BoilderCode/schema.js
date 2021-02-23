import apollo from "apollo-server-express";
const { gql } = apollo;
const typeDefs = gql`

  input QueryInputs {
    parentId: String!,
    userId: String!,
    comment: String!,
  }
  
  type Data {
    firstName: String
    lastName: String
  }
  
  type Query {
    hello: String
  }
  
  type Mutation {
    test (input: QueryInputs): Data,
    anotherTest (input: QueryInputs2): String
  }
`;

export default typeDefs;
