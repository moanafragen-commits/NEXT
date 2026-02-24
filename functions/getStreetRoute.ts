import { createClientFromRequest } from 'npm:@base44/sdk@0.8.18';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { waypoints } = await req.json();

        if (!waypoints || waypoints.length < 2) {
            return Response.json({ error: 'Missing waypoints' }, { status: 400 });
        }

        // Using OSRM public API (no API key required)
        // OSRM expects longitude,latitude
        const coordsString = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
        // Using "foot" profile instead of "driving" so routes can go through parks/buildings and are more accurate for characters
        const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${coordsString}?overview=full&geometries=geojson`;

        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            // OSRM returns coordinates as [longitude, latitude]
            // We need to convert them to [latitude, longitude] for Leaflet
            const polyline = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            return Response.json({ polyline, status: 'success' });
        } else {
            return Response.json({ error: 'Could not find route', status: data.code }, { status: 404 });
        }

    } catch (error) {
        console.error("Error in getStreetRoute function:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});