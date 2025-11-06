
import { OmzetOutletData } from '../types';
import { outletData } from './outletData';

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const getRandomDate = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
};

export const omzetOutletData: OmzetOutletData[] = outletData.map(outlet => {
    const recharge_fm_1 = getRandomInt(1000000, 5000000);
    const recharge_m_1 = getRandomInt(800000, 4500000);
    const inject_vf_fm_1 = getRandomInt(500000, 3000000);
    const inject_vf_m_1 = getRandomInt(400000, 2800000);
    const st_fm_1 = getRandomInt(200000, 1500000);
    const st_m_1 = getRandomInt(150000, 1400000);

    const recharge_m = Math.floor(recharge_m_1 * (0.8 + Math.random() * 0.4));
    const inject_vf_m = Math.floor(inject_vf_m_1 * (0.8 + Math.random() * 0.4));
    const st_m = Math.floor(st_m_1 * (0.8 + Math.random() * 0.4));

    return {
        ID_OUTLET: outlet.OUTLET_ID,
        NO_RS: outlet.NO_RS,
        NAMA_OUTLET: outlet.NAMA_OUTLET,
        TAP: outlet.TAP,
        SALESFORCE: outlet.SF_CODE,
        KABUPATEN: outlet.KABUPATEN,
        KECAMATAN: outlet.KECAMATAN,
        HARI_PJP: getRandomElement(days),
        TRANSACTION_DATE: getRandomDate(),
        RECHARGE_FM_1: recharge_fm_1,
        RECHARGE_M_1: recharge_m_1,
        RECHARGE_M: recharge_m,
        INJECT_VF_FM_1: inject_vf_fm_1,
        INJECT_VF_M_1: inject_vf_m_1,
        INJECT_VF_M: inject_vf_m,
        ST_FM_1: st_fm_1,
        ST_M_1: st_m_1,
        ST_M: st_m,
        TOTAL_OMZET_FM_1: recharge_fm_1 + inject_vf_fm_1 + st_fm_1,
        TOTAL_OMZET_M_1: recharge_m_1 + inject_vf_m_1 + st_m_1,
        TOTAL_OMZET_M: recharge_m + inject_vf_m + st_m,
    };
});
