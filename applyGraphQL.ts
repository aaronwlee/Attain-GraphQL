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

export const applyGraphQL = ({
  path = "/graphql",
  typeDefs,
  resolvers,
  context,
  middlewares = [],
  usePlayground = true,
}: ApplyGraphQLOptions): Router => {
  const graphqlMiddlewares = new Router();
  const newMiddlewares = middlewares;

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  newMiddlewares.push(async (req: Request, res: Response) => {
    if (req.hasBody) {
      try {
        const result = await graphql(
          schema,
          req.params.query ? req.params.query : (await req.body()).value.query,
          resolvers,
          context ? await context(req) : undefined,
        );
        if (result.data) {
          return res.status(200).send(result);
        } else if (result.errors) {
          const { errors } = result;
          return res.status(400).send({ error: { errors } });
        }
        return res.status(400).send("gql Error");
      } catch (error) {
        return res.status(400).send({ error });
      }
    }
  
    res.status(400).send("body required");
  })

  graphqlMiddlewares.get(path, async (req: Request, res: Response) => {
    if (usePlayground) {
      // perform more expensive content-type check only if necessary
      // XXX We could potentially move this logic into the GuiOptions lambda,
      // but I don't think it needs any overriding
      const prefersHTML = req.accepts("text/html");

      if (prefersHTML) {
        const playground = renderPlaygroundPage({
          endpoint: req.url.origin,
          subscriptionEndpoint: req.url.origin + path,
        });
        res.status(200).send(playground);
        return;
      }
    }
  });

  graphqlMiddlewares.post(path, ...newMiddlewares)

  return graphqlMiddlewares;
};


