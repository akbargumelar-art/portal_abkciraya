import { UserRole, MenuItem } from './types';
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
      { path: '/feature-unavailable', name: 'Stock Perdana', requiredRoles: Object.values(UserRole) },
      { path: '/feature-unavailable', name: 'Stock Voucher', requiredRoles: Object.values(UserRole) },
      { path: '/feature-unavailable', name: 'Omzet Outlet', requiredRoles: Object.values(UserRole) },
    ]
  },
    {
    name: 'Sales Plan',
    icon: ClipboardDocumentCheckIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
        { path: '/feature-unavailable', name: 'Perdana', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'Voucher Fisik', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'CVM', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'Monitoring Visit', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'Sell Thru',
    icon: TagIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.DirectSalesD2C],
    children: [
        { path: '/sell-thru/nota', name: 'ST Nota', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'ST Digipos', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'Penjualan D2C', requiredRoles: Object.values(UserRole) },
    ]
  },
    {
    name: 'Performansi',
    icon: PresentationChartLineIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
        { path: '/feature-unavailable', name: '5S 4R', requiredRoles: [UserRole.AdminSuper, UserRole.Manager] },
        { path: '/feature-unavailable', name: 'Top Line', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'Market Share', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'Aktifasi', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'Sellout', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'Inject Voucher Fisik', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'Redeem Voucher Fisik', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'KPI',
    icon: CrosshairsIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
       { path: '/feature-unavailable', name: 'KPI Cluster', requiredRoles: Object.values(UserRole) },
       { path: '/feature-unavailable', name: 'KPI Salesforce', requiredRoles: Object.values(UserRole) },
       { path: '/feature-unavailable', name: 'KPI D2C', requiredRoles: Object.values(UserRole) },
    ]
  },
    {
    name: 'Program',
    icon: TicketIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
        { path: '/feature-unavailable', name: 'SCS', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'Retina', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'Fee',
    icon: ReceiptPercentIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
         { path: '/feature-unavailable', name: 'Fee', requiredRoles: Object.values(UserRole) },
         { path: '/feature-unavailable', name: 'Management Fee', requiredRoles: Object.values(UserRole) },
         { path: '/feature-unavailable', name: 'Marketing Fee', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'DOA',
    icon: TruckIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS],
    children: [
        { path: '/feature-unavailable', name: 'Alokasi', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'List SN', requiredRoles: Object.values(UserRole) },
        { path: '/feature-unavailable', name: 'Stock', requiredRoles: Object.values(UserRole) },
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
