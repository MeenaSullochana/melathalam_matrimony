/** Sidebar matches PHP admin/page-part/left_panel.php */
export const NAV = [
  {
    id: 'dashboard',
    label: 'My Dashboard',
    path: 'dashboard',
  },
  {
    id: 'site-settings',
    label: 'Site Settings',
    children: [
      { id: 'site-basic', label: 'Basic Site Setting', path: 'settings/basic' },
      { id: 'site-email', label: 'Email Settings', path: 'settings/email' },
      { id: 'site-social', label: 'Social Media Links', path: 'settings/social' },
      { id: 'site-password', label: 'Change Password', path: 'settings/password' },
      { id: 'site-analytics', label: 'Analytics Code', path: 'settings/analytics' },
      { id: 'site-logo', label: 'Favicon & Logo', path: 'settings/logo' },
      { id: 'site-banner', label: 'Home Page Banner', path: 'settings/banner' },
      { id: 'site-watermark', label: 'Photo Watermark', path: 'settings/watermark' },
      { id: 'site-profile-id', label: 'Update Profile Id', path: 'settings/profile-id' },
      { id: 'site-defaults', label: 'Default Images & Gates', path: 'settings/defaults' },
    ],
  },
  {
    id: 'master',
    label: 'Add New Details',
    children: [
      { id: 'religion', label: 'Religion', path: 'master/religion' },
      { id: 'caste', label: 'Caste', path: 'master/caste' },
      { id: 'sub-caste', label: 'Sub Caste', path: 'master/sub-caste' },
      { id: 'country', label: 'Country', path: 'master/country' },
      { id: 'state', label: 'State', path: 'master/state' },
      { id: 'city', label: 'City', path: 'master/city' },
      { id: 'occupation', label: 'Occupation', path: 'master/occupation' },
      { id: 'education', label: 'Education', path: 'master/education' },
      { id: 'mother-tongue', label: 'Mother Tongue', path: 'master/mother-tongue' },
      { id: 'height', label: 'Height', path: 'master/height' },
      { id: 'weight', label: 'Weight', path: 'master/weight' },
      { id: 'diet', label: 'Diet', path: 'master/diet' },
      { id: 'complexion', label: 'Complexion', path: 'master/complexion' },
      { id: 'body-type', label: 'Body Type', path: 'master/body-type' },
    ],
  },
  {
    id: 'members',
    label: 'Members',
    children: [
      { id: 'all-members', label: 'All Members', path: 'members' },
      { id: 'add-member', label: 'Add Member', path: 'members/new' },
      { id: 'active-to-paid', label: 'Active To Paid', path: 'members/active' },
      { id: 'renew', label: 'Renew Membership', path: 'members/paid' },
      { id: 'renewals', label: 'Renewal Requests', path: 'members/renewals' },
      { id: 'change-plan', label: 'Change Membership Plan', path: 'members/plans' },
      { id: 'featured', label: 'Featured Profile', path: 'members/featured' },
    ],
  },
  {
    id: 'match',
    label: 'Match Making',
    children: [{ id: 'matchmaking', label: 'Profile Match Making', path: 'matchmaking' }],
  },
  {
    id: 'plans',
    label: 'Membership Plan',
    children: [
      { id: 'manage-plan', label: 'Add Membership Plan', path: 'plans/manage' },
      { id: 'list-plan', label: 'Membership Plan', path: 'plans' },
    ],
  },
  {
    id: 'approvals',
    label: 'Approvals',
    children: [
      { id: 'pending', label: 'Member Approvals', path: 'approvals/pending' },
      { id: 'success', label: 'Success Story Approval', path: 'approvals/success-stories' },
    ],
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    children: [{ id: 'quick-enquiries', label: 'Quick Enquiries', path: 'enquiries' }],
  },
  {
    id: 'activity',
    label: 'User Activity',
    children: [
      { id: 'interests', label: 'Express Interest', path: 'activity/interests' },
      { id: 'messages', label: 'Message', path: 'activity/messages' },
      { id: 'leads', label: 'First Form Leads', path: 'activity/leads' },
    ],
  },
  {
    id: 'email-templates',
    label: 'Email Templates',
    children: [
      { id: 'email-add', label: 'Add New Email Template', path: 'email-templates/new' },
      { id: 'email-list', label: 'All Email Templates', path: 'email-templates' },
    ],
  },
  {
    id: 'payment',
    label: 'Payment Option',
    children: [{ id: 'payment-options', label: 'Manage Payment Option', path: 'payments/methods' }],
  },
  {
    id: 'reports',
    label: 'Member Report',
    children: [
      { id: 'filter-export', label: 'Filter Member Download', path: 'reports/members' },
      { id: 'export-excel', label: 'Export Members to Excel', path: 'reports/export' },
      { id: 'export-custom', label: 'Export Custom Excel', path: 'reports/custom' },
      { id: 'sales', label: 'Sales Report', path: 'reports/sales' },
    ],
  },
  {
    id: 'send-email',
    label: 'Send Email',
    children: [{ id: 'send', label: 'Send Email To Members', path: 'email/send' }],
  },
]
