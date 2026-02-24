import { createClientFromRequest } from 'npm:@base44/sdk@0.8.18';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 1. Get all active tours
        const activeTours = await base44.asServiceRole.entities.Tour.filter({ is_active: true });
        const today = new Date().toISOString().split('T')[0];
        
        for (const tour of activeTours) {
            // Find today's event for this tour
            const tourEvents = await base44.asServiceRole.entities.TourEvent.filter({ tour_id: tour.id });
            const todayEvent = tourEvents.find(e => e.date.startsWith(today));
            
            if (todayEvent) {
                // Random Chance of Cancellation (e.g. 1%)
                if (todayEvent.status === 'geplant' && Math.random() < 0.01) {
                    const reasons = ["Erkältung", "Stimmbandentzündung", "Technische Probleme", "Unwetter", "Verletzung beim Soundcheck"];
                    const reason = reasons[Math.floor(Math.random() * reasons.length)];
                    
                    // Cancel Event
                    await base44.asServiceRole.entities.TourEvent.update(todayEvent.id, {
                        status: 'abgesagt',
                        cancellation_reason: reason
                    });
                    
                    // Notify via Post (Manager or Band)
                    if (tour.manager_id) {
                        const manager = await base44.asServiceRole.entities.Character.get(tour.manager_id);
                        if (manager) {
                            const prompt = `Du bist der Tour-Manager der Band. Du musst leider mitteilen, dass das Konzert heute in ${todayEvent.city} abgesagt werden muss wegen: ${reason}. Schreibe einen kurzen, professionellen aber bedauernden Social Media Post.`;
                            const postContent = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
                            if (postContent) {
                                await base44.asServiceRole.entities.Post.create({
                                    character_id: manager.id,
                                    content: postContent,
                                    is_user_post: false
                                });
                            }
                        }
                    }
                    continue; // Skip moving characters if cancelled
                }
                
                // If not cancelled, move everyone to the city
                const membersToMove = [...(tour.band_members || [])];
                if (tour.manager_id) membersToMove.push(tour.manager_id);
                
                for (const charId of membersToMove) {
                    const char = await base44.asServiceRole.entities.Character.get(charId);
                    if (char) {
                        // Move to city
                        if (char.travel_status !== 'auf_tour' || char.travel_destination !== todayEvent.city) {
                            await base44.asServiceRole.entities.Character.update(char.id, {
                                travel_status: 'auf_tour',
                                travel_destination: todayEvent.city
                            });
                        }
                        
                        // Small chance for backstage post (10% per member)
                        if (Math.random() < 0.1) {
                            const prompt = `Du bist ${char.name}. Du bist in ${todayEvent.city} für ein Konzert. Schreibe einen kurzen Hype-Post oder Backstage-Einblick.`;
                            const content = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
                             if (content) {
                                await base44.asServiceRole.entities.Post.create({
                                    character_id: char.id, content, is_user_post: false, likes_count: Math.floor(Math.random()*500)
                                });
                            }
                        }
                    }
                }
            }
        }
        
        return Response.json({ success: true, message: "Tour groups synced." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});