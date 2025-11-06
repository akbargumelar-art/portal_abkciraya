
import React from 'react';

export enum UserRole {
  AdminSuper = 'Admin Super',
  AdminInput = 'Admin Input Data',
  Manager = 'Manager',
  SupervisorIDS = 'Supervisor (IDS)',
  SupervisorD2C = 'Supervisor Direct Sales (D2C)',
  SalesforceIDS = 'Salesforce (IDS)',
  DirectSalesD2C = 'Direct Sales (D2C)',
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
}

// Type for form submission/creation
export type UserFormData = Omit<User, 'id'> & {
  password?: string;
};


export interface MenuItem {
  path?: string;
  name: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: MenuItem[];
  requiredRoles: UserRole[];
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
}

// Detailed outlet data type from CSV for the data table
export interface OutletData {
  CREATE_AT: string;
  OUTLET_ID: string;
  NAMA_OUTLET: string;
  KELURAHAN: string;
  KECAMATAN: string;
  KABUPATEN: string;
  CLUSTER: string;
  BRANCH: string;
  REGIONAL: string;
  AREA: string;
  LONGITUDE: string;
  LATTITUDE: string;
  NO_RS: string;
  NO_KONFIRMASI: string;
  KATEGORI: string;
  TIPE_OUTLET: string;
  FISIK: string;
  TIPE_LOKASI: string;
  KLASIFIKASI: string;
  JADWAL_KUNJUNGAN: string;
  TERAKHIR_DIKUNJUNGI: string;
  SF_CODE: string;
  NAMA_SALESFORCE: string;
  PJP: string;
  FLAG: string;
  TAP: string;
}

export interface StockPerdanaData { // This is now for the SUMMARY dashboard
  SALESFORCE: string;
  TAP: string;
  PJP: number;
  SELLTHRU_OUTLET: number;
  SELLTHRU_QTY: number;
  STOCK_GT_0_OUTLET: number;
  STOCK_GT_0_RATE_PJP: number;
  STOCK_GT_0_QTY_OUTLET: number;
  STOCK_0_TO_OUTLET_BELANJA: number;
  STOCK_0_TO_OUTLET_RATE: number;
  STOCK_0_TO_OUTLET_PJP: number;
  STOCK_0_TO_OUTLET_PJP_RATE: number;
  STOCK_DAYS_SO_DAILY: number;
  STOCK_DAYS_STOCK_DAYS: number;
  STOCK_PER_QTY_1: number;
  STOCK_PER_QTY_2_5: number;
  STOCK_PER_QTY_6_10: number;
  STOCK_PER_QTY_11_20: number;
  STOCK_PER_QTY_GT_20: number;
}

export interface StockPerdanaDetailData {
  ID_DIGIOS: string;
  NO_RS: string;
  NAMA_OUTLET: string;
  TAP: string;
  SALESFORCE: string;
  KABUPATEN: string;
  KECAMATAN: string;
  HARI_PJP: string;
  TOTAL_PEMBELIAN: number;
  TOTAL_SELLOUT_BARCODE: number;
  TOTAL_SO_PAYLOAD: number;
  SISA_STOCK: number;
  // Simpati
  SIMPATI_FM_1: number;
  SIMPATI_M_1: number;
  SIMPATI_M: number;
  // byU
  BYU_FM_1: number;
  BYU_M_1: number;
  BYU_M: number;
}

export interface StockVoucherData {
  SALESFORCE: string;
  TAP: string;
  PJP: number;
  SELLTHRU_OUTLET: number;
  SELLTHRU_QTY: number;
  STOCK_GT_0_OUTLET: number;
  STOCK_GT_0_RATE_PJP: number;
  STOCK_GT_0_QTY_OUTLET: number;
  STOCK_0_TO_OUTLET_BELANJA: number;
  STOCK_0_TO_OUTLET_RATE: number;
  STOCK_0_TO_OUTLET_PJP: number;
  STOCK_0_TO_OUTLET_PJP_RATE: number;
  STOCK_DAYS_SO_DAILY: number;
  STOCK_DAYS_STOCK_DAYS: number;
  STOCK_PER_QTY_1: number;
  STOCK_PER_QTY_2_5: number;
  STOCK_PER_QTY_6_10: number;
  STOCK_PER_QTY_11_20: number;
  STOCK_PER_QTY_GT_20: number;
}

export interface StockVoucherDetailData {
  ID_DIGIOS: string;
  NO_RS: string;
  NAMA_OUTLET: string;
  TAP: string;
  SALESFORCE: string;
  KABUPATEN: string;
  KECAMATAN: string;
  HARI_PJP: string;
  TOTAL_PEMBELIAN: number;
  TOTAL_SELLOUT_BARCODE: number;
  TOTAL_SO_PAYLOAD: number;
  SISA_STOCK: number;
  // Simpati
  SIMPATI_FM_1: number;
  SIMPATI_M_1: number;
  SIMPATI_M: number;
  // byU
  BYU_FM_1: number;
  BYU_M_1: number;
  BYU_M: number;
}

export interface OmzetOutletData {
  ID_OUTLET: string;
  NO_RS: string;
  NAMA_OUTLET: string;
  TAP: string;
  SALESFORCE: string;
  KABUPATEN: string;
  KECAMATAN: string;
  HARI_PJP: string;
  TRANSACTION_DATE: string;
  RECHARGE_FM_1: number;
  RECHARGE_M_1: number;
  RECHARGE_M: number;
  INJECT_VF_FM_1: number;
  INJECT_VF_M_1: number;
  INJECT_VF_M: number;
  ST_FM_1: number;
  ST_M_1: number;
  ST_M: number;
  TOTAL_OMZET_FM_1: number;
  TOTAL_OMZET_M_1: number;
  TOTAL_OMZET_M: number;
}


export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

// --- New Types for Sales Plan Perdana Page ---
export interface SalesPlanPeriodData {
    FM1: number;
    M1: number;
    M: number;
}

export interface SalesPlanProductData {
    W1: SalesPlanPeriodData;
    W2: SalesPlanPeriodData;
    W3: SalesPlanPeriodData;
    W4: SalesPlanPeriodData;
    W5: SalesPlanPeriodData;
    Total: SalesPlanPeriodData;
}

export interface SalesPlanPerdanaData {
    ID_DIGIPOS: string;
    NO_RS: string;
    NAMA_OUTLET: string;
    SALESFORCE: string;
    TAP: string;
    KABUPATEN: string;
    KECAMATAN: string;
    FLAG: 'Retail' | 'Big Pareto' | 'Pareto Retail' | 'D2C';
    HARI_PJP: string;
    PLAN_DATE: string;
    Simpati: SalesPlanProductData;
    byU: SalesPlanProductData;
    TotalPerdana: SalesPlanProductData;
}

// --- New Types for Sales Plan Voucher Page ---
export interface SalesPlanVoucherData {
    ID_DIGIPOS: string;
    NO_RS: string;
    NAMA_OUTLET: string;
    SALESFORCE: string;
    TAP: string;
    KABUPATEN: string;
    KECAMATAN: string;
    FLAG: 'Retail' | 'Big Pareto' | 'Pareto Retail' | 'D2C';
    HARI_PJP: string;
    PLAN_DATE: string;
    VALIDITY: string;
    PAKET: string;
    Simpati: SalesPlanProductData;
    byU: SalesPlanProductData;
    TotalVoucher: SalesPlanProductData;
}

// --- New Types for Sales Plan CVM Page ---
export interface SalesPlanCvmData {
    ID_DIGIPOS: string;
    NO_RS: string;
    NAMA_OUTLET: string;
    SALESFORCE: string;
    TAP: string;
    KABUPATEN: string;
    KECAMATAN: string;
    FLAG: 'Retail' | 'Big Pareto' | 'Pareto Retail' | 'D2C';
    HARI_PJP: string;
    PLAN_DATE: string;
    CVM: SalesPlanProductData;
    SuperSeru: SalesPlanProductData;
    TotalCVM: SalesPlanProductData;
}

// --- SellThru Base ---
// FIX: Export the SellThruOutletBase interface to make it available for use in other modules.
export interface SellThruOutletBase {
  ID_DIGIPOS: string;
  NO_RS: string;
  NAMA_OUTLET: string;
  SALESFORCE: string;
  TAP: string;
  KABUPATEN: string;
  KECAMATAN: string;
  FLAG: 'Retail' | 'Big Pareto' | 'Pareto Retail' | 'D2C';
}
interface TimeSeries {
  FM_1: number;
  M_1: number;
  M: number;
}
interface SellThruMetricWithTarget extends TimeSeries {
    target: number;
}

// --- SellThru Nota ---
export interface SellThruNotaData extends SellThruOutletBase {
  qtySimpati: TimeSeries;
  amountSimpati: TimeSeries;
  qtyByu: TimeSeries;
  amountByu: TimeSeries;
  totalQty: TimeSeries;
  totalAmount: TimeSeries;
}

// --- SellThru Digipos ---
export interface SellThruDigiposData extends SellThruOutletBase {
  simpati: SellThruMetricWithTarget;
  byu: SellThruMetricWithTarget;
  total: SellThruMetricWithTarget;
}

// --- Penjualan D2C ---
export interface PerformanceMetric {
  target: number;
  fm1: number;
  m1: number;
  m: number;
}
export interface PenjualanD2CData {
  namaD2C: string;
  city: string;
  simpati: PerformanceMetric;
  byu: PerformanceMetric;
  voucherSimpati: PerformanceMetric;
  voucherByu: PerformanceMetric;
  rechargeAmount: PerformanceMetric;
  modem: PerformanceMetric;
}
