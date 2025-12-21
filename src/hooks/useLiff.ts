import { useState, useEffect, useCallback } from 'react';
import liff from '@line/liff';
import { supabase } from '../lib/supabase';

interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LineUserData {
  line_user_id: string;
  display_name: string | null;
  email: string | null;
  brain_type: string | null;
  brain_type_scores: Record<string, number>;
  diagnosis_completed: boolean;
  progress_level: number;
  total_points: number;
}

interface UseLiffReturn {
  isInitialized: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  profile: LiffProfile | null;
  userData: LineUserData | null;
  login: () => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  isDemoMode: boolean;
}

const DEMO_USER_ID = 'U8e44334cf4e0df84846ec2e8327ca727';

export function useLiff(liffId?: string): UseLiffReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [userData, setUserData] = useState<LineUserData | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchOrCreateUser = useCallback(async (lineUserId: string, displayName: string) => {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('line_users')
        .select('*')
        .eq('line_user_id', lineUserId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingUser) {
        if (existingUser.display_name !== displayName) {
          await supabase
            .from('line_users')
            .update({ display_name: displayName, updated_at: new Date().toISOString() })
            .eq('line_user_id', lineUserId);
        }
        setUserData({
          line_user_id: existingUser.line_user_id,
          display_name: existingUser.display_name,
          email: existingUser.email,
          brain_type: existingUser.brain_type,
          brain_type_scores: existingUser.brain_type_scores || { left_3d: 0, left_2d: 0, right_3d: 0, right_2d: 0 },
          diagnosis_completed: existingUser.diagnosis_completed || false,
          progress_level: existingUser.progress_level || 1,
          total_points: existingUser.total_points || 0,
        });
      } else {
        const { data: newUser, error: insertError } = await supabase
          .from('line_users')
          .insert({
            line_user_id: lineUserId,
            display_name: displayName,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setUserData({
          line_user_id: newUser.line_user_id,
          display_name: newUser.display_name,
          email: newUser.email,
          brain_type: newUser.brain_type,
          brain_type_scores: newUser.brain_type_scores || { left_3d: 0, left_2d: 0, right_3d: 0, right_2d: 0 },
          diagnosis_completed: newUser.diagnosis_completed || false,
          progress_level: newUser.progress_level || 1,
          total_points: newUser.total_points || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching/creating user:', err);
      setError('ユーザー情報の取得に失敗しました');
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    const userId = profile?.userId || (isDemoMode ? DEMO_USER_ID : null);
    if (!userId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('line_users')
        .select('*')
        .eq('line_user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setUserData({
          line_user_id: data.line_user_id,
          display_name: data.display_name,
          email: data.email,
          brain_type: data.brain_type,
          brain_type_scores: data.brain_type_scores || { left_3d: 0, left_2d: 0, right_3d: 0, right_2d: 0 },
          diagnosis_completed: data.diagnosis_completed || false,
          progress_level: data.progress_level || 1,
          total_points: data.total_points || 0,
        });
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  }, [profile?.userId, isDemoMode]);

  useEffect(() => {
    const initLiff = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const demoMode = urlParams.get('demo') === 'true';

      if (demoMode) {
        setIsDemoMode(true);
        setIsInitialized(true);
        setIsLoggedIn(true);

        const { data: demoUser } = await supabase
          .from('line_users')
          .select('*')
          .eq('line_user_id', DEMO_USER_ID)
          .maybeSingle();

        if (demoUser) {
          setProfile({
            userId: demoUser.line_user_id,
            displayName: demoUser.display_name || 'Demo User',
          });
          setUserData({
            line_user_id: demoUser.line_user_id,
            display_name: demoUser.display_name,
            email: demoUser.email,
            brain_type: demoUser.brain_type,
            brain_type_scores: demoUser.brain_type_scores || { left_3d: 0, left_2d: 0, right_3d: 0, right_2d: 0 },
            diagnosis_completed: demoUser.diagnosis_completed || false,
            progress_level: demoUser.progress_level || 1,
            total_points: demoUser.total_points || 0,
          });
        }
        setIsLoading(false);
        return;
      }

      const effectiveLiffId = liffId || import.meta.env.VITE_LIFF_ID;

      if (!effectiveLiffId) {
        setIsLoading(false);
        setError('LIFF IDが設定されていません');
        return;
      }

      try {
        await liff.init({ liffId: effectiveLiffId });
        setIsInitialized(true);

        // App routing: Check if we should redirect to another app
        const appParam = urlParams.get('app');
        if (appParam === 'dreammaker') {
          // Redirect to DreamMaker with LIFF context
          const dreamMakerUrl = import.meta.env.VITE_DREAMMAKER_URL || 'https://dreammaker-app.vercel.app';
          // Preserve query params except 'app'
          const newParams = new URLSearchParams(urlParams);
          newParams.delete('app');
          const queryString = newParams.toString();
          const redirectUrl = queryString ? `${dreamMakerUrl}?${queryString}` : dreamMakerUrl;
          window.location.href = redirectUrl;
          return;
        }

        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);
          const liffProfile = await liff.getProfile();
          const profileData: LiffProfile = {
            userId: liffProfile.userId,
            displayName: liffProfile.displayName,
            pictureUrl: liffProfile.pictureUrl,
            statusMessage: liffProfile.statusMessage,
          };
          setProfile(profileData);
          await fetchOrCreateUser(liffProfile.userId, liffProfile.displayName);
        }
      } catch (err) {
        console.error('LIFF init error:', err);
        setError('LIFFの初期化に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, [liffId, fetchOrCreateUser]);

  const login = useCallback(() => {
    if (isInitialized && !isLoggedIn) {
      liff.login({ redirectUri: window.location.href });
    }
  }, [isInitialized, isLoggedIn]);

  const logout = useCallback(() => {
    if (isDemoMode) {
      const url = new URL(window.location.href);
      url.searchParams.delete('demo');
      window.location.href = url.toString();
      return;
    }
    if (isInitialized) { // Removed isLoggedIn check to force clear if needed
      try {
        // LINE In-App Browser doesn't support logout, but we call it for external browsers
        if (liff.isLoggedIn()) {
          liff.logout();
        }
      } catch (e) {
        console.error('Logout error:', e);
      } finally {
        setIsLoggedIn(false);
        setProfile(null);
        setUserData(null);
        window.location.reload();
      }
    }
  }, [isInitialized, isDemoMode]);

  return {
    isInitialized,
    isLoggedIn,
    isLoading,
    error,
    profile,
    userData,
    login,
    logout,
    refreshUserData,
    isDemoMode,
  };
}
