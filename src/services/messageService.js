import supabase from './supabaseClient';

export const messageService = {
  /**
   * Get all conversations for a user
   */
  async getConversations(userId) {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations:conversation_id (
          id,
          last_message_at
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    const formattedConversations = await Promise.all(
      data.map(async (participation) => {
        const conversationId = participation.conversation_id;

        // Get the other participant
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select(`
            profiles:user_id (
              id,
              username,
              firstname,
              lastname,
              avatar_url,
              is_online
            )
          `)
          .eq('conversation_id', conversationId)
          .neq('user_id', userId)
          .maybeSingle();

        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('text, created_at, sender_id')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Count unread
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversationId)
          .eq('is_read', false)
          .neq('sender_id', userId);

        const friend = otherParticipant?.profiles;

        return {
          id: conversationId,
          friend: friend || {
            id: 'unknown',
            firstname: 'Utilisateur',
            lastname: 'Inconnu'
          },
          lastMessage: lastMessage || {
            text: 'Nouvelle discussion',
            created_at: participation.conversations?.last_message_at
          },
          unreadCount: unreadCount || 0,
          updatedAt:
            lastMessage?.created_at ||
            participation.conversations?.last_message_at
        };
      })
    );

    return formattedConversations.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Send message
   */
  async sendMessage(conversationId, senderId, text) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        text: text.trim()
      })
      .select()
      .single();

    if (error) throw error;

    // Update last activity
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  },

  /**
   * 🚀 Create conversation using RPC (FIXED)
   */
  async createConversation(userId, friendId) {
    // Optional: check if already exists
    const { data: existing } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (existing && existing.length > 0) {
      const convIds = existing.map((p) => p.conversation_id);

      const { data: shared } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('conversation_id', convIds)
        .eq('user_id', friendId)
        .maybeSingle();

      if (shared) return shared.conversation_id;
    }

    // ✅ Call RPC instead of direct insert
    const { data, error } = await supabase.rpc(
      'create_conversation_with_participants',
      { friend_id: friendId }
    );

    if (error) {
      console.error('RPC createConversation error:', error);
      throw error;
    }

    return data;
  },

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId, userId) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) console.error('markAsRead error:', error);
  }
};