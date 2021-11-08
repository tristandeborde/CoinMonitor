import blessed from 'blessed';
import contrib from 'blessed-contrib';
import RawAsset, { Asset } from './models/CLIasset.models';
import fetch from 'node-fetch';
import rawAssetHistoryEvent, { AssetHistoryEvent } from './models/CLIassetHistory.models';


/* 
 * This class is the main class for the CLI. Its instances stores
 * blessed widgets instances and the data that they are displaying.
 */
export class Dashboard {
    endpoint: string = "http://" + process.env.HOSTNAME + ":" + process.env.PORT;
    // Blessed widgets
    screen: blessed.Widgets.Screen = blessed.screen({});
    table: any = {};
    line: any = {};
    lcd: any = {};
    pic: any = {};
    grid: any = {};
    // Widget data fetched from Back-end
    keys: string[] = ['rank', 'symbol', 'name', 'price', 'change'];
    table_data: Array<string|number>[] = [];
    line_data: any = {};
    selected: string = "bitcoin";
    assetIds: string[] = [];
    refresh_rate: number;
    search_term: string;
    lcd_it:number = 0;
    lcd_text: string[] = ['C', 'O', 'I', 'N', ' ', 'W', 'A', 'T', 'C', 'H', 'E', 'R'];

    constructor (refresh_rate: number, search_term: string) {
        this.refresh_rate = refresh_rate * 1000;
        this.search_term = search_term;
    }

    /*
     * Initialize the blessed widgets and data, set intervals and event catchers to refresh 
     * the latter.
     */
    launch() {
        // Create new blessed screen and grid
        this.screen = blessed.screen();
        this.grid = new contrib.grid({rows: 2, cols: 2, screen: this.screen});
        
        this.screen.key(['escape', 'q', 'C-c'], function(ch, key) {
            return process.exit(0);
        });
        
        // Create table widget to display the top 150 assets
        this.table = this.grid.set(0, 0, 1, 1, contrib.table, {
            keys: true, 
            vi: true,
            fg: 'white', 
            selectedFg: 'white', 
            selectedBg: 'blue', 
            interactive: true, 
            label: 'Cryptocurrencies - select one by pressing Enter!',
            width: '30%', 
            height: '30%', 
            border: {type: "line", fg: "cyan"}, 
            columnSpacing: 1,
            columnWidth: [8, 8, 20, 12, 12]
        });

        // Line chart to display Asset Price history
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

        // Little LCD display for uber-hacking purposes
        this.lcd = this.grid.set(1, 0, 1, 1, contrib.lcd, {
            segmentWidth: 0.06, // how wide are the segments in % so 50% = 0.5
            segmentInterval: 0.11, // spacing between the segments in % so 50% = 0.550% = 0.5
            strokeWidth: 0.11, // spacing between the segments in % so 50% = 0.5
            elements: 4, // how many elements in the display. or how many characters can be displayed
            elementSpacing: 4, // spacing between each element
            elementPadding: 2, // how far away from the edges to put the elements
            color: 'magenta', // color for the segments
            label: ''})
        this.lcd.setDisplay(this.lcd_text.slice(0, 4).join(''));

        this.table.focus();
        this.table.rows.on('select', (item: any, index: any) => {
            if (this.selected != this.assetIds[index]) {
                this.selected = this.assetIds[index];
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
        setInterval(() => {            
            this.lcd_it++;
            let curr: number = this.lcd_it % this.lcd_text.length;
            this.lcd.setDisplay(this.lcd_text.slice(curr, curr + 4).join(''));
            this.render();
        }, 1000);
    }

    /*
    * Get the top 150 assets' data from the server, and store it in the table_data variable.
    * If the search_term is not empty, filter the data.
    * @returns A promise that resolves to the table_data variable.
    */
    private async fetchTableData(): Promise<Array<string|number>[]> {
        let endpoint = this.endpoint + "/assets";
        if (this.search_term) {
            endpoint += "?search_term=" + this.search_term;
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

    /*
     * Get the selected asset's history data from the server, and store it in the
     * line_data variable. The data is formatted for the line widget.
     * @returns A promise that resolves to the line_data variable.
     */
    private async fetchLineData(): Promise<any> {
        // Pass id to fetch
        const response = await fetch(this.endpoint + "/history/" + this.selected);
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
    
    /*
     * Render the widgets and data.
     */
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
