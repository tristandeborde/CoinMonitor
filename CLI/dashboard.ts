import blessed from 'blessed';
import contrib from 'blessed-contrib';
import EventEmitter from 'events';
import RawAsset, { Asset } from './CLIasset_interface';
import fetch from 'node-fetch';
import rawAssetHistoryEvent, { AssetHistoryEvent } from './CLIassetHistory_interface';

class AssetWatcher extends EventEmitter {
    endpoint: string = "http://localhost:8088/assets";
    screen: blessed.Widgets.Screen = blessed.screen({});
    table: any = {};
    line: any = {};
    grid: any = {};
    keys: string[] = ['rank', 'symbol', 'name', 'price', 'change'];
    table_data: Array<string|number>[] = [];
    line_data: any = {};
    selected: string = "bitcoin";
    assetIds: string[] = [];

    constructor() {
        super();
    }

    launch() {
        // Create new blessed screen and grid
        this.screen = blessed.screen();
        this.grid = new contrib.grid({rows: 2, cols: 2, screen: this.screen});
        
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
            label: 'Cryptocurrencies',
            width: '30%', 
            height: '30%', 
            border: {type: "line", fg: "cyan"}, 
            columnSpacing: 1,
            columnWidth: [8, 8, 20, 12, 12]
        });

        this.line = this.grid.set(0, 1, 1, 1, contrib.line, {
            style:
                { line: "yellow"
                , text: "green"
                , baseline: "black"}, 
            xLabelPadding: 3, 
            xPadding: 5, 
            showLegend: true, 
            wholeNumbersOnly: false, //true=do not show fraction in y axis
            label: 'Price in USD'
        });

        this.table.focus();
        this.on('update', this.render);
        this.table.rows.on('select', (item: any, index: any) => {
            if (this.selected != this.assetIds[index + 1]) {
                this.selected = this.assetIds[index + 1];
                this.fetchLineData().then((data) => {
                    this.line_data = data;
                    this.emit('update');
                });
            };
        });
        
        this.table.focus();
        this.fetchTableData().then((data) => {
            this.table_data = data;
            this.emit('update');
        })
        this.fetchLineData().then((data) => {
            this.line_data = data;
            this.emit('update');
            });
        setInterval(() => {
            this.fetchTableData().then((data) => {
                this.table_data = data;
                this.emit('update');
            });
        }, 2000);
    }

    private async fetchTableData(): Promise<Array<string|number>[]> {
        const response = await fetch(this.endpoint);
        const data = await response.json() as RawAsset[];
        let table_data: Array<string | number>[] = [];
        for (const raw of data) {
            let asset: Asset = new Asset(raw);
            table_data.push([asset.rank, asset.symbol, asset.name, asset.priceUsd, asset.changePercent24Hr]);
            this.assetIds[asset.rank] = asset.id;
        }
        return table_data;
    }

    private async fetchLineData(): Promise<any> {
        // Pass id to fetch
        const response = await fetch(this.endpoint + "/" + this.selected + "/history");
        const data = await response.json() as rawAssetHistoryEvent[];
        
        let line_data_x: Array<string> = [];
        let line_data_y: Array<number> = [];
        for (const raw of data) {
            let asset: AssetHistoryEvent = new AssetHistoryEvent(raw);
            line_data_x.push(asset.time);
            line_data_y.push(asset.priceUsd);
        }
        let line_data = {
            title: this.selected,
            x: line_data_x,
            y: line_data_y
        };
        return line_data;
    };
    
    render() {
        this.table.setData({
            headers: this.keys,
            data: this.table_data,
        });
        this.line.setData([{
            title: this.line_data.title,
            x: this.line_data.x,
            y: this.line_data.y
        }]);
        this.screen.render();
    }
}

let watcher = new AssetWatcher();
watcher.launch();