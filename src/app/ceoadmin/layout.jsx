import AdminLayoutWrapper from './AdminLayoutWrapper';

export const metadata = {
  title: 'LowStudy CEO Admin Panel',
  description: 'Private executive administration and analytics system.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    nocache: true,
  },
};

export default function CeoAdminLayout({ children }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
