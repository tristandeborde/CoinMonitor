import express, { NextFunction } from 'express';
import AssetsService from './services/assets.service';
import Controller from './interfaces/controller.interface';
import AssetsNotFoundException from './exceptions/AssetsNotFoundException';
import AssetNotFoundException from './exceptions/AssetNotFoundException';


class AssetsController implements Controller {
    public path = '/assets';
    public router = express.Router();
    private assetsService = new AssetsService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAllAssets);
        this.router.get(`${this.path}/:id`, this.getAssetById);
        this.router.get(`${this.path}/:id/history`, this.getAssetHistory);
    }

    private getAllAssets = async (request: express.Request, response: express.Response, next: NextFunction) => {
        // Call the service function getAllAssets to get all the crypto assets.
        // Propagate any errors to the next middleware in the chain, or throwone if no assets were found
        try {
            const assets = await this.assetsService.getAllAssets();
            if (assets) {
                response.send(assets);
            } else {
                next(new AssetsNotFoundException());
            }
        } catch (error) {
            next(error);
        }
    }

    private getAssetById = async (request: express.Request, response: express.Response, next: NextFunction) => {
        // Call the service function getAssetById to get a single crypto asset.
        // Propagate any errors to the next middleware in the chain, or if the asset weren't found

        const id: string = request.params.id;
        try {
            const asset = await this.assetsService.getAssetById(id);
            if (asset) {
                response.send(asset);
            } else {
                next(new AssetNotFoundException(id));
            }
        } catch (error) {
            next(error);
        }
    }

    private getAssetHistory = async (request: express.Request, response: express.Response, next: NextFunction) => {
        // Call the service function getAssetHistory to get a single crypto asset's history.
        // Propagate any errors to the next middleware in the chain, or if the asset weren't found

        const id: string = request.params.id;
        try {
            const asset = await this.assetsService.getAssetHistory(id);
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