import { Dashboard } from './dashboard/dashboard';

// load the environment variables from the .env file
require('dotenv').config();

let dash = new Dashboard();
dash.launch();