import fetch from 'node-fetch';
import CoincapRequestException from '../exceptions/CoincapRequestException';
import Asset from '../interfaces/asset.interface';

// This class fetches data from the /assets endpoint of the coincap.io API
// and stores it in-memory.
class AssetsService {
    // The endpoint to fetch data from.
    private endpoint: string = 'https://api.coincap.io/v2/assets';
    // In-memory store for the assets data.
    private assets: Asset[] = [];
    private lastFetch: Date = new Date();

    // Checks if data is fresh (X seconds elapsed since last fetch)
    private isDataFresh(threshold: number): boolean {
        const now = new Date();
        const timeDiff = now.getTime() - this.lastFetch.getTime();
        const secondsElapsed = Math.floor(timeDiff / 1000);
        return secondsElapsed < threshold;
    }
    
    // Cast the node-fetch response to Array of Asset objects
    private fetchAndCastToAssets(): Promise<Asset[]> {
        console.log("Fetching assets from " + this.endpoint);
        // Perform fetch with Bearer token header
        return fetch(this.endpoint, {
            headers: {
                'Authorization': 'Bearer ' + process.env.COINCAP_API_KEY
            }})
            .then(res => {
                if (!res.ok) {
                    throw new CoincapRequestException(res.statusText);
                }
                return res.json() as Promise<{data: Asset[]}>;
            })
            .then(data => {
                // Store current time for freshness test later on
                this.lastFetch = new Date();
                return data.data;
            });
        }
        
    // Fetches all data from the coincap.io API 
    public async getAllAssets(): Promise<Asset []> {
        // Check if data is fresh with arbitrary threshold of 10 seconds
        if (this.assets && this.assets.length > 0 && this.isDataFresh(10)) {
            return this.assets;
        }
        // Call fetchAndCastToAssets() and store the results in this.assets
        this.assets = await this.fetchAndCastToAssets();
        return this.assets;
    }

    // Fetches data for a specific asset
    public async getAssetById(id: string): Promise<Asset> {
        const assets = await this.getAllAssets();
        const asset = assets.find(a => a.id === id);
        if (!asset) {
            throw new Error("Asset with id " + id + " cloud not be found.");
        }
        return asset;
    }
}

export default AssetsService;