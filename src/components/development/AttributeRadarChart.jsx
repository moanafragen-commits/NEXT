import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function AttributeRadarChart({ character }) {
  const data = [
    { attribute: 'Vertrauen', value: character.trust_level || 5, max: 10 },
    { attribute: 'Empathie', value: character.empathy_level || 5, max: 10 },
    { attribute: 'Emotionale Tiefe', value: character.emotional_depth || 5, max: 10 },
    { attribute: 'Formalität', value: character.formality_level || 5, max: 10 },
    { attribute: 'Kreativität', value: Math.round((character.creativity || 50) / 10), max: 10 },
    { attribute: 'Eifersucht', value: character.jealousy_level || 3, max: 10 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis 
            dataKey="attribute" 
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 10]} 
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Attribute"
            dataKey="value"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}