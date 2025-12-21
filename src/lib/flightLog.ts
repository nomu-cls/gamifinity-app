// Flight Log Module for Daily Mission Tracking
// Using Supabase for Dream Maker compatibility

import { supabase } from './supabase';

export interface FlightLog {
    id?: string;
    line_user_id: string;
    date: string;
    morning_mission: string | null;
    night_gratitude: string[] | null;
    is_mission_completed: boolean;
    points_earned: {
        morning: number;
        night: number;
        bonus: number;
    };
    created_at?: string;
    updated_at?: string;
}

export interface FlightLogSummary {
    totalPoints: number;
    recentLogs: FlightLog[];
    todaysLog: FlightLog | null;
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

// Save morning mission
export async function saveMorningMission(
    lineUserId: string,
    mission: string
): Promise<{ success: boolean; points: number }> {
    const date = getTodayDate();
    const morningPoints = 1;

    try {
        const { data: existing } = await supabase
            .from('flight_logs')
            .select('*')
            .eq('line_user_id', lineUserId)
            .eq('date', date)
            .maybeSingle();

        if (existing) {
            // Update existing
            const { error } = await supabase
                .from('flight_logs')
                .update({
                    morning_mission: mission,
                    points_earned: { ...existing.points_earned, morning: morningPoints }
                })
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('flight_logs')
                .insert({
                    line_user_id: lineUserId,
                    date,
                    morning_mission: mission,
                    points_earned: { morning: morningPoints, night: 0, bonus: 0 }
                });

            if (error) throw error;
        }

        return { success: true, points: morningPoints };
    } catch (error) {
        console.error('Error saving morning mission:', error);
        return { success: false, points: 0 };
    }
}

// Save night gratitude and complete mission
export async function saveNightLog(
    lineUserId: string,
    gratitude: string[],
    missionCompleted: boolean
): Promise<{ success: boolean; points: number }> {
    const date = getTodayDate();
    const nightPoints = 1;
    const bonusPoints = missionCompleted ? 1 : 0;
    const totalEarned = nightPoints + bonusPoints;

    try {
        const { data: existing } = await supabase
            .from('flight_logs')
            .select('*')
            .eq('line_user_id', lineUserId)
            .eq('date', date)
            .maybeSingle();

        if (existing) {
            const { error } = await supabase
                .from('flight_logs')
                .update({
                    night_gratitude: gratitude,
                    is_mission_completed: missionCompleted,
                    points_earned: {
                        ...existing.points_earned,
                        night: nightPoints,
                        bonus: bonusPoints
                    }
                })
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('flight_logs')
                .insert({
                    line_user_id: lineUserId,
                    date,
                    night_gratitude: gratitude,
                    is_mission_completed: missionCompleted,
                    points_earned: { morning: 0, night: nightPoints, bonus: bonusPoints }
                });

            if (error) throw error;
        }

        return { success: true, points: totalEarned };
    } catch (error) {
        console.error('Error saving night log:', error);
        return { success: false, points: 0 };
    }
}

// Get today's log
export async function getTodaysLog(lineUserId: string): Promise<FlightLog | null> {
    const date = getTodayDate();

    try {
        const { data, error } = await supabase
            .from('flight_logs')
            .select('*')
            .eq('line_user_id', lineUserId)
            .eq('date', date)
            .maybeSingle();

        if (error) throw error;
        return data as FlightLog | null;
    } catch (error) {
        console.error('Error getting today\'s log:', error);
        return null;
    }
}

// Get recent logs (last N days)
export async function getRecentLogs(
    lineUserId: string,
    days: number = 3
): Promise<FlightLog[]> {
    try {
        const { data, error } = await supabase
            .from('flight_logs')
            .select('*')
            .eq('line_user_id', lineUserId)
            .order('date', { ascending: false })
            .limit(days);

        if (error) throw error;
        return (data as FlightLog[]) || [];
    } catch (error) {
        console.error('Error getting recent logs:', error);
        return [];
    }
}

// Calculate total points from all logs
export async function getTotalPoints(lineUserId: string): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('flight_logs')
            .select('points_earned')
            .eq('line_user_id', lineUserId);

        if (error) throw error;

        let total = 0;
        (data || []).forEach((log: { points_earned: { morning?: number; night?: number; bonus?: number } }) => {
            const pe = log.points_earned || {};
            total += (pe.morning || 0) + (pe.night || 0) + (pe.bonus || 0);
        });

        return total;
    } catch (error) {
        console.error('Error calculating total points:', error);
        return 0;
    }
}
