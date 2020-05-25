# Attain-GraphQL
A simple graphql middleware for Attain deno framework.

## Simple example
```ts
import {
  App,
  Request,
  Response,
  logger,
  parser,
} from "https://deno.land/x/attain/mod.ts";
import { applyGraphQL, gql } from "https://raw.githubusercontent.com/aaronwlee/Attain-GraphQL/master/mod.ts";

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
  resolvers: resolvers
}));

console.log("Server at http://localhost:8080");
await app.listen({ port: 8080 });
```

## TODO
- [ ] Add cache
- [ ] Enable the upload
- [ ] Enable the JSON scalar

## Method
### gql 
> [GraphQL-tag](https://github.com/apollographql/graphql-tag)
Parsing GraphQL queries
- `gql` A JavaScript template literal tag that parses GraphQL query strings into the standard GraphQL AST.

### applyGraphQL
A Generator which based Attain Router class creates some middlewares for supporting the GraphQL.
> Options
- path?: string <br /> A target path that handles the GraphQL post request (__*optional__: default as `/graphql`)
- typeDefs: any <br /> generated type tags by the `gql`
- resolvers: any <br /> An object that handles the queries and mutations
```ts
const resolvers = {
  Query: {
    getUser: (parent: any, {id}: any, context: any, info: any) => {
      // ...query handling function here
    },
  },
  Mutation: {
    addUser: (parent: any, {firstName, lastName}: any, context: any, info: any) => {
      // ...add user codes here
    },
  }
}
```
> The resolvers will be received these four parameters
> - parents: The return value of the resolver for this field's parent
> - args: An object that contains all GraphQL arguments provided for this field.
> - context: An object shared across all resolvers that are executing for a particular operation.
> - info: Contains information about the operation's execution state, including the field name, the path to the field from the root, and more.
- context?: any <br /> Send any objects to each resolver (__*optional__)
- middlewares?: CallBackType[]; <br /> `(req, res) => any` add array of middlewares into before execute the GQL post request (__*optional__)
- usePlayground?: boolean; <br /> enable the playground at get method (__*optional__: default as `true`)
