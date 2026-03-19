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
                
                // Update stress and morale based on event type
                let stressDelta = 0;
                let moraleDelta = 0;

                if (todayEvent.event_type === 'konzert') {
                    stressDelta = 10;
                    moraleDelta = -5;
                } else if (todayEvent.event_type === 'meet_and_greet' || todayEvent.event_type === 'autogrammstunde') {
                    stressDelta = 15;
                    moraleDelta = 5; // Fans give energy but it's stressful
                } else if (todayEvent.event_type === 'interview') {
                    stressDelta = 5;
                    moraleDelta = -2;
                } else if (todayEvent.event_type === 'freier_tag') {
                    stressDelta = -30;
                    moraleDelta = 20;
                }

                for (const charId of membersToMove) {
                    const char = await base44.asServiceRole.entities.Character.get(charId);
                    if (char) {
                        let newStress = Math.min(100, Math.max(0, (char.tour_stress_level || 0) + stressDelta));
                        let newMorale = Math.min(100, Math.max(0, (char.tour_morale ?? 100) + moraleDelta));
                        
                        let updates = {
                            tour_stress_level: newStress,
                            tour_morale: newMorale
                        };

                        // Move to city
                        if (char.travel_status !== 'auf_tour' || char.travel_destination !== todayEvent.city) {
                            updates.travel_status = 'auf_tour';
                            updates.travel_destination = todayEvent.city;
                        }
                        
                        await base44.asServiceRole.entities.Character.update(char.id, updates);

                        // High stress conflict post
                        if (newStress > 80 && Math.random() < 0.3) {
                            const prompt = `Du bist ${char.name}. Du bist auf Tour und dein Stresslevel ist auf ${newStress}%! Du bist extrem gereizt und gestresst von den Terminen. Mache einen sehr passiv-aggressiven oder genervten Social Media Post darüber, wie anstrengend gerade alles ist, ohne direkt jemanden anzugreifen.`;
                            const content = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
                            if (content) {
                                await base44.asServiceRole.entities.Post.create({ character_id: char.id, content, is_user_post: false });
                            }
                        }
                        // High morale positive post
                        else if (newMorale > 80 && Math.random() < 0.2) {
                            const prompt = `Du bist ${char.name}. Du bist auf Tour in ${todayEvent.city} (Event: ${todayEvent.event_type || 'Konzert'}). Deine Stimmung ist fantastisch! Schreibe einen super positiven Post darüber, wie sehr du die Tour und die Fans liebst.`;
                            const content = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
                            if (content) {
                                await base44.asServiceRole.entities.Post.create({ character_id: char.id, content, is_user_post: false, likes_count: Math.floor(Math.random()*1000) });
                            }
                        }
                        // Regular backstage post (10% per member)
                        else if (Math.random() < 0.1) {
                            const prompt = `Du bist ${char.name}. Du bist in ${todayEvent.city} für ein(e) ${todayEvent.event_type || 'Konzert'}. Schreibe einen kurzen Hype-Post oder Backstage-Einblick.`;
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