import blessed from 'blessed';
import contrib from 'blessed-contrib';
import EventEmitter from 'events';
import RawAsset, { Asset } from './CLIasset_interface';
import fetch from 'node-fetch';

class AssetWatcher extends EventEmitter {
    endpoint: string = "http://localhost:8088/assets";
    screen: blessed.Widgets.Screen = blessed.screen({});
    table: any = {};
    grid: any = {};
    keys: string[] = ['rank', 'symbol', 'name', 'price', 'change'];
    table_data: Array<string|number>[] = [];

    constructor() {
        super();
    }

    launch() {
        // Create new blessed screen and grid
        this.screen = blessed.screen();
        this.grid = new contrib.grid({rows: 1, cols: 2, screen: this.screen});
        
        this.screen.key(['escape', 'q', 'C-c'], function(ch, key) {
            return process.exit(0);
        });
        
        this.table = this.grid.set(0, 0, 1, 1, contrib.table, {
            keys: true, 
            vi: true,
            fg: 'white', 
            selectedFg: 'white', 
            selectedBg: 'blue', 
            interactive: true, 
            label: 'Active Processes', 
            width: '30%', 
            height: '30%', 
            border: {type: "line", fg: "cyan"}, 
            columnSpacing: 1,
            columnWidth: [8, 8, 20, 12, 12]
        });

        
        this.table.focus();
        this.on('update', this.render);
        this.fetchData();
        // this.render();
        setInterval(() => {
            this.fetchData();
        }, 1000);
    }

    private fetchData() {
        this.fetchTableData().then((data) => {
            this.table_data = data;
            this.emit('update');
        });
    }
    
    private async fetchTableData(): Promise<Array<string|number>[]> {
        const response = await fetch(this.endpoint);
        const data = await response.json() as RawAsset[];
        let table_data: Array<string | number>[] = [];
        for (const raw of data) {
            let asset: Asset = new Asset(raw);
            table_data.push([asset.rank, asset.symbol, asset.name, asset.priceUsd, asset.changePercent24Hr]);
        }
        return table_data;
    }
    
    render() {
        this.table.setData({
            headers: this.keys,
            data: this.table_data,
        });
        this.screen.render();
    }
}

let watcher = new AssetWatcher();
watcher.launch();