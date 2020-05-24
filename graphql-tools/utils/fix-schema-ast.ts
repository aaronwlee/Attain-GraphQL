import { GraphQLSchema, BuildSchemaOptions, buildSchema } from "../../deps.ts";
import { SchemaPrintOptions } from './types.ts';
import { printSchemaWithDirectives } from './print-schema-with-directives.ts';

function buildFixedSchema(schema: GraphQLSchema, options: BuildSchemaOptions & SchemaPrintOptions) {
  return buildSchema(printSchemaWithDirectives(schema, options), {
    noLocation: true,
    ...(options || {}),
  });
}

export function fixSchemaAst(schema: GraphQLSchema, options: BuildSchemaOptions & SchemaPrintOptions) {
  let schemaWithValidAst: GraphQLSchema;
  if (!schema.astNode) {
    Object.defineProperty(schema, 'astNode', {
      get() {
        if (!schemaWithValidAst) {
          schemaWithValidAst = buildFixedSchema(schema, options);
        }
        return schemaWithValidAst.astNode;
      },
    });
  }
  if (!schema.extensionASTNodes) {
    Object.defineProperty(schema, 'extensionASTNodes', {
      get() {
        if (!schemaWithValidAst) {
          schemaWithValidAst = buildFixedSchema(schema, options);
        }
        return schemaWithValidAst.extensionASTNodes;
      },
    });
  }
  return schema;
}
