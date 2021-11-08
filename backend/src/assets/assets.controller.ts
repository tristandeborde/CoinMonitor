import express, { NextFunction } from 'express';
import AssetsService from './services/assets.service';
import Controller from '../common/models/controller.models';
import AssetsNotFoundException from '../common/exceptions/AssetsNotFoundException';
import AssetNotFoundException from '../common/exceptions/AssetNotFoundException';
import { Asset } from './models/asset.models';


/* 
 * This controller class is used to handle all requests related to broad asset data.
 * It returns lists of Assets, where an Asset is defined as an object describing a 
 * crypto-currency and containing various data-points like rank, name, price in dollars, etc.
 * Just as for the AssetHistoryController, an AssetsService handles the 
 * app logic, so as to leave this controller database-agnostic.
*/
class AssetsController implements Controller {
    public path = '/assets';
    public router = express.Router();
    private assetsService = new AssetsService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAssets);
    }

    /*
     * Dispatch calls between getSearchAssets and getAllAssets, depending
     * on the existence of a query parameter 'search_term'.
     */
    private getAssets = async (request: express.Request, response: express.Response, next: NextFunction) => {
        if (request.query.search_term) {
            await this.getSearchAssets(request, response, next);
        } else {
            await this.getAllAssets(request, response, next);
        }
    }

    /*
     * Call the service function getAllAssets to get all the crypto assets data.
     * If any error happens, or if the asset could not be found, propagate the error
     * to the next middleware in the chain.
     * @param {Request} req - the express request object
     * @param {Response} res - the express response object
     * @param {NextFunction} next - the next function in the middleware chain
    */
    private getAllAssets = async (request: express.Request, response: express.Response, next: NextFunction) => {
        try {
            const assets: Asset[] = await this.assetsService.getAllAssets();
            if (assets && assets.length > 0) {
                response.send(assets);
            } else {
                next(new AssetsNotFoundException());
            }
        } catch (error) {
            next(error);
        }
    }


    /*
     * Call the service function searchAssets to retrieve one or more assets by name, 
     * in a fuzzy fashion.
     * If any error happens, or if the asset could not be found, propagate the error
     * to the next middleware in the chain.
     * @param {Request} req - the express request object
     * @param {Response} res - the express response object
     * @param {NextFunction} next - the next function in the middleware chain
     */
    private getSearchAssets = async (request: express.Request, response: express.Response, next: NextFunction) => {
        // 
        // Propagate any errors to the next middleware in the chain, or if the asset weren't found
        const search_term: any = request.query.search_term;
        try {
            const assets: Asset[] = await this.assetsService.searchAssets(search_term);
            console.log(assets)
            if (assets && assets.length > 0) {
                response.send(assets);
            } else {
                next(new AssetNotFoundException(search_term));
            }
        } catch (error) {
            next(error);
        }
    }
};

export default AssetsController;