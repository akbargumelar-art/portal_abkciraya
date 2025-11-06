
import { SalesPlanVoucherData, SalesPlanProductData, SalesPlanPeriodData } from '../types';
import { outletData } from './outletData';

const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const flags: ('Retail' | 'Big Pareto' | 'Pareto Retail' | 'D2C')[] = ['Retail', 'Big Pareto', 'Pareto Retail', 'D2C'];
const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", ""];
const validities = ['3 Hari', '7 Hari', '15 Hari', '30 Hari'];
const pakets = ['VF 1.5GB', 'VF 2.5GB', 'VF 5GB', 'VF OMG 4.5GB', 'VF OMG 7GB'];

const getRandomDate = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
};

const generateWeeklyData = (): SalesPlanPeriodData => {
    const m1 = getRandomInt(5, 50);
    return {
        FM1: getRandomInt(5, 50),
        M1: m1,
        M: Math.floor(m1 * (0.8 + Math.random() * 0.5)),
    };
};

const generateProductData = (): SalesPlanProductData => {
    const w1 = generateWeeklyData();
    const w2 = generateWeeklyData();
    const w3 = generateWeeklyData();
    const w4 = generateWeeklyData();
    const w5 = generateWeeklyData();

    const total: SalesPlanPeriodData = {
        FM1: w1.FM1 + w2.FM1 + w3.FM1 + w4.FM1 + w5.FM1,
        M1: w1.M1 + w2.M1 + w3.M1 + w4.M1 + w5.M1,
        M: w1.M + w2.M + w3.M + w4.M + w5.M,
    };

    return { W1: w1, W2: w2, W3: w3, W4: w4, W5: w5, Total: total };
};


export const salesPlanVoucherData: SalesPlanVoucherData[] = outletData.map(outlet => {
    const simpatiData = generateProductData();
    const byuData = generateProductData();

    const totalVoucherData: SalesPlanProductData = {
        W1: {
            FM1: simpatiData.W1.FM1 + byuData.W1.FM1,
            M1: simpatiData.W1.M1 + byuData.W1.M1,
            M: simpatiData.W1.M + byuData.W1.M,
        },
        W2: {
            FM1: simpatiData.W2.FM1 + byuData.W2.FM1,
            M1: simpatiData.W2.M1 + byuData.W2.M1,
            M: simpatiData.W2.M + byuData.W2.M,
        },
        W3: {
            FM1: simpatiData.W3.FM1 + byuData.W3.FM1,
            M1: simpatiData.W3.M1 + byuData.W3.M1,
            M: simpatiData.W3.M + byuData.W3.M,
        },
        W4: {
            FM1: simpatiData.W4.FM1 + byuData.W4.FM1,
            M1: simpatiData.W4.M1 + byuData.W4.M1,
            M: simpatiData.W4.M + byuData.W4.M,
        },
        W5: {
            FM1: simpatiData.W5.FM1 + byuData.W5.FM1,
            M1: simpatiData.W5.M1 + byuData.W5.M1,
            M: simpatiData.W5.M + byuData.W5.M,
        },
        Total: {
            FM1: simpatiData.Total.FM1 + byuData.Total.FM1,
            M1: simpatiData.Total.M1 + byuData.Total.M1,
            M: simpatiData.Total.M + byuData.Total.M,
        },
    };

    return {
        ID_DIGIPOS: outlet.OUTLET_ID,
        NO_RS: outlet.NO_RS,
        NAMA_OUTLET: outlet.NAMA_OUTLET,
        SALESFORCE: outlet.NAMA_SALESFORCE,
        TAP: outlet.TAP,
        KABUPATEN: outlet.KABUPATEN,
        KECAMATAN: outlet.KECAMATAN,
        FLAG: getRandomElement(flags),
        HARI_PJP: getRandomElement(days),
        PLAN_DATE: getRandomDate(),
        VALIDITY: getRandomElement(validities),
        PAKET: getRandomElement(pakets),
        Simpati: simpatiData,
        byU: byuData,
        TotalVoucher: totalVoucherData,
    };
});
