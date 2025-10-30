
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
  role: UserRole;
  avatarUrl?: string;
}

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
  PJP: string;
  FLAG: string;
}


export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}