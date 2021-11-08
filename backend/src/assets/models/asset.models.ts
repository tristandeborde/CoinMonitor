/*
 * Because CoinCap's API returns numerical values as strings,
 * our interface simply receives string values for all properties.
 * Type casting is achieved in the class below.
 */
interface RawAsset {
    id: string;
    rank: string;
    name: string;
    symbol: string;
    supply: string;
    maxSupply: string;
    marketCapUsd: string;
    volumeUsd24Hr: string;
    priceUsd: string;
    changePercent24Hr: string;
    vwap24Hr: string;
}

export default RawAsset;

/*
 * The class below is used to type cast the values of the interface.
 * The heavy use of parseInt/parseFloat allows us to return numbers.
 */
class Asset {
    id: string = "";
    rank: number = 0;
    name: string = "";
    symbol: string = "";
    supply: number = 0;
    maxSupply: number = 0;
    marketCapUsd: number = 0;
    volumeUsd24Hr: number = 0;
    priceUsd: number = 0;
    changePercent24Hr: number = 0;
    vwap24Hr: number = 0;

    // Instantiate the object from a RawAsset
    constructor(raw: RawAsset) {
        this.id = raw.id;
        this.rank = parseInt(raw.rank);
        this.name = raw.name;
        this.symbol = raw.symbol;
        this.supply = parseInt(raw.supply);
        this.maxSupply = parseInt(raw.maxSupply);
        this.marketCapUsd = parseInt(raw.marketCapUsd);
        this.volumeUsd24Hr = parseInt(raw.volumeUsd24Hr);
        this.priceUsd = parseInt(raw.priceUsd);
        this.changePercent24Hr = parseFloat(raw.changePercent24Hr);
        this.vwap24Hr = parseFloat(raw.vwap24Hr);
    }
}

export { Asset };