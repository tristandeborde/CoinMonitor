import AssetsService from "../services/assets.service";

describe ("In the AssetsService", () => {
    const service = new AssetsService();

    describe("the getAssets function", () => {
        it("should return an array of assets", async () => {
            const assets = await service.getAllAssets();
            expect(assets).toBeInstanceOf(Array);
        });
        it("should return an array of assets with the correct properties", async () => {
            const assets = await service.getAllAssets();
            expect(assets[0]).toHaveProperty("id");
            expect(assets[0]).toHaveProperty("rank");
            expect(assets[0]).toHaveProperty("name");
            expect(assets[0]).toHaveProperty("symbol");
            expect(assets[0]).toHaveProperty("supply");
            expect(assets[0]).toHaveProperty("maxSupply");
            expect(assets[0]).toHaveProperty("marketCapUsd");
            expect(assets[0]).toHaveProperty("volumeUsd24Hr");
            expect(assets[0]).toHaveProperty("priceUsd");
            expect(assets[0]).toHaveProperty("changePercent24Hr");
            expect(assets[0]).toHaveProperty("vwap24Hr");
        });
        it("should return an array of assets with the correct values", async () => {
            const assets = await service.getAllAssets();
            expect(assets[0].id).toBe("bitcoin");
            expect(assets[0].rank).toBe(1);
            expect(assets[0].name).toBe("Bitcoin");
            expect(assets[0].symbol).toBe("BTC");
        });
        it("should return the same array of assets if 10 seconds have not elapsed", async () => {
            const assets = await service.getAllAssets();
            // Call the function every second until 10 seconds have elapsed
            for (let i = 0; i < 10; i++) {
                const assets2 = await service.getAllAssets();
                // Check that the array is the same
                expect(assets2).toMatchObject(assets);
                // Wait 1 second
                await new Promise(f => setTimeout(f, 1000));
            }
        }, 10500);
    });
});