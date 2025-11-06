
import { PenjualanD2CData } from '../types';

const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const d2cNames = [
  "Andi Wijaya", "Bunga Lestari", "Candra Setiawan", "Dewi Anggraini", "Eko Prasetyo",
  "Fitri Handayani", "Guntur Saputra", "Hesti Puspita", "Indra Kusuma", "Joko Susilo"
];
const cities = ["Cirebon", "Kuningan", "Indramayu", "Majalengka"];

const generatePerformanceMetric = (isAmount: boolean) => {
  const scale = isAmount ? 100000 : 10;
  const target = getRandomInt(20 * scale, 100 * scale);
  const m1 = getRandomInt(15 * scale, target * 1.1);
  return {
    target,
    fm1: getRandomInt(15 * scale, target * 1.2),
    m1,
    m: Math.floor(m1 * (0.8 + Math.random() * 0.5)),
  };
};

export const penjualanD2CData: PenjualanD2CData[] = d2cNames.map(name => ({
  namaD2C: name,
  city: cities[Math.floor(Math.random() * cities.length)],
  simpati: generatePerformanceMetric(false),
  byu: generatePerformanceMetric(false),
  voucherSimpati: generatePerformanceMetric(false),
  voucherByu: generatePerformanceMetric(false),
  rechargeAmount: generatePerformanceMetric(true),
  modem: generatePerformanceMetric(false),
}));
