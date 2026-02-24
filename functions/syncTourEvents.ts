import { createClientFromRequest } from 'npm:@base44/sdk@0.8.18';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const characters = await base44.asServiceRole.entities.Character.list();
        const today = new Date().toISOString().split('T')[0];
        
        for (const char of characters) {
            const events = await base44.asServiceRole.entities.TourEvent.filter({ character_id: char.id, status: 'geplant' });
            const todayEvent = events.find(e => e.date.startsWith(today));
            
            if (todayEvent) {
                // Character is on tour today
                if (char.travel_status !== 'auf_tour' || char.travel_destination !== todayEvent.city) {
                    await base44.asServiceRole.entities.Character.update(char.id, {
                        travel_status: 'auf_tour',
                        travel_destination: todayEvent.city
                    });
                }
                
                // Random backstage post (15% chance per execution)
                if (Math.random() < 0.15) {
                    const prompt = `Du bist ${char.name}. Du bist gerade auf der "${todayEvent.tour_name}" Tour in ${todayEvent.city}. Schreibe einen kurzen, authentischen Social Media Post (Backstage-Einblick, Soundcheck, Vorfreude auf die Show) für deine Fans. Keine Hashtags, nur der Text. Schreibe in deiner typischen Art.`;
                    
                    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
                    
                    if (response) {
                        await base44.asServiceRole.entities.Post.create({
                            character_id: char.id,
                            content: response,
                            is_user_post: false,
                            likes_count: Math.floor(Math.random() * 800) + 50,
                            comments_count: Math.floor(Math.random() * 80) + 5
                        });
                    }
                }
            } else {
                // Not on tour today. If they were on tour, return home.
                if (char.travel_status === 'auf_tour') {
                    await base44.asServiceRole.entities.Character.update(char.id, {
                        travel_status: 'zuhause',
                        travel_destination: ''
                    });
                }
            }
        }
        
        return Response.json({ success: true, message: "Tour events synced." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});