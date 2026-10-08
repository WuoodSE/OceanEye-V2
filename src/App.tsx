import { OceanEyeProvider, useOceanEye } from '@/context/OceanEyeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { SatelliteFeed } from '@/components/SatelliteFeed';
import { LiveMap } from '@/components/LiveMap';
import { IncidentAlerts } from '@/components/IncidentAlerts';
import { BeforeAfterAnalytics } from '@/components/BeforeAfterAnalytics';
import { IncidentTracking } from '@/components/IncidentTracking';
import { AuthPage } from '@/components/AuthPage';

function AppContent() {
  const { activeTab } = useOceanEye();

  return (
    <Layout>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'map' && <LiveMap />}
      {activeTab === 'satellite' && <SatelliteFeed />}
      {activeTab === 'tracking' && <IncidentTracking />}
      {activeTab === 'alerts' && <IncidentAlerts />}
      {activeTab === 'analytics' && <BeforeAfterAnalytics />}
    </Layout>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="ocean-bg min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <OceanEyeProvider>
      <AppContent />
    </OceanEyeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
