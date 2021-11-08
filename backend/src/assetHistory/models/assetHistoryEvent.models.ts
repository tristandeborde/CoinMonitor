/*
 * Because CoinCap's API returns numerical values as strings,
 * our interface simply receives string values for all properties.
 * Type casting is achieved in the class below.
 */
interface rawAssetHistoryEvent {
    priceUsd: string;
    time: number;
}

export default rawAssetHistoryEvent;

/*
 * The class below is used to type cast the values of the interface.
 * The use of parseInt/parseFloat allows us to return numbers.
 */
class AssetHistoryEvent {
    public priceUsd: number = 0;
    public time: number = 0;

    constructor(raw: rawAssetHistoryEvent) {
        this.priceUsd = parseInt(raw.priceUsd, 10);
        this.time = raw.time;
    }
}

export { AssetHistoryEvent };