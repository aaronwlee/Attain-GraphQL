# Attain-GraphQL
A simple middleware for Attain deno framework.

## Simple example
```ts
import {
  App,
  Request,
  Response,
  logger,
  parser,
} from "https://deno.land/x/attain/mod.ts";
import {
  gql
} from "./deps.ts";
import { applyGraphQL } from "./applyGraphQL.ts";

const app = new App();

app.use(logger);
app.use(parser);

const types = gql`
type User {
  firstName: String
  lastName: String
}

input UserInput {
  firstName: String
  lastName: String
}

type ResolveType {
  done: Boolean
}

type Query {
  getUser(id: String): User 
}

type Mutation {
  setUser(input: UserInput!): ResolveType!
}
`;

const resolvers = {
  Query: {
    getUser: (parent: any, {id}: any, context: any, info: any) => {
      console.log("id", id);
      return {
        firstName: "wooseok",
        lastName: "lee",
      };
    },
  },
  Mutation: {
    setUser: (parent: any, {firstName, lastName}: any, context: any, info: any) => {
      console.log("input:", firstName, lastName);
      return {
        done: true,
      };
    },
  },
};

app.use(applyGraphQL({
  typeDefs: types,
  resolvers: resolvers,
  context: (req: Request) => {
    return { user: "Aaron" };
  },
  middlewares: [
    (req, res) => {
      console.log("heelo")
    }
  ],
  usePlayground: true
}));

console.log("Server at http://localhost:8080");
await app.listen({ port: 8080 });
```

## TODO
- [ ] Add cache
- [ ] Enable the upload
- [ ] Enable the JSON scalar
