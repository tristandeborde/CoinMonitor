import fetch from 'node-fetch';
import CoincapRequestException from '../exceptions/CoincapRequestException';
import RawAsset from '../interfaces/asset.interface';
import { Asset } from '../interfaces/asset.interface';
import AssetHistories from '../interfaces/assetHistories.interface';
import rawAssetHistoryEvent from '../interfaces/assetHistoryEvent.interface';
import { AssetHistoryEvent } from '../interfaces/assetHistoryEvent.interface';
import fuzzysort from 'fuzzysort';

// This class fetches data from the /assets endpoint of the coincap.io API
// and stores it in-memory.
class AssetsService {
    // The endpoint to fetch data from.
    private endpoint: string = 'https://api.coincap.io/v2/assets';
    // In-memory cache for the assets data.
    private assets: Asset[] = [];
    // In-memory cache for the history data.
    private assetHistories: AssetHistories = {};
    private updatedAt: Date = new Date();

    // Checks if data is fresh (X seconds elapsed since last fetch)
    private isDataFresh(threshold: number, updatedAt: Date): boolean {
        const now = new Date();
        const timeDiff = now.getTime() - updatedAt.getTime();
        const secondsElapsed = Math.floor(timeDiff / 1000);
        return secondsElapsed < threshold;
    }
    
    // Cast the node-fetch response to Array of Asset objects
    private async fetchAndCastToAssets(): Promise<Asset[]> {
        console.log("Fetching assets from " + this.endpoint);
        // Perform fetch with Bearer token header
        const res = await fetch(this.endpoint, {
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
        
    // Fetches all data from the coincap.io API 
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

    // Search for assets by name, and return the closest results
    public async searchAssets(search_term: string): Promise<Asset[]> {
        console.log("Searching for assets with search_term = " + search_term);
        // Get all assets in cache or fetch them
        const assets = await this.getAllAssets();
        // Sort them by name using search_term as the query
        const sorted = fuzzysort.go(search_term, assets, {key: "name", threshold: -10})
        let results = sorted.map(x => x.obj);
        return results;
    }

    private async fetchOneAssetHistory(id: string): Promise<AssetHistoryEvent[]> {
        console.log("Fetching history for " + id);
        const res = await fetch(this.endpoint + "/" + id + "/history?interval=d1", {
            headers: {
                'Authorization': 'Bearer ' + process.env.COINCAP_API_KEY
            }
        });
        if (!res.ok) {
            throw new CoincapRequestException(res.statusText);
        }
        const data = await (res.json() as Promise<{ data: rawAssetHistoryEvent[]; }>);
        // Cast the elements of data into AssetHistoryEvent objects
        let events: AssetHistoryEvent[] = [];
        for (const raw of data.data) {
            let event: AssetHistoryEvent = new AssetHistoryEvent(raw);
            events.push(event);
        }
        return events;
    }

    public async getAssetHistory(id: string): Promise<AssetHistoryEvent[]> {
        // Check if data is fresh, threshold is one day (interval)
        if (this.assetHistories[id] && this.isDataFresh(86400, this.assetHistories[id].updatedAt)) {
            return this.assetHistories[id].history.slice(0, 30);
        }

        // Call getAssetHistories to populate the history cache
        let history: AssetHistoryEvent[] = await this.fetchOneAssetHistory(id);
        this.assetHistories[id] = {
            history: history,
            updatedAt: new Date() // Store current time for freshness test later on
        };
        return history.slice(0,30);
    }
}

export default AssetsService;