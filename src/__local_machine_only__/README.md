#External App Integration & Testing
In order to test integration with external apps we need to add a release copy of the app to local folder
named **__local_machine_only__**.
this guide will walk you through on how to host local apps,
such as Studio, Usage Dashboard, Live Dashboard, etc.


#about "__local_machine_only__" folder:
Due to cross domain issues, external apps which needed to be integrated and tested,
will be added and **hosted locally** using this folder.


> Note:  that the only purpose of this folder is for **Development & Testing**.
Any of the local apps being added to it shouldn't be added to the source control.


#Config new app
In Order to host a new local app we need to configure it first.
1. Copy **kmc-ng/src/configuration/server-config.template.json**
into same folder.
2. Rename copied file to **server-config.json** (remove 'template' keyword)
3. In order to add the new hosted app configuration:
* Go to **kmc-ng/src/configuration/server-config.ts** which contains an interface of the configuration named **ServerConfig** 
* Add configuration structure (keys & values types) under externalApps property (inside ServerConfig interface)
* Go to **kmc-ng/src/configuration/server-config.json**
* Add configuration keys & values under externalApps property
