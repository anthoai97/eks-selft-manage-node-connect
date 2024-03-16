import "reflect-metadata";
import express from 'express';
import * as path from "path";
import Container from "typedi";
import { buildSchema } from "type-graphql";
import { RecipeResolver } from "./example/recipe-resolver";
import { graphqlHTTP } from "express-graphql";
import { EC2RequestResolver } from "./resolvers/ec2/ec2.resolver";
import { SERVICE_INJECTION } from "./common/constants";
import { EC2Service } from "./services/ec2/ec2.service";
import { loadEKSSecretFromEnv } from "./utils/utils";

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

Container.set({ id: SERVICE_INJECTION.ec2, factory: () => new EC2Service(process.env.REGION, loadEKSSecretFromEnv()) });

async function bootstrap() {
  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [RecipeResolver, EC2RequestResolver],
    validate: { forbidUnknownValues: false },
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    container: Container,
  });

  var app = express();
  let contextPath = process.env.CONTEXT_PATH != undefined ? `${process.env.CONTEXT_PATH}/graphql` : '/graphql';
  app.use(
    contextPath,
    graphqlHTTP({
      schema: schema,
      // rootValue: root,
      graphiql: true,
    })
  );

  app.listen(4000);
  console.log(`Running a GraphQL API server at ${contextPath}`);
}

bootstrap()