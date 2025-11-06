
import { SellThruDigiposData } from '../types';
import { outletData } from './outletData';

const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const generateSellThruMetric = () => {
    const m1 = getRandomInt(10, 80);
    const m = Math.floor(m1 * (0.7 + Math.random() * 0.6));
    const target = Math.floor(m * (0.9 + Math.random() * 0.3));
    return {
        target,
        FM_1: getRandomInt(10, 80),
        M_1: m1,
        M: m,
    };
};

const generateSellThruData = (): Omit<SellThruDigiposData, keyof import('../types').SellThruOutletBase> => {
    const simpati = generateSellThruMetric();
    const byu = generateSellThruMetric();
    
    return {
        simpati,
        byu,
        total: {
            target: simpati.target + byu.target,
            FM_1: simpati.FM_1 + byu.FM_1,
            M_1: simpati.M_1 + byu.M_1,
            M: simpati.M + byu.M,
        }
    };
};

export const sellThruDigiposPerdanaData: SellThruDigiposData[] = outletData.map(outlet => ({
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

export const sellThruDigiposVoucherData: SellThruDigiposData[] = outletData.map(outlet => ({
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
