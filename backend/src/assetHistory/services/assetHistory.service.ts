import fetch from 'node-fetch';
import CoincapRequestException from '../../common/exceptions/CoincapRequestException';
import AssetHistories from '../models/assetHistories.models';
import rawAssetHistoryEvent from '../models/assetHistoryEvent.models';
import { AssetHistoryEvent } from '../models/assetHistoryEvent.models';

/** 
 * This service class fetches history data concerning one Asset (i.e. a crypto-currency)
 * from the "/assets/:id/history" endpoint of the coincap.io API, and stores it in-memory.
 * The main reason this class exists is because we want to preserve the app logic 
 * handled by the controller from the fetches, storing, and other manoeuvers happening here. 
 * This way, we can add new endpoints from different sources without having to change the
 * controller, or use a DB instead of the cache, etc.
*/
class AssetHistoryService {
    // The endpoint to fetch data from.
    private endpoint: string = 'https://api.coincap.io/v2/assets';
    // In-memory cache for the history data.
    private assetHistories: AssetHistories = {};

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
     * Fetches data from the coincap.io API and stores it in-memory.
     * @param id string key used to identify an asset in the CoinCap API
     * @returns Array of AssetHistoryEvent, containing a time and a price
     */
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

    /* 
     * Main function. Checks if the data is fresh, and either fetches it from 
     * the API or returns the cached data.
     * @param id string key used to identify an asset in the CoinCap API
     * @returns an array of AssetHistoryEvent, containing a time and a price
     */
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

export default AssetHistoryService;