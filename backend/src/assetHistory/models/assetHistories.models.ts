import { AssetHistoryEvent }from './assetHistoryEvent.models';

class AssetHistories {
    [key: string]: {history: AssetHistoryEvent[], updatedAt: Date},
}

export default AssetHistories;