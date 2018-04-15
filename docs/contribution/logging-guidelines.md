# KMCng logging

Maintaining complex software is almost impossible without good tracking of all errors and events. Logging the application enables you to:
- Have a better understanding of how your application works.
- Discover what errors you have.
- find out if your services are running properly.

## Log events
Log events can have different severity levels - in some cases, you just want to log events with at least a warning level, sometimes log lines have to be more verbose.

Our application support the following log levels:
- **fatal** - an error happened which broke the application. This level is usually used by intercepting unhnadled errors by the framework, you shouldn't set this level manually.
- **error** - the system is in distress, customers are probably being affected (or will soon be) and the fix probably requires human intervention. The "2AM rule" applies here- if you're on call, do you want to be woken up at 2AM if this condition happens? If yes, then log it as "error"
- **warn** - an unexpected technical or business event happened, customers may be affected, but probably no immediate human intervention is required. On call people won't be called immediately, but support personnel will want to review these issues asap to understand what the impact is. Basically any issue that needs to be tracked but may not require immediate intervention.
- **info** - things you want to see at high volume in case you need to forensically analyze an issue. System lifecycle events (system start, stop) go here. "Session" lifecycle events (login, logout, etc.) go here. Significant boundary events should be considered as well (e.g. server API calls). Typical business exceptions can go here (e.g. login failed due to bad credentials). Any other event you think you'll need to see in production at high volume goes here.
- **debug** - just about everything that doesn't make the "info" cut... any message that is helpful in tracking the flow through the system and isolating issues, especially during the development and QA phases. You use "debug" level logs for entry/exit of most non-trivial methods and marking interesting events and decision points inside methods.
- **trace** - You should not use this often, but this would be for extremely detailed and potentially high volume logs that you don't typically want enabled even during normal development. Examples include dumping a full object hierarchy, logging some state during every iteration of a large loop, etc.

## What should be logged
> A successful logging will allow understanding the what happened by reading the logs only.

You should log anything that happen in the application. A best way to know if your logs are efficient is by simulating scenarios and reviewing their logs.

## What should not be logged
When you are adding context, you can add almost everything. Still there is a rule of thumb that you should follow: never, ever log:
 - credentials
 - passwords
 - any sensitive information (for example ks)

## Log message structure
- Start with the action (send data / enter state / exit state etc.)
- In the operation details, specify if the operation is preformed `against the server` or `by the user` (where applicable).
- Provide any required information coming from the data in the `context` argument such as IDs, names, system names etc.
- To prevent performance hit:
  - try to keep the context as thin as possible.
  - Don't dump full objects into the log.
  - Avoid complex manipulation on the context.

### Log examples
see the following log examples, taken from file `edit-role.component.ts`:
```
this._logger.info(`enter new role mode`);
this._logger.info(`enter edit role mode for existing role`,{ id: this.role.id, name: this.role.name });
this._logger.info(`handle successful update by the server`);
this._logger.warn(`handle failing update by the server`);
this._logger.info(`handle retry request by the user`);
this._logger.info(`handle dismiss request by the user`);
this._logger.info(`update role permissions set`);
this._logger.debug(`add permission to role`, { permission: value.name });
this._logger.debug(`remove permission from role`, { permission: value.name });
this._logger.info(`send updated role to the server`);
this._logger.info(`send new role to the server`);
this._logger.info(`handle save request by the user`);
this._logger.info(`abort action, role has invalid data`);
this._logger.info(`abort action, role permissions has invalid selections`);
```

### Add logger instance to a component
1. import `KalturaLogger`:
```
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
```

2. add provider to `KalturaLogger`, use the same name as the component name:
```
@Component({
  providers: [
      KalturaLogger.createLogger('EditRoleComponent')
  ]
})
export class EditRoleComponent {
}
```


### Add logger instance to a service
1. import `KalturaLogger`:
```
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
```

2. create sub logger as shown below, use the same name as the service name:
```
@Injectable()
export class YourServiceName {

    private _logger: KalturaLogger;

    constructor(logger: KalturaLogger) {
        this._logger = logger.subLogger('YourServiceName');
    }
}
```


### External links
- [Logging levels - Logback - rule-of-thumb to assign log levels](https://stackoverflow.com/questions/7839565/logging-levels-logback-rule-of-thumb-to-assign-log-levels)