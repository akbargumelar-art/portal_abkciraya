import { StockVoucherDetailData } from '../types';
import { outletData } from './outletData';

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export const stockVoucherDetailData: StockVoucherDetailData[] = outletData.map(outlet => {
    const totalPembelian = getRandomInt(50, 500);
    const totalSellout = Math.floor(totalPembelian * (0.8 + Math.random() * 0.15));
    const totalSoPayload = Math.floor(totalSellout * (0.9 + Math.random() * 0.08));
    
    return {
        ID_DIGIOS: outlet.OUTLET_ID,
        NO_RS: outlet.NO_RS,
        NAMA_OUTLET: outlet.NAMA_OUTLET,
        TAP: outlet.TAP,
        SALESFORCE: outlet.SF_CODE,
        KABUPATEN: outlet.KABUPATEN,
        KECAMATAN: outlet.KECAMATAN,
        HARI_PJP: getRandomElement(days),
        TOTAL_PEMBELIAN: totalPembelian,
        TOTAL_SELLOUT_BARCODE: totalSellout,
        TOTAL_SO_PAYLOAD: totalSoPayload,
        SISA_STOCK: getRandomInt(0, 50),
        SIMPATI_FM_1: getRandomInt(50, 200),
        SIMPATI_M_1: getRandomInt(40, 180),
        SIMPATI_M: getRandomInt(45, 190),
        BYU_FM_1: getRandomInt(20, 100),
        BYU_M_1: getRandomInt(15, 90),
        BYU_M: getRandomInt(18, 95)
    };
});
