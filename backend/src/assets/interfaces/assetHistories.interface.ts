import { AssetHistoryEvent }from './assetHistoryEvent.interface';

class AssetHistories {
    [key: string]: {history: AssetHistoryEvent[], updatedAt: Date},
}

export default AssetHistories;