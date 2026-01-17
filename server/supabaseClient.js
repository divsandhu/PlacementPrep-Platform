// Server-side Supabase client
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for server-side operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not found. Some features may not work.');
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Helper functions for database operations

// User operations
export async function getUserProfile(userId) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

export async function updateUserProfile(userId, updates) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
  
  return data;
}

// Quiz operations
export async function getQuizCategories() {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('quiz_categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data || [];
}

export async function getQuizTopics(categoryId = null) {
  if (!supabase) return [];
  
  let query = supabase
    .from('quiz_topics')
    .select('*')
    .order('name');
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
  
  return data || [];
}

export async function getQuestions(topicId, difficulty = null, limit = 10) {
  if (!supabase) return [];
  
  let query = supabase
    .from('questions')
    .select('*')
    .eq('topic_id', topicId)
    .eq('is_active', true)
    .limit(limit);
  
  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
  
  return data || [];
}

// Quiz session operations
export async function createQuizSession(sessionData) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert(sessionData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating quiz session:', error);
    return null;
  }
  
  return data;
}

export async function updateQuizSession(sessionId, updates) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('quiz_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating quiz session:', error);
    return null;
  }
  
  return data;
}

export async function saveUserAnswer(answerData) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('user_answers')
    .insert(answerData)
    .select()
    .single();
  
  if (error) {
    console.error('Error saving user answer:', error);
    return null;
  }
  
  return data;
}

// Leaderboard operations
export async function getLeaderboard(topicId = null, period = 'all-time', limit = 100) {
  if (!supabase) return [];
  
  let query = supabase
    .from('leaderboards')
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq('period', period)
    .order('rank', { ascending: true })
    .limit(limit);
  
  if (topicId) {
    query = query.eq('topic_id', topicId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
  
  return data || [];
}

// User progress operations
export async function getUserProgress(userId, topicId = null) {
  if (!supabase) return [];
  
  let query = supabase
    .from('user_progress')
    .select(`
      *,
      quiz_topics:topic_id (name, slug, category_id)
    `)
    .eq('user_id', userId);
  
  if (topicId) {
    query = query.eq('topic_id', topicId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching user progress:', error);
    return [];
  }
  
  return data || [];
}

// Admin operations
export async function createQuestion(questionData) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('questions')
    .insert(questionData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating question:', error);
    return null;
  }
  
  return data;
}

export async function updateQuestion(questionId, updates) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', questionId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating question:', error);
    return null;
  }
  
  return data;
}

export async function deleteQuestion(questionId) {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);
  
  if (error) {
    console.error('Error deleting question:', error);
    return false;
  }
  
  return true;
}

export async function getAllUsers(limit = 100) {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(limit)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  
  return data || [];
}
