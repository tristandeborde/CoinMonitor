import express, { NextFunction } from 'express';
import AssetHistoryService from './services/assetHistory.service';
import Controller from '../models/controller.models';
import AssetsNotFoundException from '../exceptions/AssetsNotFoundException';
import AssetNotFoundException from '../exceptions/AssetNotFoundException';


class AssetsController implements Controller {
    public path = '/history';
    public router = express.Router();
    private assetHistoryService = new AssetHistoryService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/:id`, this.getAssetHistory);
    }

    private getAssetHistory = async (request: express.Request, response: express.Response, next: NextFunction) => {
        // Call the service function getAssetHistory to get a single crypto asset's history.
        // Propagate any errors to the next middleware in the chain, or if the asset weren't found

        const id: string = request.params.id;
        try {
            const asset = await this.assetHistoryService.getAssetHistory(id);
            if (asset) {
                response.send(asset);
            } else {
                next(new AssetNotFoundException(id));
            }
        } catch (error) {
            next(error);
        }
    }
};

export default AssetsController;