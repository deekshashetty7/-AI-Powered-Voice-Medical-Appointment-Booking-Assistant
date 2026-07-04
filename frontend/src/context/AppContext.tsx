import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Language, SttProvider, SessionConfig, TokenResponse } from '../types';
import { getLiveKitToken } from '../types';
import type { AuthUser } from '../api/auth';
import {
  fetchCurrentUser,
  getStoredToken,
  storeToken,
  clearToken,
  postLoginScreen,
} from '../api/auth';

export type Screen =
  | 'splash'
  | 'login'
  | 'signup'
  | 'language'
  | 'home'
  | 'voice'
  | 'doctors'
  | 'confirm'
  | 'success'
  | 'appointments'
  | 'admin';

export interface BookingDetails {
  doctorName: string;
  specialty: string;
  date: string;
  startTime: string;
  patientName: string;
  referenceId?: string;
}

interface AppState {
  screen: Screen;
  language: Language;
  sttProvider: SttProvider;
  patientName: string;
  patientPhone: string;
  allowLanguageSwitch: boolean;
  voiceSession: TokenResponse | null;
  voiceLoading: boolean;
  voiceError: string | null;
  booking: BookingDetails | null;
  voiceIntent: string | null;
  user: AuthUser | null;
  authToken: string | null;
  authLoading: boolean;
}

interface AppContextValue extends AppState {
  setScreen: (s: Screen) => void;
  setLanguage: (l: Language) => void;
  setPatientPhone: (p: string) => void;
  setAllowLanguageSwitch: (v: boolean) => void;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  startVoice: (intent?: string) => Promise<void>;
  endVoice: (error?: string) => void;
  setBooking: (b: BookingDetails | null) => void;
  goHome: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    screen: 'splash',
    language: 'en',
    sttProvider: 'deepgram',
    patientName: '',
    patientPhone: '',
    allowLanguageSwitch: false,
    voiceSession: null,
    voiceLoading: false,
    voiceError: null,
    booking: null,
    voiceIntent: null,
    user: null,
    authToken: null,
    authLoading: true,
  });

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setState((s) => ({ ...s, authLoading: false }));
      return;
    }

    fetchCurrentUser(token)
      .then((user) => {
        setState((s) => ({
          ...s,
          user,
          authToken: token,
          patientName: user.role === 'PATIENT' ? user.name : s.patientName,
          patientPhone: user.phone || s.patientPhone,
          authLoading: false,
        }));
      })
      .catch(() => {
        clearToken();
        setState((s) => ({ ...s, authLoading: false }));
      });
  }, []);

  const setScreen = useCallback((screen: Screen) => setState((s) => ({ ...s, screen })), []);

  const login = useCallback((token: string, user: AuthUser) => {
    storeToken(token);
    setState((s) => ({
      ...s,
      user,
      authToken: token,
      patientName: user.name,
      patientPhone: user.phone || s.patientPhone,
      screen: postLoginScreen(user.role),
    }));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState((s) => ({
      ...s,
      user: null,
      authToken: null,
      voiceSession: null,
      screen: 'login',
    }));
  }, []);

  const startVoice = useCallback(async (intent?: string) => {
    setState((s) => ({ ...s, voiceLoading: true, voiceError: null, voiceIntent: intent ?? null }));
    try {
      const config: SessionConfig = {
        language: state.language,
        sttProvider: state.sttProvider,
        patientName: state.patientName || state.user?.name || 'Patient',
      };
      const tokenData = await getLiveKitToken(config);
      setState((s) => ({
        ...s,
        voiceSession: tokenData,
        voiceLoading: false,
        screen: 'voice',
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        voiceLoading: false,
        voiceError: err instanceof Error ? err.message : 'Failed to start voice session',
      }));
    }
  }, [state.language, state.sttProvider, state.patientName, state.user?.name]);

  const endVoice = useCallback((error?: string) => {
    setState((s) => ({
      ...s,
      voiceSession: null,
      voiceError: error ?? null,
      screen: 'home',
    }));
  }, []);

  const goHome = useCallback(() => {
    setState((s) => ({ ...s, screen: 'home', voiceSession: null }));
  }, []);

  const value: AppContextValue = {
    ...state,
    setScreen,
    setLanguage: (language) => setState((s) => ({ ...s, language })),
    setPatientPhone: (patientPhone) => setState((s) => ({ ...s, patientPhone })),
    setAllowLanguageSwitch: (allowLanguageSwitch) => setState((s) => ({ ...s, allowLanguageSwitch })),
    login,
    logout,
    startVoice,
    endVoice,
    setBooking: (booking) => setState((s) => ({ ...s, booking })),
    goHome,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
