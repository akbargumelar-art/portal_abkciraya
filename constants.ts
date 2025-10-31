import { UserRole, MenuItem } from './types';
import { 
    HomeIcon,
    GlobeAltIcon,
    StorefrontIcon,
    CameraIcon,
    CloudArrowUpIcon,
    UsersIcon,
    ClipboardDocumentCheckIcon,
    BoxIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ComplaintIcon,
    CreditCardIcon,
    FeeIcon,
    FlagIcon,
    SparklesIcon
} from './components/icons';

const unavailable = (featureName: string) => `/feature-unavailable?feature=${encodeURIComponent(featureName.toLowerCase().replace(/\s/g, '-'))}`;

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
      { path: unavailable('Stock Perdana'), name: 'Stock Perdana', requiredRoles: Object.values(UserRole) },
      { path: unavailable('Stock Voucher'), name: 'Stock Voucher', requiredRoles: Object.values(UserRole) },
      { path: unavailable('Omzet Outlet'), name: 'Omzet Outlet', requiredRoles: Object.values(UserRole) },
    ]
  },
    {
    name: 'Sales Plan',
    icon: ClipboardDocumentCheckIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
        { path: unavailable('Perdana'), name: 'Perdana', requiredRoles: Object.values(UserRole) },
        { path: unavailable('Voucher Fisik'), name: 'Voucher Fisik', requiredRoles: Object.values(UserRole) },
        { path: unavailable('CVM'), name: 'CVM', requiredRoles: Object.values(UserRole) },
        { path: unavailable('Monitoring Visit'), name: 'Monitoring Visit', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'Sell Thru',
    icon: CreditCardIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.DirectSalesD2C],
    children: [
        { path: '/sell-thru/nota', name: 'ST Nota', requiredRoles: Object.values(UserRole) },
        { path: unavailable('ST Digipos'), name: 'ST Digipos', requiredRoles: Object.values(UserRole) },
        { path: unavailable('Penjualan D2C'), name: 'Penjualan D2C', requiredRoles: Object.values(UserRole) },
    ]
  },
    {
    name: 'Performansi',
    icon: ArrowTrendingUpIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
        { path: unavailable('5S 4R'), name: '5S 4R', requiredRoles: [UserRole.AdminSuper, UserRole.Manager] },
        { path: unavailable('Top Line'), name: 'Top Line', requiredRoles: Object.values(UserRole) },
        { path: unavailable('Market Share'), name: 'Market Share', requiredRoles: Object.values(UserRole) },
        { path: unavailable('Aktifasi'), name: 'Aktifasi', requiredRoles: Object.values(UserRole) },
        { path: unavailable('Sellout'), name: 'Sellout', requiredRoles: Object.values(UserRole) },
        { path: unavailable('Inject Voucher Fisik'), name: 'Inject Voucher Fisik', requiredRoles: Object.values(UserRole) },
        { path: unavailable('Redeem Voucher Fisik'), name: 'Redeem Voucher Fisik', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'KPI',
    icon: CheckCircleIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
       { path: unavailable('KPI Cluster'), name: 'KPI Cluster', requiredRoles: Object.values(UserRole) },
       { path: unavailable('KPI Salesforce'), name: 'KPI Salesforce', requiredRoles: Object.values(UserRole) },
       { path: unavailable('KPI D2C'), name: 'KPI D2C', requiredRoles: Object.values(UserRole) },
    ]
  },
    {
    name: 'Program',
    icon: SparklesIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
        { path: unavailable('SCS'), name: 'SCS', requiredRoles: Object.values(UserRole) },
        { path: unavailable('Retina'), name: 'Retina', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'Fee',
    icon: FeeIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS, UserRole.SupervisorD2C],
    children: [
         { path: unavailable('Fee'), name: 'Fee', requiredRoles: Object.values(UserRole) },
         { path: unavailable('Management Fee'), name: 'Management Fee', requiredRoles: Object.values(UserRole) },
         { path: unavailable('Marketing Fee'), name: 'Marketing Fee', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'DOA',
    icon: BoxIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS],
    children: [
        { path: unavailable('Alokasi'), name: 'Alokasi', requiredRoles: Object.values(UserRole) },
        { path: unavailable('List SN'), name: 'List SN', requiredRoles: Object.values(UserRole) },
        { path: unavailable('Stock'), name: 'Stock', requiredRoles: Object.values(UserRole) },
    ]
  },
  {
    name: 'Dokumentasi',
    icon: CameraIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.AdminInput, UserRole.SupervisorIDS, UserRole.SupervisorD2C, UserRole.SalesforceIDS, UserRole.DirectSalesD2C],
    children: [
      { path: '/documentation', name: 'Form Kunjungan', requiredRoles: [UserRole.AdminSuper, UserRole.SupervisorIDS, UserRole.SupervisorD2C, UserRole.SalesforceIDS, UserRole.DirectSalesD2C] },
      { path: '/input-form', name: 'Input Form', requiredRoles: [UserRole.AdminSuper, UserRole.AdminInput, UserRole.SupervisorIDS, UserRole.SupervisorD2C, UserRole.SalesforceIDS, UserRole.DirectSalesD2C] },
      { path: '/video', name: 'Video Roleplay', requiredRoles: [UserRole.AdminSuper, UserRole.SalesforceIDS, UserRole.DirectSalesD2C, UserRole.SupervisorIDS, UserRole.SupervisorD2C] },
    ]
  },
  {
    path: '/complaint',
    name: 'Komplain',
    icon: ComplaintIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.SupervisorIDS, UserRole.SupervisorD2C, UserRole.SalesforceIDS, UserRole.DirectSalesD2C],
  },
  {
    path: '/pop-monitoring',
    name: 'Monitoring POP',
    icon: FlagIcon,
    requiredRoles: [UserRole.AdminSuper, UserRole.Manager, UserRole.SupervisorIDS],
  },
   {
    name: 'Data Upload Center',
    icon: CloudArrowUpIcon,
    requiredRoles: [UserRole.AdminSuper],
     children: [
        { path: '/admin/data-upload', name: 'Upload Database', requiredRoles: [UserRole.AdminSuper] },
        { path: '/admin/data-upload/manage', name: 'Manajemen File Data', requiredRoles: [UserRole.AdminSuper] },
     ]
  },
   {
    path: '/admin/user-management',
    name: 'User Management',
    icon: UsersIcon,
    requiredRoles: [UserRole.AdminSuper],
  },
];