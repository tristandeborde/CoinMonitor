import { Dashboard } from './dashboard/dashboard';
import yargs from 'yargs';

// load the environment variables from the .env file
require('dotenv').config();

let argv = yargs(process.argv.slice(2))
    .usage('Usage: $0 -r [num] -s [string]')
    .locale('en')
    .options({
        r: { alias: 'refresh-rate', describe: 'refresh rate in seconds at which data should be updated', type: 'number', default: 10 },
        s: { alias: 'search-term', describe: 'keyword used to search for assets in backend', type: 'string', default: ""}
    })
    .coerce('r', (arg) => {
        if (arg < 1) {
            throw new Error('Refresh rate must be greater than 0');
        }
        return arg;
    })
    .parseSync();

let dash = new Dashboard(argv.r, argv.s);
dash.launch();