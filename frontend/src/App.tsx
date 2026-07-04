import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { LanguageScreen } from './screens/LanguageScreen';
import { HomeScreen } from './screens/HomeScreen';
import { VoiceScreen } from './screens/VoiceScreen';
import { DoctorsScreen } from './screens/DoctorsScreen';
import { ConfirmScreen } from './screens/ConfirmScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import { AppointmentsScreen } from './screens/AppointmentsScreen';
import { AdminDashboard } from './screens/AdminDashboard';

const PATIENT_SCREENS = ['language', 'home', 'voice', 'doctors', 'confirm', 'success', 'appointments'] as const;
const PUBLIC_SCREENS = ['splash', 'login', 'signup'] as const;

function Router() {
  const { screen, user, authLoading } = useApp();

  if (!authLoading && !user && ![...PUBLIC_SCREENS, 'admin'].includes(screen)) {
    return <LoginScreen />;
  }

  if (!authLoading && user?.role === 'ADMIN' && (PATIENT_SCREENS as readonly string[]).includes(screen)) {
    return <AdminDashboard />;
  }

  if (!authLoading && user?.role === 'PATIENT' && screen === 'admin') {
    return <HomeScreen />;
  }

  switch (screen) {
    case 'splash': return <SplashScreen />;
    case 'login': return <LoginScreen />;
    case 'signup': return <SignupScreen />;
    case 'language': return <LanguageScreen />;
    case 'home': return <HomeScreen />;
    case 'voice': return <VoiceScreen />;
    case 'doctors': return <DoctorsScreen />;
    case 'confirm': return <ConfirmScreen />;
    case 'success': return <SuccessScreen />;
    case 'appointments': return <AppointmentsScreen />;
    case 'admin': return <AdminDashboard />;
    default: return <LoginScreen />;
  }
}

function App() {
  return (
    <AppProvider>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div id="main-content">
        <Router />
      </div>
    </AppProvider>
  );
}

export default App;
