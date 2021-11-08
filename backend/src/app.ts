import express from 'express';
import Controller from './common/models/controller.models';
import AssetsController from './assets/assets.controller';
import AssetHistoryController from './assetHistory/assetHistory.controller';
import ErrorMiddleWare from './common/middleware/error.middleware';

// load the environment variables from the .env file
require('dotenv').config();

class App {
    public app: express.Application;
    public port: number;
    
    constructor(controllers: Controller[]) {
        this.app = express();
        // Make the app listen on port defined in environment variables
        this.port = parseInt(process.env.PORT as string, 10);
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private initializeErrorHandling() {
        // This middleware catches errors and formats them to be sent to the client.
        this.app.use(ErrorMiddleWare);
    }
    
    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`);
        });
    }
}

// Here, we need to allow requests for broad data concerning the top 150 assets, but also
// for the history of a particular Asset. This is achieved by using two different controllers.
const app = new App([new AssetsController(), new AssetHistoryController()]);
app.listen();