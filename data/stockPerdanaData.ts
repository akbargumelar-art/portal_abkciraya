import { StockPerdanaData } from '../types';

const tapsConfig = { "Pemuda": 9, "Palimanan": 9, "Kuningan": 7, "Lemahabang": 7, "Luragung": 5 };

const salesforceMap: Record<string, string[]> = {};
Object.entries(tapsConfig).forEach(([tap, count]) => {
    const prefix = tap.substring(0, 3).toUpperCase();
    salesforceMap[tap] = Array.from({ length: count }, (_, i) => `SF-${prefix}-${String(i + 1).padStart(2, '0')}`);
});

const allSalesforce = Object.values(salesforceMap).flat();

const names = ["Ahmad Gunawan", "Arman Farid", "Asep Syaeful", "Azhari Saputra", "Ian Budiyana", "Ibrahim", "Sanusi", "Sujoni", "Yudi", "Adi Junaedi", "Agis Sunandar", "Agus Sarwoedi", "Akhmad Fauzi", "Andi Wiyanto", "Angga Prasetya", "Firman", "Moch Irawan", "Surya", "Ayip Syarifudin", "Devit Mulyana", "Jaka Darmawan", "M. Miftahul Falah", "Randy Aliantino", "Ryan Hikmawan", "Slamet Riyadi", "Arif Firmansyah", "Deden Akbar Rudin", "Hendra Jaya", "Maman Suherman", "Naseh Nasrullah", "Riki Riswanto", "Syalwa Alfifan", "Agus Suratman", "Hendi Yusuf", "Jaja Subagja", "Rizky Erik Ramdani", "Syahru Mumtahan"];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const stockPerdanaData: StockPerdanaData[] = allSalesforce.map((sf, index) => {
    const tap = Object.keys(salesforceMap).find(t => salesforceMap[t].includes(sf)) || 'Unknown';
    const pjp = getRandomInt(60, 80);
    const sellthruOutlet = Math.floor(pjp * (0.8 + Math.random() * 0.18));
    const stockGt0Outlet = Math.floor(sellthruOutlet * (0.75 + Math.random() * 0.23));
    const stockGt0RatePjp = pjp > 0 ? stockGt0Outlet / pjp : 0;
    const stock0Belanja = sellthruOutlet - stockGt0Outlet;
    const stock0Rate = sellthruOutlet > 0 ? stock0Belanja / sellthruOutlet : 0;
    const stock0Pjp = pjp - stockGt0Outlet;
    const stock0PjpRate = pjp > 0 ? stock0Pjp / pjp : 0;

    return {
        SALESFORCE: names[index % names.length],
        TAP: tap,
        PJP: pjp,
        SELLTHRU_OUTLET: sellthruOutlet,
        SELLTHRU_QTY: getRandomInt(1000, 5000),
        STOCK_GT_0_OUTLET: stockGt0Outlet,
        STOCK_GT_0_RATE_PJP: stockGt0RatePjp,
        STOCK_GT_0_QTY_OUTLET: getRandomInt(5, 40),
        STOCK_0_TO_OUTLET_BELANJA: stock0Belanja,
        STOCK_0_TO_OUTLET_RATE: stock0Rate,
        STOCK_0_TO_OUTLET_PJP: stock0Pjp,
        STOCK_0_TO_OUTLET_PJP_RATE: stock0PjpRate,
        STOCK_DAYS_SO_DAILY: getRandomInt(5, 15),
        STOCK_DAYS_STOCK_DAYS: getRandomInt(40, 250),
        STOCK_PER_QTY_1: getRandomInt(0, 10),
        STOCK_PER_QTY_2_5: getRandomInt(10, 30),
        STOCK_PER_QTY_6_10: getRandomInt(10, 25),
        STOCK_PER_QTY_11_20: getRandomInt(5, 20),
        STOCK_PER_QTY_GT_20: getRandomInt(0, 60)
    };
});
