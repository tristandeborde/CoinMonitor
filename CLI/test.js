var blessed = require('blessed')
  , contrib = require('blessed-contrib')
  , screen = blessed.screen()
  , grid = new contrib.grid({rows: 1, cols: 1, screen: screen})

var table = grid.set(0, 0, 1, 1, contrib.table, {
    keys: true
   , vi: true
   , fg: 'white'
   , selectedFg: 'white'
   , selectedBg: 'blue'
   , interactive: true
   , label: 'Active Processes'
   , width: '30%'
   , height: '30%'
   , border: {type: "line", fg: "cyan"}
   , columnSpacing: 10
   , columnWidth: [16, 12]})

table.focus()

table.setData(
 { headers: ['col1', 'col2']
 , data:
  [ [1, 2]
  , [3, 4]
  , [5, 6]
  , [7, 8] ]})

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.render()