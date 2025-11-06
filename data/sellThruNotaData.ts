
import { SellThruNotaData } from '../types';
import { outletData } from './outletData';

const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const generateTimeSeries = (isAmount: boolean) => {
    const scale = isAmount ? 10000 : 1;
    const m1 = getRandomInt(5 * scale, 50 * scale);
    return {
        FM_1: getRandomInt(5 * scale, 50 * scale),
        M_1: m1,
        M: Math.floor(m1 * (0.8 + Math.random() * 0.5)),
    };
};

const generateSellThruData = (): Omit<SellThruNotaData, keyof import('../types').SellThruOutletBase> => {
    const qtySimpati = generateTimeSeries(false);
    const amountSimpati = generateTimeSeries(true);
    const qtyByu = generateTimeSeries(false);
    const amountByu = generateTimeSeries(true);

    return {
        qtySimpati,
        amountSimpati,
        qtyByu,
        amountByu,
        totalQty: {
            FM_1: qtySimpati.FM_1 + qtyByu.FM_1,
            M_1: qtySimpati.M_1 + qtyByu.M_1,
            M: qtySimpati.M + qtyByu.M,
        },
        totalAmount: {
            FM_1: amountSimpati.FM_1 + amountByu.FM_1,
            M_1: amountSimpati.M_1 + amountByu.M_1,
            M: amountSimpati.M + amountByu.M,
        }
    };
};

export const sellThruNotaPerdanaData: SellThruNotaData[] = outletData.map(outlet => ({
    ID_DIGIPOS: outlet.OUTLET_ID,
    NO_RS: outlet.NO_RS,
    NAMA_OUTLET: outlet.NAMA_OUTLET,
    SALESFORCE: outlet.NAMA_SALESFORCE,
    TAP: outlet.TAP,
    KABUPATEN: outlet.KABUPATEN,
    KECAMATAN: outlet.KECAMATAN,
    FLAG: outlet.FLAG as any,
// FIX: Spread the generated time-series data to populate the object correctly.
    ...generateSellThruData(),
}));

export const sellThruNotaVoucherData: SellThruNotaData[] = outletData.map(outlet => ({
    ID_DIGIPOS: outlet.OUTLET_ID,
    NO_RS: outlet.NO_RS,
    NAMA_OUTLET: outlet.NAMA_OUTLET,
    SALESFORCE: outlet.NAMA_SALESFORCE,
    TAP: outlet.TAP,
    KABUPATEN: outlet.KABUPATEN,
    KECAMATAN: outlet.KECAMATAN,
    FLAG: outlet.FLAG as any,
// FIX: Spread the generated time-series data to populate the object correctly.
    ...generateSellThruData(),
}));
