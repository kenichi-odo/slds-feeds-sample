## Demo

![Demo](/documents/images/pc-demo.gif)

![Demo](/documents/images/mobile-demo.gif)

## Usage

Please install it so that `yarn` and `sfdx` can be executed.  
Also, please prepare to be able to create a scratch org by logging in with the following command to the organization that enabled `Dev Hub`.

```bash
sfdx force:auth:web:login -d -a DevHub
```

Then, by executing the following command, a scratch organization is created and the Web browser opens automatically.

```bash
yarn sorg:init
```

Since you can check the `Feeds` application from the application launcher, you can check the operation by accessing it.

## How to Develop

Please install the package necessary for development with the following command.

```bash
yarn
```

Then, use the following command to monitor the files under `src/apps/feeds`.
When editing and saving the file, the build will be done automatically.

```bash
yarn watch:feeds
```

Once the editing work is completed, the screen will be updated by executing the following command.

```
sfdx force:source:push
```
