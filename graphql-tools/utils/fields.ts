import { GraphQLFieldConfigMap, GraphQLObjectType, GraphQLFieldConfig, GraphQLSchema } from "../../deps.ts";
import { MapperKind } from './Interfaces.ts';
import { mapSchema } from './mapSchema.ts';
import { addTypes } from './addTypes.ts';

export function appendObjectFields(
  schema: GraphQLSchema,
  typeName: string,
  additionalFields: GraphQLFieldConfigMap<any, any>
): GraphQLSchema {
  if (schema.getType(typeName) == null) {
    return addTypes(schema, [
      new GraphQLObjectType({
        name: typeName,
        fields: additionalFields,
      }),
    ]);
  }

  return mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: type => {
      if (type.name === typeName) {
        const config = type.toConfig();
        const originalFieldConfigMap = config.fields;

        const newFieldConfigMap: any = {};
        Object.keys(originalFieldConfigMap).forEach(fieldName => {
          newFieldConfigMap[fieldName] = originalFieldConfigMap[fieldName];
        });
        Object.keys(additionalFields).forEach(fieldName => {
          newFieldConfigMap[fieldName] = additionalFields[fieldName];
        });

        return new GraphQLObjectType({
          ...config,
          fields: newFieldConfigMap,
        });
      }
    },
  });
}

export function removeObjectFields(
  schema: GraphQLSchema,
  typeName: string,
  testFn: (fieldName: string, field: GraphQLFieldConfig<any, any>) => boolean
): [GraphQLSchema, GraphQLFieldConfigMap<any, any>] {
  const removedFields: any = {};
  const newSchema = mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: type => {
      if (type.name === typeName) {
        const config = type.toConfig();
        const originalFieldConfigMap = config.fields;

        const newFieldConfigMap: any = {};
        Object.keys(originalFieldConfigMap).forEach(fieldName => {
          const originalFieldConfig = originalFieldConfigMap[fieldName];
          if (testFn(fieldName, originalFieldConfig)) {
            removedFields[fieldName] = originalFieldConfig;
          } else {
            newFieldConfigMap[fieldName] = originalFieldConfig;
          }
        });

        return new GraphQLObjectType({
          ...config,
          fields: newFieldConfigMap,
        });
      }
    },
  });

  return [newSchema, removedFields];
}

export function selectObjectFields(
  schema: GraphQLSchema,
  typeName: string,
  testFn: (fieldName: string, field: GraphQLFieldConfig<any, any>) => boolean
): GraphQLFieldConfigMap<any, any> {
  const selectedFields: any = {};
  mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: type => {
      if (type.name === typeName) {
        const config = type.toConfig();
        const originalFieldConfigMap = config.fields;

        Object.keys(originalFieldConfigMap).forEach(fieldName => {
          const originalFieldConfig = originalFieldConfigMap[fieldName];
          if (testFn(fieldName, originalFieldConfig)) {
            selectedFields[fieldName] = originalFieldConfig;
          }
        });
      }

      return undefined;
    },
  });

  return selectedFields;
}

export function modifyObjectFields(
  schema: GraphQLSchema,
  typeName: string,
  testFn: (fieldName: string, field: GraphQLFieldConfig<any, any>) => boolean,
  newFields: GraphQLFieldConfigMap<any, any>
): [GraphQLSchema, GraphQLFieldConfigMap<any, any>] {
  const removedFields: any = {};
  const newSchema = mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: type => {
      if (type.name === typeName) {
        const config = type.toConfig();
        const originalFieldConfigMap = config.fields;

        const newFieldConfigMap: any = {};
        Object.keys(originalFieldConfigMap).forEach(fieldName => {
          const originalFieldConfig = originalFieldConfigMap[fieldName];
          if (testFn(fieldName, originalFieldConfig)) {
            removedFields[fieldName] = originalFieldConfig;
          } else {
            newFieldConfigMap[fieldName] = originalFieldConfig;
          }
        });

        Object.keys(newFields).forEach(fieldName => {
          const fieldConfig = newFields[fieldName];
          newFieldConfigMap[fieldName] = fieldConfig;
        });

        return new GraphQLObjectType({
          ...config,
          fields: newFieldConfigMap,
        });
      }
    },
  });

  return [newSchema, removedFields];
}
