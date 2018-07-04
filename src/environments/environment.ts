// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

/*************************************************
 * Developer notice:
 * To simplify usage of the configuration consider exposing
 * those properties in 'src/configuration/global-config.ts' file
 *************************************************/

export const environment = {
  production: false,
    configurationUri: 'server-config.json',
    configurationTimeout: 10000,
    client: {
      useSecuredProtocol: false
    },
    server: {
      useSecuredProtocol: true
    }
}
