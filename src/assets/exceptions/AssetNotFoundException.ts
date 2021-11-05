import HttpException from './HttpException';

class AssetNotFoundException extends HttpException {
  constructor(assetName: string) {
    super(404, "Could not find any asset for the search term " + assetName);
  }
}

export default AssetNotFoundException;