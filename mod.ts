import { GraphQLError, gql as gqlTag } from "./deps.ts";

export const gql = gqlTag as any;
export const GQLError = GraphQLError as any;
export { applyGraphQL, ApplyGraphQLOptions, ResolversProps } from "./applyGraphQL.ts";
