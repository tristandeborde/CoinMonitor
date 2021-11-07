interface rawAssetHistoryEvent {
    priceUsd: string;
    time: number;
}

export default rawAssetHistoryEvent;

class AssetHistoryEvent {
    public priceUsd: number = 0;
    public time: number = 0;

    constructor(raw: rawAssetHistoryEvent) {
        this.priceUsd = parseInt(raw.priceUsd, 10);
        this.time = raw.time;
    }
}

export { AssetHistoryEvent };