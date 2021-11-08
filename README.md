<div id="top"></div>

<!-- PROJECT LOGO -->
<h3 align="center">CoinMonitor</h3>

  <p align="center">
    Get the latest cryptocurrency data on your terminal.
    <br />
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#TODO">Usage</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

A small tool able to fetch infos on cryptocurrencies, coded in Typescript during a technical test for [Collective.work](https://www.collective.work/). The repo is divided in two parts, a small back-end responsible with fetching the coin data, and a CLI. 

<p align="right">(<a href="#top">back to top</a>)</p>



### Built With

* [Node.js](https://nodejs.org/en/)
* [Express](https://expressjs.com)
* [Blessed-contrib](https://github.com/yaronn/blessed-contrib)
* [CoinCap API](https://docs.coincap.io/)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started


### Prerequisites

Before launching the tool, you first need to install these two dependencies.
* **npm**:
  ```sh
  npm install npm@latest -g
  ```
* **docker**:
  You can follow the [official installation instructions](https://docs.docker.com/get-docker/) from Docker's website to get started.

### Installation

Once npm and docker are installed on your machine, you can start the tool! To do so, follow these steps:
1. Clone the repo:
   ```sh
   git clone https://github.com/tristandeborde/collective_tech_test.git
   ```
2. Get a free API Key at [https://coincap.io/api-key](https://coincap.io/api-key)
3. Create dot env files, and add your API key to it:
   ```sh
   echo 'PORT=5000\nCOINCAP_API_KEY="{YOURAPIKEY}"' >> backend/.env
   echo 'HOSTNAME=localhost\nPORT=5000' >> CLI/.env
   ```
4. Launch the backend container on your machine:
   ```sh
   make local
   ```
5. Launch the CLI:
   ```sh
   cd CLI
   npm run dev
   ```
6. Enjoy! :)

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- USAGE -->
## Usage

While launching the CLI, you can specify a refresh rate and a query string with which to search cryptocurrency (search is done on the back-end). To do so:
```sh
npm run dev -- -s="{YOURSEARCHQUERY}" -r={YOURREFRESHRATE}
```
If you want to get more usage info, simply use the help command:
```sh
npm run dev -- --help
```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- TODO -->
## TODO

- [ ] Adding a box displaying the coin logo in the CLI. First, add a script to scrape logos from https://cryptologos.cc/ at container start, and then serve these static files from Express. Blessed-contrib has got some impressive image widgets that can render images in the terminal ;)
- [ ] Create MVC base classes, especially for AssetsService and AssetHistoryService (CoinCapService class?), in order to further improve back-end architecture.
- [ ] Remote hosting of backend container, with Makefile command to deploy.

