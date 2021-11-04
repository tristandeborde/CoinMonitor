interface Asset {
    id: string;
    rank: number;
    name: string;
    symbol: string;
    supply: number;
    maxSupply: number;
    marketCapUsd: number;
    volumeUsd24Hr: number;
    priceUsd: number;
    changePercent24Hr: number;
    vwap24Hr: number;
}

export default Asset;