import fetch from 'node-fetch';
import CoincapRequestException from '../../common/exceptions/CoincapRequestException';
import RawAsset from '../models/asset.models';
import { Asset } from '../models/asset.models';
import fuzzysort from 'fuzzysort';

/** 
 * This service class fetches an array of Assets (i.e. a crypto-currency) from the "/assets/"
 * endpoint of the coincap.io API, and stores it in-memory.
 * The main reason this class exists is because we want to preserve the app logic 
 * handled by the controller from the fetches, storing, and other manoeuvers happening here. 
 * This way, we can add new endpoints from different sources without having to change the
 * controller, or use a DB instead of the cache, etc.
*/
class AssetsService {
    // The endpoint to fetch data from.
    private endpoint: string = 'https://api.coincap.io/v2/assets';
    // In-memory cache for the assets data.
    private assets: Asset[] = [];
    private updatedAt: Date = new Date();

    /* 
     * Checks if data is fresh (X seconds elapsed since last fetch).
     * @param threshold number of seconds before which data is considered fresh
     * @param updatedAt time of last fetch
     */
    private isDataFresh(threshold: number, updatedAt: Date): boolean {
        const now = new Date();
        const timeDiff = now.getTime() - updatedAt.getTime();
        const secondsElapsed = Math.floor(timeDiff / 1000);
        return secondsElapsed < threshold;
    }
    
    /* 
     * Cast the node-fetch response to an Array of Asset objects.
     * This is necessary because the coincap.io API returns a JSON object with
     * every property of the Asset being a string; and we want to cast some 
     * some numerical properties from string to number. 
     * @returns Promise of an Array of Asset objects
     */
    private async fetchAndCastToAssets(): Promise<Asset[]> {
        console.log("Fetching assets from " + this.endpoint);
        // Perform fetch with Bearer token header
        const res = await fetch(this.endpoint + "?limit=150", {
            headers: {
                'Authorization': 'Bearer ' + process.env.COINCAP_API_KEY
            }
        });
        if (!res.ok) {
            throw new CoincapRequestException(res.statusText);
        }
        const data = await (res.json() as Promise<{ data: RawAsset[]; }>);
        // Cast the array of RawAssets Interface instances to real Asset objects
        let assets: Asset[] = [];
        for (const raw of data.data) {
            let asset: Asset = new Asset(raw);
            assets.push(asset);
        }
        return assets;
        }
        
    /* 
     * Fetches all 150 Assets from the coincap.io API. We first check if the data is fresh,
     * and either fetch it from the API or return the cached data.
     * @returns Promise of an Array of Asset objects
     */
    public async getAllAssets(): Promise<Asset []> {
        // Check if data is fresh with arbitrary threshold of 10 seconds
        if (this.assets && this.assets.length > 0 && this.isDataFresh(10, this.updatedAt)) {
            return this.assets;
        }
        // Call fetchAndCastToAssets() to populate the assets cache
        this.assets = await this.fetchAndCastToAssets();
        // Store current time for freshness test later on
        this.updatedAt = new Date();
        return this.assets;
    }

    /*
     * Search for assets by name, and return the closest results. This is
     * mainly a wrapper around getAllAssets, with a fuzzy search running
     * on the assets array to find the closest matches.
     * @param search_term query string to search for
     * @returns Promise of an Array of Asset objects
     */
    public async searchAssets(search_term: string): Promise<Asset[]> {
        console.log("Searching for assets with search_term = " + search_term);
        // Get all assets in cache or fetch them
        const assets = await this.getAllAssets();
        // Sort them by name using search_term as the query
        const sorted = fuzzysort.go(search_term, assets, {key: "name", threshold: -10})
        let results = sorted.map(x => x.obj);
        return results;
    }
}

export default AssetsService;