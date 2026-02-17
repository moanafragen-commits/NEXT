/**
 * Builds a context string describing what the character knows from group chats.
 * This allows characters to reference group chat discussions in 1:1 chats.
 */

export function buildGroupChatContext(groupChats, groupMembers, groupMessages, characterId, allCharacters) {
  if (!groupChats?.length || !groupMembers?.length || !groupMessages?.length) return '';

  // Find groups this character is a member of
  const characterGroupIds = groupMembers
    .filter(m => m.member_type === 'character' && m.member_id === characterId)
    .map(m => m.group_id);

  if (characterGroupIds.length === 0) return '';

  const parts = [];
  parts.push('\n\nGRUPPENCHAT-WISSEN (Du bist in folgenden Gruppenchats aktiv und weißt was dort besprochen wird):');

  for (const groupId of characterGroupIds) {
    const group = groupChats.find(g => g.id === groupId);
    if (!group) continue;

    // Get recent messages from this group (last 15)
    const recentGroupMsgs = groupMessages
      .filter(m => m.group_id === groupId)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 15)
      .reverse();

    if (recentGroupMsgs.length === 0) continue;

    parts.push(`\n📱 Gruppenchat "${group.name}"${group.theme ? ` (Thema: ${group.theme})` : ''}:`);

    // Get other members for name resolution
    const memberIds = groupMembers.filter(m => m.group_id === groupId);

    for (const msg of recentGroupMsgs) {
      let senderName = 'Nutzer';
      if (msg.sender_type === 'character') {
        const char = allCharacters?.find(c => c.id === msg.sender_id);
        senderName = char?.name || 'Unbekannt';
      }
      const truncated = msg.content.length > 150 ? msg.content.slice(0, 150) + '...' : msg.content;
      parts.push(`  ${senderName}: ${truncated}`);
    }
  }

  if (parts.length <= 1) return '';

  parts.push('\nDu kannst auf Themen aus den Gruppenchats Bezug nehmen, z.B. "In der Gruppe haben wir doch über ... geredet" oder "Habe gesehen was du in der Gruppe geschrieben hast". Sei natürlich damit – nicht erzwingen.');

  return parts.join('\n');
}