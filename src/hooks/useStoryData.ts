import { useState, useEffect } from 'react';
import { supabase, UserStory, VisionBoardImage, GiftContent, DayReward, SiteSettings, DaySetting, LineSetting, LineMessageTemplate } from '../lib/supabase';

const getDeviceId = () => {
  let deviceId = localStorage.getItem('yoshuku_device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('yoshuku_device_id', deviceId);
  }
  return deviceId;
};

export const useStoryData = (lineUserId?: string | null, displayName?: string | null) => {
  const [story, setStory] = useState<UserStory | null>(null);
  const [visionImages, setVisionImages] = useState<VisionBoardImage[]>([]);
  const [giftContent, setGiftContent] = useState<GiftContent | null>(null);
  const [dayRewards, setDayRewards] = useState<Record<number, DayReward>>({});
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [daySettings, setDaySettings] = useState<Record<number, DaySetting>>({});
  const [lineSettings, setLineSettings] = useState<LineSetting | null>(null);
  const [lineTemplates, setLineTemplates] = useState<LineMessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoryData();
    loadGiftContent();
    loadDayRewards();
    loadSiteSettings();
    loadDaySettings();
    loadLineSettings();
    loadLineTemplates();
  }, [lineUserId]);

  const loadStoryData = async () => {
    try {
      const deviceId = getDeviceId();

      if (lineUserId) {
        const { data: lineStory } = await supabase
          .from('user_stories')
          .select('*')
          .eq('line_user_id', lineUserId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lineStory) {
          const needsUpdate = lineStory.device_id !== deviceId || (!lineStory.name && displayName);
          if (needsUpdate) {
            const updates: any = {};
            if (lineStory.device_id !== deviceId) updates.device_id = deviceId;
            if (!lineStory.name && displayName) updates.name = displayName;

            await supabase
              .from('user_stories')
              .update(updates)
              .eq('id', lineStory.id);

            if (updates.device_id) lineStory.device_id = deviceId;
            if (updates.name) lineStory.name = displayName;
          }
          setStory(lineStory);
          loadVisionImages(lineStory.id);
          setLoading(false);
          return lineStory;
        }
      }

      const { data: existingStories } = await supabase
        .from('user_stories')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false });

      const existingStory = existingStories && existingStories.length > 0
        ? existingStories.find(s => s.email || s.day1_field1 || s.day2_field1 || s.day3_field1) || existingStories[0]
        : null;

      if (existingStory) {
        if (lineUserId && existingStory.line_user_id !== lineUserId) {
          await supabase
            .from('user_stories')
            .update({ line_user_id: lineUserId })
            .eq('id', existingStory.id);
          existingStory.line_user_id = lineUserId;
        }
        setStory(existingStory);
        loadVisionImages(existingStory.id);
        return existingStory;
      } else {
        const { data: newStory } = await supabase
          .from('user_stories')
          .insert([{ device_id: deviceId, line_user_id: lineUserId || null, name: displayName || null }])
          .select()
          .single();

        if (newStory) {
          setStory(newStory);
          return newStory;
        }
      }
    } catch (error) {
      console.error('Error loading story data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGiftContent = async () => {
    try {
      const { data } = await supabase
        .from('gift_contents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setGiftContent(data);
      }
    } catch (error) {
      console.error('Error loading gift content:', error);
    }
  };

  const loadDayRewards = async () => {
    try {
      const { data } = await supabase
        .from('day_rewards')
        .select('*')
        .order('day');

      if (data) {
        const rewardsMap = data.reduce((acc, reward) => {
          acc[reward.day] = reward;
          return acc;
        }, {} as Record<number, DayReward>);
        setDayRewards(rewardsMap);
      }
    } catch (error) {
      console.error('Error loading day rewards:', error);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data) {
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };

  const loadDaySettings = async () => {
    try {
      const { data } = await supabase
        .from('day_settings')
        .select('*')
        .eq('is_active', true)
        .order('day');

      if (data) {
        const settingsMap = data.reduce((acc, setting) => {
          acc[setting.day] = setting;
          return acc;
        }, {} as Record<number, DaySetting>);
        setDaySettings(settingsMap);
      }
    } catch (error) {
      console.error('Error loading day settings:', error);
    }
  };

  const updateDaySetting = async (day: number, updates: Partial<DaySetting>) => {
    try {
      const { data, error } = await supabase
        .from('day_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('day', day)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating day setting:', error);
        return false;
      }

      if (data) {
        setDaySettings(prev => ({
          ...prev,
          [day]: data
        }));
      }
      return true;
    } catch (error) {
      console.error('Error updating day setting:', error);
      return false;
    }
  };

  const loadLineSettings = async () => {
    try {
      const { data } = await supabase
        .from('line_settings')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (data) {
        setLineSettings(data);
      }
    } catch (error) {
      console.error('Error loading line settings:', error);
    }
  };

  const loadLineTemplates = async () => {
    try {
      const { data } = await supabase
        .from('line_message_templates')
        .select('*')
        .order('template_key');

      if (data) {
        setLineTemplates(data);
      }
    } catch (error) {
      console.error('Error loading line templates:', error);
    }
  };

  const updateLineSettings = async (updates: Partial<LineSetting>) => {
    if (!lineSettings) return false;

    try {
      const { data, error } = await supabase
        .from('line_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', lineSettings.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating line settings:', error);
        return false;
      }

      if (data) {
        setLineSettings(data);
      }
      return true;
    } catch (error) {
      console.error('Error updating line settings:', error);
      return false;
    }
  };

  const updateLineTemplate = async (templateKey: string, messageContent: string) => {
    try {
      const { data, error } = await supabase
        .from('line_message_templates')
        .update({ message_content: messageContent, updated_at: new Date().toISOString() })
        .eq('template_key', templateKey)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating line template:', error);
        return false;
      }

      if (data) {
        setLineTemplates(prev => prev.map(t => t.template_key === templateKey ? data : t));
      }
      return true;
    } catch (error) {
      console.error('Error updating line template:', error);
      return false;
    }
  };

  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    if (!siteSettings) return false;

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', siteSettings.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating site settings:', error);
        return false;
      }

      if (data) {
        setSiteSettings(data);
      }
      return true;
    } catch (error) {
      console.error('Error updating site settings:', error);
      return false;
    }
  };

  const loadVisionImages = async (storyId: string) => {
    try {
      const { data } = await supabase
        .from('vision_board_images')
        .select('*')
        .eq('story_id', storyId)
        .order('display_order');

      if (data) {
        setVisionImages(data);
      }
    } catch (error) {
      console.error('Error loading vision images:', error);
    }
  };

  const updateStory = async (updates: Partial<UserStory>): Promise<UserStory | null> => {
    if (!story) return null;

    try {
      const { data, error } = await supabase
        .from('user_stories')
        .update(updates)
        .eq('id', story.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating story:', error);
        return null;
      }

      if (data) {
        setStory(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error updating story:', error);
      return null;
    }
  };

  const addVisionImage = async (imageUrl: string) => {
    if (!story) return;

    try {
      const { data } = await supabase
        .from('vision_board_images')
        .insert([{
          story_id: story.id,
          image_url: imageUrl,
          display_order: visionImages.length
        }])
        .select()
        .single();

      if (data) {
        setVisionImages([...visionImages, data]);
      }
    } catch (error) {
      console.error('Error adding vision image:', error);
    }
  };

  const removeVisionImage = async (imageId: string) => {
    try {
      await supabase
        .from('vision_board_images')
        .delete()
        .eq('id', imageId);

      setVisionImages(visionImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error removing vision image:', error);
    }
  };

  const updateGiftContent = async (rewardUrl: string) => {
    if (!giftContent) return false;

    try {
      const { data, error } = await supabase
        .from('gift_contents')
        .update({ reward_url: rewardUrl })
        .eq('id', giftContent.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating gift content:', error);
        return false;
      }

      if (data) {
        setGiftContent(data);
      }
      return true;
    } catch (error) {
      console.error('Error updating gift content:', error);
      return false;
    }
  };

  const updateDayReward = async (day: number, rewardUrl: string) => {
    try {
      const { data, error } = await supabase
        .from('day_rewards')
        .update({ reward_url: rewardUrl })
        .eq('day', day)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating day reward:', error);
        return false;
      }

      if (data) {
        setDayRewards(prev => ({
          ...prev,
          [day]: data
        }));
      }
      return true;
    } catch (error) {
      console.error('Error updating day reward:', error);
      return false;
    }
  };

  const submitToGoogleSheets = async () => {
    if (!story) {
      throw new Error('No story data available');
    }

    try {
      const googleSheetsUrl = story.google_sheets_url || import.meta.env.VITE_GOOGLE_SHEETS_URL;

      if (!googleSheetsUrl) {
        throw new Error('Google Sheets URL not configured');
      }

      const submissionData = {
        email: story.email || '',
        day1_field1: story.day1_field1 || '',
        day1_field2: story.day1_field2 || '',
        day1_field3: story.day1_field3 || '',
        day2_field1: story.day2_field1 || '',
        day2_field2: story.day2_field2 || '',
        day2_field3: story.day2_field3 || '',
        day3_field1: story.day3_field1 || '',
        day3_field2: story.day3_field2 || '',
        day3_field3: story.day3_field3 || '',
        day3_field4: story.day3_field4 || '',
        day3_field5: story.day3_field5 || '',
        day3_field6: story.day3_field6 || '',
        vision_board_images: visionImages.map(img => img.image_url).join(', '),
        submitted_at: new Date().toISOString()
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-to-sheets`;

      console.log('Submitting to Google Sheets:', { googleSheetsUrl, data: submissionData });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleSheetsUrl,
          data: submissionData
        })
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to submit to Google Sheets: ${responseText}`);
      }

      const result = JSON.parse(responseText);

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit to Google Sheets');
      }

      await updateStory({ submitted_at: new Date().toISOString() });

      return result;
    } catch (error) {
      console.error('Error submitting to Google Sheets:', error);
      throw error;
    }
  };

  return {
    story,
    visionImages,
    giftContent,
    dayRewards,
    siteSettings,
    daySettings,
    lineSettings,
    lineTemplates,
    loading,
    updateStory,
    updateGiftContent,
    updateDayReward,
    updateSiteSettings,
    updateDaySetting,
    updateLineSettings,
    updateLineTemplate,
    addVisionImage,
    removeVisionImage,
    submitToGoogleSheets,
    reloadStoryData: loadStoryData,
    reloadDaySettings: loadDaySettings,
    reloadLineSettings: loadLineSettings,
    reloadLineTemplates: loadLineTemplates
  };
};
