import blessed from 'blessed';
import contrib from 'blessed-contrib';
import RawAsset, { Asset } from './interfaces/CLIasset_interface';
import fetch from 'node-fetch';
import rawAssetHistoryEvent, { AssetHistoryEvent } from './interfaces/CLIassetHistory_interface';

export class Dashboard {
    endpoint: string = "http://" + process.env.HOSTNAME + ":" + process.env.PORT + "/assets";
    screen: blessed.Widgets.Screen = blessed.screen({});
    table: any = {};
    line: any = {};
    grid: any = {};
    keys: string[] = ['rank', 'symbol', 'name', 'price', 'change'];
    table_data: Array<string|number>[] = [];
    line_data: any = {};
    selected: string = "bitcoin";
    assetIds: string[] = [];
    refresh_rate: number;
    search_term: string;

    constructor (refresh_rate: number, search_term: string) {
        this.refresh_rate = refresh_rate * 1000;
        this.search_term = search_term;
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
        this.table.rows.on('select', (item: any, index: any) => {
            if (this.selected != this.assetIds[index + 1]) {
                this.selected = this.assetIds[index + 1];
                this.fetchLineData().then((data) => {
                    this.line_data = data;
                    this.render();
                });
            };
        });
        
        this.table.focus();
        this.fetchTableData().then((data) => {
            this.table_data = data;
            this.render();
        })
        this.fetchLineData().then((data) => {
            this.line_data = data;
            this.render();
            });
        if (this.refresh_rate) {
            setInterval(() => {
                this.fetchTableData().then((data) => {
                    this.table_data = data;
                    this.render();
                });
            }, this.refresh_rate);
        }
    }

    private async fetchTableData(): Promise<Array<string|number>[]> {
        let endpoint = this.endpoint;
        if (this.search_term) {
            endpoint = this.endpoint + "?search_term=" + this.search_term;
        }
        const response = await fetch(endpoint);
        const data = await response.json() as RawAsset[];
        let table_data: Array<string | number>[] = [];
        let i : number = 0;
        for (const raw of data) {
            let asset: Asset = new Asset(raw);
            table_data.push([asset.rank, asset.symbol, asset.name, asset.priceUsd, asset.changePercent24Hr]);
            // Store the asset id (e.g. "bitcoin") for fetchLineData calls later on
            this.assetIds[i++] = asset.id;
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