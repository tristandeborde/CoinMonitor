import HttpException from './HttpException';

class AssetsNotFoundException extends HttpException {
  constructor() {
    super(404, 'Could not find any asset at all...');
  }
}

export default AssetsNotFoundException;