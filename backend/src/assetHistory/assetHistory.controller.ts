import express, { NextFunction } from 'express';
import AssetHistoryService from './services/assetHistory.service';
import Controller from '../common/models/controller.models';
import AssetNotFoundException from '../common/exceptions/AssetNotFoundException';
import { AssetHistoryEvent } from './models/assetHistoryEvent.models';


/* 
 * This controller class is used to handle all requests related to asset history.
 * Here, history is defined as the price of an asset over time.
 * Just as for the AssetsController, an AssetHistoryService handles the 
 * app logic, so as to leave this controller database-agnostic.
*/
class AssetHistoryController implements Controller {
    public path = '/history';
    public router = express.Router();
    private assetHistoryService = new AssetHistoryService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/:id`, this.getAssetHistory);
    }

    /* 
     * Call the service function getAssetHistory to get a single crypto asset's history.
     * If any error happens, or if the asset could not be found, propagate the error
     * to the next middleware in the chain
     * @param {Request} req - the express request object
     * @param {Response} res - the express response object
     * @param {NextFunction} next - the next function in the middleware chain
    */
    private getAssetHistory = async (request: express.Request, response: express.Response, next: NextFunction) => {

        const id: string = request.params.id;
        try {
            const history: AssetHistoryEvent[] = await this.assetHistoryService.getAssetHistory(id);
            if (history && history.length > 0) {
                response.send(history);
            } else {
                next(new AssetNotFoundException(id));
            }
        } catch (error) {
            next(error);
        }
    }
};

export default AssetHistoryController;