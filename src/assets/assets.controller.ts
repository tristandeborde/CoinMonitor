import express from 'express';
import AssetsService from './services/assets.service';
import Asset from './interfaces/asset.interface';
import Controller from './interfaces/controller.interface';

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
    }

    private getAllAssets = async (request: express.Request, response: express.Response) => {
        const assets: Asset[] = await this.assetsService.getAllAssets();
        response.send(assets);
    }

    private getAssetById = async (request: express.Request, response: express.Response) => {
        const id: string = request.params.id;
        const asset: Asset = await this.assetsService.getAsset(id);
        response.send(asset);
    }
};

export default AssetsController;