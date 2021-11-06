interface RawAsset {
    id: string;
    rank: string;
    name: string;
    symbol: string;
    marketCapUsd: string;
    priceUsd: string;
    changePercent24Hr: string;
}

export default RawAsset;

class Asset {
    id: string = "";
    rank: number = 0;
    name: string = "";
    symbol: string = "";
    marketCapUsd: number = 0;
    priceUsd: number = 0;
    changePercent24Hr: string = "";

    // Instantiate the object from a RawAsset
    constructor(raw: RawAsset) {
        this.id = raw.id;
        this.rank = parseInt(raw.rank);
        this.name = raw.name;
        this.symbol = raw.symbol;
        this.marketCapUsd = parseInt(raw.marketCapUsd);
        this.priceUsd = parseInt(raw.priceUsd);
        this.changePercent24Hr = parseFloat(raw.changePercent24Hr).toPrecision(2);
    }
}

export { Asset };