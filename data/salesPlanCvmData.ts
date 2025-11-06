
import { SalesPlanCvmData, SalesPlanProductData, SalesPlanPeriodData } from '../types';
import { outletData } from './outletData';

const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const flags: ('Retail' | 'Big Pareto' | 'Pareto Retail' | 'D2C')[] = ['Retail', 'Big Pareto', 'Pareto Retail', 'D2C'];
const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", ""];

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


export const salesPlanCvmData: SalesPlanCvmData[] = outletData.map(outlet => {
    const cvmData = generateProductData();
    const superSeruData = generateProductData();

    const totalCvmData: SalesPlanProductData = {
        W1: {
            FM1: cvmData.W1.FM1 + superSeruData.W1.FM1,
            M1: cvmData.W1.M1 + superSeruData.W1.M1,
            M: cvmData.W1.M + superSeruData.W1.M,
        },
        W2: {
            FM1: cvmData.W2.FM1 + superSeruData.W2.FM1,
            M1: cvmData.W2.M1 + superSeruData.W2.M1,
            M: cvmData.W2.M + superSeruData.W2.M,
        },
        W3: {
            FM1: cvmData.W3.FM1 + superSeruData.W3.FM1,
            M1: cvmData.W3.M1 + superSeruData.W3.M1,
            M: cvmData.W3.M + superSeruData.W3.M,
        },
        W4: {
            FM1: cvmData.W4.FM1 + superSeruData.W4.FM1,
            M1: cvmData.W4.M1 + superSeruData.W4.M1,
            M: cvmData.W4.M + superSeruData.W4.M,
        },
        W5: {
            FM1: cvmData.W5.FM1 + superSeruData.W5.FM1,
            M1: cvmData.W5.M1 + superSeruData.W5.M1,
            M: cvmData.W5.M + superSeruData.W5.M,
        },
        Total: {
            FM1: cvmData.Total.FM1 + superSeruData.Total.FM1,
            M1: cvmData.Total.M1 + superSeruData.Total.M1,
            M: cvmData.Total.M + superSeruData.Total.M,
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
        CVM: cvmData,
        SuperSeru: superSeruData,
        TotalCVM: totalCvmData,
    };
});
