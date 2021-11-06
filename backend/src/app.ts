import express from 'express';
import Controller from './assets/interfaces/controller.interface';
import AssetsController from './assets/assets.controller';
import ErrorMiddleWare from './middleware/error.middleware';

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
        this.app.use(ErrorMiddleWare);
    }
    
    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`);
        });
    }
}

const app = new App([new AssetsController()]);
app.listen();