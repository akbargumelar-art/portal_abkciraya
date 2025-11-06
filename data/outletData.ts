
import { OutletData } from '../types';

// This data is procedurally generated to match the user's specifications:
// - 2,300 total outlets
// - 37 Salesforce across 5 TAPs
// - 77 Kecamatan across 3 Kabupaten/Kota

const tapsConfig = { "Pemuda": 9, "Palimanan": 9, "Kuningan": 7, "Lemahabang": 7, "Luragung": 5 };
const locations = {
    "Kabupaten Cirebon": ["Arjawinangun", "Astanajapura", "Babakan", "Beber", "Ciledug", "Ciwaringin", "Depok", "Dukupuntang", "Gebang", "Gegesik", "Gempol", "Greged", "Gunungjati", "Jamblang", "Kaliwedi", "Kapetakan", "Karangsembung", "Karangwareng", "Kedawung", "Klangenan", "Lemahabang", "Losari", "Mundu", "Pabedilan", "Pabuaran", "Palimanan", "Pangenan", "Panguragan", "Pasaleman", "Plered", "Plumbon", "Sedong", "Sumber", "Suranenggala", "Susukan", "Susukanlebak", "Talun", "Tengahtani", "Waled", "Weru"],
    "Kota Cirebon": ["Harjamukti", "Kejaksan", "Kesambi", "Lemahwungkuk", "Pekalipan"],
    "Kabupaten Kuningan": ["Ciawigebang", "Cibeureum", "Cibingbin", "Cidahu", "Cigandamekar", "Cigugur", "Cilebak", "Cilimus", "Cimahi", "Ciniru", "Cipicung", "Ciwaru", "Darma", "Garawangi", "Hantara", "Jalaksana", "Japara", "Kadugede", "Kalimanggis", "Karangkancana", "Kramatmulya", "Kuningan", "Lebakwangi", "Luragung", "Maleber", "Mandirancan", "Nusaherang", "Pancalang", "Pasawahan", "Selajambe", "Sindangagung", "Subang"]
};
const names = ["Ahmad Gunawan", "Arman Farid", "Asep Syaeful", "Azhari Saputra", "Ian Budiyana", "Ibrahim", "Sanusi", "Sujoni", "Yudi", "Adi Junaedi", "Agis Sunandar", "Agus Sarwoedi", "Akhmad Fauzi", "Andi Wiyanto", "Angga Prasetya", "Firman", "Moch Irawan", "Surya", "Ayip Syarifudin", "Devit Mulyana", "Jaka Darmawan", "M. Miftahul Falah", "Randy Aliantino", "Ryan Hikmawan", "Slamet Riyadi", "Arif Firmansyah", "Deden Akbar Rudin", "Hendra Jaya", "Maman Suherman", "Naseh Nasrullah", "Riki Riswanto", "Syalwa Alfifan", "Agus Suratman", "Hendi Yusuf", "Jaja Subagja", "Rizky Erik Ramdani", "Syahru Mumtahan"];

const salesforceMap: Record<string, string[]> = {};
Object.entries(tapsConfig).forEach(([tap, count]) => {
    const prefix = tap.substring(0, 3).toUpperCase();
    salesforceMap[tap] = Array.from({ length: count }, (_, i) => `SF-${prefix}-${String(i + 1).padStart(2, '0')}`);
});

const allSfCodes = Object.values(salesforceMap).flat();
const sfCodeToNameMap: Record<string, string> = {};
allSfCodes.forEach((code, index) => {
    sfCodeToNameMap[code] = names[index % names.length];
});

const allTaps = Object.keys(tapsConfig);
const allKabupaten = Object.keys(locations);

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const outletData: OutletData[] = Array.from({ length: 2300 }, (_, i) => {
    const outletId = `2${String(getRandomInt(10, 99))}00${String(i + 1).padStart(6, '0')}`;
    const noRs = `81${getRandomInt(100000000, 999999999)}`;
    const tap = getRandomElement(allTaps);
    const sfCode = getRandomElement(salesforceMap[tap]);
    const kabupaten = getRandomElement(allKabupaten);
    const kecamatan = getRandomElement(locations[kabupaten as keyof typeof locations]);
    const pjp = Math.random() > 0.2 ? 'PJP' : 'NON PJP';
    const fisik = Math.random() > 0.3 ? 'FISIK' : 'NON FISIK';
    let flag = '';
    if (pjp === 'PJP') {
        flag = fisik === 'FISIK' ? 'PJP FISIK' : 'PJP NON FISIK';
    }

    return {
        CREATE_AT: String(45000 + i % 800),
        OUTLET_ID: outletId,
        NAMA_OUTLET: `${getRandomElement(['Maju', 'Jaya', 'Berkah', 'Lancar', 'Sumber', 'Mitra'])} Cell ${i + 1}`,
        KELURAHAN: `${kecamatan.toUpperCase()}`,
        KECAMATAN: kecamatan,
        KABUPATEN: kabupaten,
        CLUSTER: "CIREBON",
        BRANCH: "CIREBON",
        REGIONAL: "JABAR",
        AREA: "JABOTABEK & JABAR",
        LONGITUDE: (108.2 + Math.random() * 0.4).toFixed(7),
        LATTITUDE: (-6.7 + Math.random() * -0.3).toFixed(7),
        NO_RS: noRs,
        NO_KONFIRMASI: noRs,
        KATEGORI: "TELCO",
        TIPE_OUTLET: "Counter Pulsa",
        FISIK: fisik,
        TIPE_LOKASI: "Residential",
        KLASIFIKASI: getRandomElement(['GOLD', 'SILVER', 'BRONZE']),
        JADWAL_KUNJUNGAN: "F4 - Kunjungan 1 Minggu sekali",
        TERAKHIR_DIKUNJUNGI: "05-OCT-25 10.18.19.333000 PM",
        SF_CODE: sfCode,
        NAMA_SALESFORCE: sfCodeToNameMap[sfCode],
        PJP: pjp,
        FLAG: flag,
        TAP: tap
    };
});