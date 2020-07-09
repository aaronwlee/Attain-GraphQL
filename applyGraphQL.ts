import {
  Router,
  Request,
  Response,
} from "https://deno.land/x/attain/mod.ts";
import { graphql } from "./deps.ts";
import { renderPlaygroundPage } from "./graphql-playground-html/render-playground-html.ts";
import { makeExecutableSchema } from "./graphql-tools/schema/makeExecutableSchema.ts";
import { CallBackType } from "https://deno.land/x/attain/types.ts";

export interface ApplyGraphQLOptions {
  path?: string;
  typeDefs: any;
  resolvers: ResolversProps;
  context?: (req: Request) => any;
  middlewares?: CallBackType[];
  usePlayground?: boolean;
}

export interface ResolversProps {
  Query?: any;
  Mutation?: any;
  [dynamicProperty: string]: any;
}

export const applyGraphQL = <T>({
  path = "/graphql",
  typeDefs,
  resolvers,
  context,
  middlewares = [],
  usePlayground = true,
}: ApplyGraphQLOptions): T => {
  const graphqlMiddlewares: any = new Router();
  const newMiddlewares = middlewares;

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  newMiddlewares.push(async (req: Request, res: Response) => {
    if (req.hasBody) {
      try {
        const contextResult = context ? await context(req) : undefined;
        const { query, variables, operationName } = (await req.body()).value;
        const result = await graphql(
          schema,
          query,
          resolvers,
          contextResult,
          variables || undefined,
          operationName || undefined
        );

        res.status(200).send(result);
      } catch (error) {
        return res.status(200).send({
          data: null,
          errors: [{
            message: error.message ? error.message : error
          }]
        });
      }
    }
  })

  graphqlMiddlewares.get(path, async (req: Request, res: Response) => {
    if (usePlayground) {
      // perform more expensive content-type check only if necessary
      // XXX We could potentially move this logic into the GuiOptions lambda,
      // but I don't think it needs any overriding
      const prefersHTML = req.accepts("text/html");

      if (prefersHTML) {
        const playground = renderPlaygroundPage({
          endpoint: req.url.origin + path,
          subscriptionEndpoint: req.url.origin + path,
        });
        res.status(200).send(playground);
        return;
      }
    }
  });

  graphqlMiddlewares.post(path, ...newMiddlewares)

  return graphqlMiddlewares as T;
};


