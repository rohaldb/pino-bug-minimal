import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { DirectiveLocation, GraphQLDirective } from "graphql";
import { upperDirectiveTransformer } from "./common/directives/upper-case.directive";
import { RecipesModule } from "./recipes/recipes.module";
import { LoggerModule } from "nestjs-pino";

@Module({
  imports: [
    RecipesModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: "schema.gql",
      transformSchema: (schema) => upperDirectiveTransformer(schema, "upper"),
      installSubscriptionHandlers: true,
      buildSchemaOptions: {
        directives: [
          new GraphQLDirective({
            name: "upper",
            locations: [DirectiveLocation.FIELD_DEFINITION],
          }),
        ],
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        redact: ["req.headers.authorization", "req.body.id"],
        serializers: {
          req(req) {
            req.body = req.raw.body;
            return req;
          },
        },
      },
    }),
  ],
})
export class AppModule {}
