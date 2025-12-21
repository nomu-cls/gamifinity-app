/**
 * Hybrid Unlock System
 * Handles content unlocking based on progress or date
 */

export type UnlockType = 'progress' | 'date';

export interface ContentConfig {
    content_id: string;
    title: string;
    unlock_type: UnlockType;
    unlock_trigger_id?: string; // For progress-based (previous assignment ID)
    unlock_date?: string;       // For date-based (ISO string)
}

/**
 * Determines if a content item is unlocked based on its configuration
 * @param content - The content configuration
 * @param completedAssignments - Array of completed assignment IDs
 * @param currentDate - Current date (defaults to now)
 * @returns boolean indicating if content is unlocked
 */
export function isContentUnlocked(
    content: ContentConfig,
    completedAssignments: string[],
    currentDate: Date = new Date()
): boolean {
    // Progress-based unlock
    if (content.unlock_type === 'progress') {
        // If no trigger specified, it's the first item - always unlocked
        if (!content.unlock_trigger_id) {
            return true;
        }
        return completedAssignments.includes(content.unlock_trigger_id);
    }

    // Date-based unlock
    if (content.unlock_type === 'date') {
        if (!content.unlock_date) {
            return false;
        }
        return currentDate >= new Date(content.unlock_date);
    }

    return false;
}

/**
 * User Status type for state machine
 */
export type UserStatus = 'passenger' | 'training' | 'commander';

/**
 * Determines user status based on their progress
 * @param hasDiagnosis - Whether user has completed brain type diagnosis
 * @param hasCompletedAllAssignments - Whether all training assignments are done
 * @returns UserStatus
 */
export function getUserStatus(
    hasDiagnosis: boolean,
    hasCompletedAllAssignments: boolean
): UserStatus {
    if (!hasDiagnosis) {
        return 'passenger';
    }
    if (!hasCompletedAllAssignments) {
        return 'training';
    }
    return 'commander';
}

/**
 * Default content configuration for the 3-day training program
 */
export const DEFAULT_CONTENT_CONFIG: ContentConfig[] = [
    {
        content_id: 'diagnosis',
        title: '脳タイプ診断',
        unlock_type: 'progress',
        // First item - no trigger needed
    },
    {
        content_id: 'day1',
        title: 'Day 1 記憶の森',
        unlock_type: 'progress',
        unlock_trigger_id: 'diagnosis',
    },
    {
        content_id: 'day2',
        title: 'Day 2 感情の海',
        unlock_type: 'progress',
        unlock_trigger_id: 'day1_assignment',
    },
    {
        content_id: 'day3',
        title: 'Day 3 未来の空',
        unlock_type: 'progress',
        unlock_trigger_id: 'day2_assignment',
    },
];
