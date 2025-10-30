import { UserRole, MenuItem, User } from './types';
import { 
    HomeIcon,
    GlobeAltIcon,
    StorefrontIcon,
    // PresentationChartLineIcon, // Re-assigned to Performansi
    TagIcon,
    // GaugeIcon, // No longer used in menu
    CrosshairsIcon,
    // ScaleIcon, // No longer used in menu
    // ExclamationCircleIcon, // Replaced for DOA
    DocumentTextIcon,
    // ChartBarSquareIcon, // Replaced for Monitoring POP
    CloudArrowUpIcon,
    UsersIcon,
    PresentationChartLineIcon, // Keep for Performansi
    ClipboardDocumentCheckIcon, // New for Sales Plan
    TicketIcon, // New for Program
    ReceiptPercentIcon, // New for Fee
    TruckIcon, // New for DOA
    MegaphoneIcon, // New for Monitoring POP
} from './components/icons';

export const MOCK_USERS: Record<string, User> = {
  'agus.purnomo': { id: 'user01', name: 'Agus Purnomo', role: UserRole.AdminSuper, avatarUrl: 'https://i.pravatar.cc/150?u=agus' },
  'budi.input': { id: 'user02', name: 'Budi Input', role: UserRole.AdminInput, avatarUrl: 'https://i.pravatar.cc/150?u=budi' },
  'cici.manager': { id: 'user03', name: 'Cici Manager', role: UserRole.Manager, avatarUrl: 'https://i.pravatar.cc/150?u=cici' },
  'dedi.spvids': { id: 'user04', name: 'Dedi SPV IDS', role: UserRole.SupervisorIDS, avatarUrl: 'https://i.pravatar.cc/150?u=dedi' },
  'eka.spvd2c': { id: 'user05', name: 'Eka SPV D2C', role: UserRole.SupervisorD2C, avatarUrl: 'https://i.pravatar.cc/150?u=eka' },
  'fani.salesforce': { id: 'user06', name: 'Fani Salesforce', role: UserRole.SalesforceIDS, avatarUrl: 'https://i.pravatar.cc/150?u=fani' },
  'gita.directsales': { id: 'user07', name: 'Gita Direct Sales', role: UserRole.DirectSalesD2C, avatarUrl: 'https://i.pravatar.cc/150?u=gita' },
};


export const MENU_ITEMS: MenuItem[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: HomeIcon,
    requiredRoles: Object.values(UserRole),
  },
  {
    path: '/sagala',
    name: 'Sagala',
    icon: GlobeAltIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager],
  },
  {
    name: 'Outlet',
    icon: StorefrontIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS],
    children: [
      { path: '/outlet/register', name: 'Outlet Register', requiredRoles: Object.values(UserRole) },
      { path: '/outlet/stock-perdana', name: 'Stock Perdana', requiredRoles: Object.values(UserRole) },
      { path: '/outlet/stock-voucher', name: 'Stock Voucher', requiredRoles: Object.values(UserRole) },
      { path: '/outlet/omzet', name: 'Omzet Outlet', requiredRoles: Object.values(UserRole) },
    ]
  },
    {
    name: 'Sales Plan',
    icon: ClipboardDocumentCheckIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
        { path: '/sales-plan/perdana', name: 'Perdana', requiredRoles: Object.values(UserRole) },
        { path: '/sales-plan/voucher-fisik', name: 'Voucher Fisik', requiredRoles: Object.values(UserRole) },
        { path: '/sales-plan/cvm', name: 'CVM', requiredRoles: Object.values(UserRole) },
        { path: '/sales-plan/monitoring-visit', name: 'Monitoring Visit', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'Sell Thru',
    icon: TagIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.DirectSalesD2C],
    children: [
        { path: '/sell-thru/nota', name: 'ST Nota', requiredRoles: Object.values(UserRole) },
        { path: '/sell-thru/digipos', name: 'ST Digipos', requiredRoles: Object.values(UserRole) },
        { path: '/sell-thru/penjualan-d2c', name: 'Penjualan D2C', requiredRoles: Object.values(UserRole) },
    ]
  },
    {
    name: 'Performansi',
    icon: PresentationChartLineIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
        { path: '/performance/5s4r', name: '5S 4R', requiredRoles: [UserRole.AdminSuper, UserRole.Manager] },
        { path: '/performance/top-line', name: 'Top Line', requiredRoles: Object.values(UserRole) },
        { path: '/performance/market-share', name: 'Market Share', requiredRoles: Object.values(UserRole) },
        { path: '/performance/aktifasi', name: 'Aktifasi', requiredRoles: Object.values(UserRole) },
        { path: '/performance/sellout', name: 'Sellout', requiredRoles: Object.values(UserRole) },
        { path: '/performance/inject-voucher', name: 'Inject Voucher Fisik', requiredRoles: Object.values(UserRole) },
        { path: '/performance/redeem-voucher', name: 'Redeem Voucher Fisik', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'KPI',
    icon: CrosshairsIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
       { path: '/kpi/cluster', name: 'KPI Cluster', requiredRoles: Object.values(UserRole) },
       { path: '/kpi/salesforce', name: 'KPI Salesforce', requiredRoles: Object.values(UserRole) },
       { path: '/kpi/d2c', name: 'KPI D2C', requiredRoles: Object.values(UserRole) },
    ]
  },
    {
    name: 'Program',
    icon: TicketIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
        { path: '/program/scs', name: 'SCS', requiredRoles: Object.values(UserRole) },
        { path: '/program/retina', name: 'Retina', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'Fee',
    icon: ReceiptPercentIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
         { path: '/fee/fee', name: 'Fee', requiredRoles: Object.values(UserRole) },
         { path: '/fee/management', name: 'Management Fee', requiredRoles: Object.values(UserRole) },
         { path: '/fee/marketing', name: 'Marketing Fee', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'DOA',
    icon: TruckIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS],
    children: [
        { path: '/doa/alokasi', name: 'Alokasi', requiredRoles: Object.values(UserRole) },
        { path: '/doa/list-sn', name: 'List SN', requiredRoles: Object.values(UserRole) },
        { path: '/doa/stock', name: 'Stock', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'Dokumentasi',
    icon: DocumentTextIcon,
    requiredRoles: [UserRole.AdminInput, UserRole.SupervisorIDS, UserRole.SupervisorD2C, UserRole.SalesforceIDS, UserRole.DirectSalesD2C],
    children: [
      { path: '/documentation', name: 'Form Kunjungan', requiredRoles: [UserRole.SupervisorIDS, UserRole.SupervisorD2C, UserRole.SalesforceIDS, UserRole.DirectSalesD2C] },
      { path: '/input-form', name: 'Input Form', requiredRoles: [UserRole.AdminInput, UserRole.SupervisorIDS, UserRole.SupervisorD2C, UserRole.SalesforceIDS, UserRole.DirectSalesD2C] },
      { path: '/video', name: 'Video Roleplay', requiredRoles: [UserRole.SalesforceIDS, UserRole.DirectSalesD2C, UserRole.SupervisorIDS, UserRole.SupervisorD2C] },
      { path: '/complaint', name: 'Komplain', requiredRoles: [UserRole.SupervisorIDS, UserRole.SupervisorD2C, UserRole.SalesforceIDS, UserRole.DirectSalesD2C] },
    ]
  },
  {
    path: '/pop-monitoring',
    name: 'Monitoring POP',
    icon: MegaphoneIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS],
  },
   {
    name: 'Data Upload Center',
    icon: CloudArrowUpIcon,
    requiredRoles: [UserRole.AdminSuper],
     children: [
        { path: '/admin/data-upload', name: 'Upload Database', requiredRoles: [UserRole.AdminSuper] },
        { path: '/admin/data-upload/manage', name: 'Manajemen File Data', requiredRoles: [UserRole.AdminSuper] },
        { path: '/admin/data-upload/connection', name: 'Pengaturan Koneksi', requiredRoles: [UserRole.AdminSuper] },
     ]
  },
   {
    path: '/admin/user-management',
    name: 'User Management',
    icon: UsersIcon,
    requiredRoles: [UserRole.AdminSuper],
  },
];