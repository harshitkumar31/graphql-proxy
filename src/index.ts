import { fetch } from 'cross-undici-fetch';
import { print } from 'graphql';
import { ApolloServer } from 'apollo-server';
import * as delegate from "@graphql-tools/delegate";
const { introspectSchema, wrapSchema } = require('@graphql-tools/wrap');


export const applicationProxyResolver = ({
    subschemaConfig,
    operation,
    transformedSchema,
}: {
    subschemaConfig: any,
    operation: any,
    transformedSchema: any,
}) => {
    return (_parent: any, _args: any, context: any, info: any) => {
        return delegate.delegateToSchema({
            schema: subschemaConfig,
            operation,
            operationName: info!.operation!.name!.value,
            context,
            info,
            transformedSchema,
        });
    };
}

const executor =  async ({ document , variables, context }: {document: any, variables: any, context: any}) => {
    const query = print(document)
    const fetchResult = await fetch('https://graphql.anilist.co/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        ...context?.headers
    },
    body: JSON.stringify({ query, variables })
})
return fetchResult.json()
}

const init = async () => {
    const schema = wrapSchema({
        schema: await introspectSchema(executor),
        executor,
        createProxyingResolver: applicationProxyResolver
    });
    
    const server = new ApolloServer({ 
        schema,
    });
    
    // The `listen` method launches a web server.
    server.listen(4001).then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });
    
}

init();