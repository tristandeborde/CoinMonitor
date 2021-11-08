interface rawAssetHistoryEvent {
    priceUsd: string;
    time: number;
}

export default rawAssetHistoryEvent;

class AssetHistoryEvent {
    public priceUsd: number = 0;
    public time: string = "";

    constructor(raw: rawAssetHistoryEvent) {
        this.priceUsd = parseInt(raw.priceUsd, 10);
        this.time = this.parseTime(raw.time);
    }

    private parseTime(time: number): string {
        var d = new Date(time);
        return d.toISOString().slice(5, 10);
    }
}

export { AssetHistoryEvent };