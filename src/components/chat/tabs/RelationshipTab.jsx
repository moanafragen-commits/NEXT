import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Heart, BookOpen, Shield } from 'lucide-react';

export default function RelationshipTab({ formData, setFormData }) {
  return (
    <TabsContent value="relationship" className="space-y-5">
      <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
        <p className="text-xs text-pink-300">💕 Definiere hier, in welcher Beziehung du zu diesem Charakter stehst. Das beeinflusst, wie der Charakter mit dir kommuniziert.</p>
      </div>

      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Beziehungstyp & Dynamik
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Beziehungstyp</Label>
          <Select value={formData.initial_relationship} onValueChange={(val) => setFormData(prev => ({ ...prev, initial_relationship: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wähle eine Beziehung..." /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 max-h-80 z-[10001]">
              <SelectItem value="Partner/in" className="text-white hover:bg-white/10">💑 Partner/in</SelectItem>
              <SelectItem value="Schwarm" className="text-white hover:bg-white/10">💘 Schwarm</SelectItem>
              <SelectItem value="Ex-Partner/in" className="text-white hover:bg-white/10">💔 Ex-Partner/in</SelectItem>
              <SelectItem value="Ehemann/Ehefrau" className="text-white hover:bg-white/10">💍 Ehemann/Ehefrau</SelectItem>
              <SelectItem value="Verlobte/r" className="text-white hover:bg-white/10">💎 Verlobte/r</SelectItem>
              <SelectItem value="Affäre" className="text-white hover:bg-white/10">🔥 Affäre</SelectItem>
              <SelectItem value="Sandkastenliebe" className="text-white hover:bg-white/10">🏖️ Sandkastenliebe</SelectItem>
              <SelectItem value="Jugendliebe" className="text-white hover:bg-white/10">💞 Jugendliebe</SelectItem>
              <SelectItem value="Bester Freund/Beste Freundin" className="text-white hover:bg-white/10">👫 Beste/r Freund/in</SelectItem>
              <SelectItem value="Guter Freund/Gute Freundin" className="text-white hover:bg-white/10">🤝 Gute/r Freund/in</SelectItem>
              <SelectItem value="Bekannte/r" className="text-white hover:bg-white/10">👋 Bekannte/r</SelectItem>
              <SelectItem value="Kindheitsfreund/in" className="text-white hover:bg-white/10">🧒 Kindheitsfreund/in</SelectItem>
              <SelectItem value="Online-Freund/in" className="text-white hover:bg-white/10">💬 Online-Freund/in</SelectItem>
              <SelectItem value="Brieffreund/in" className="text-white hover:bg-white/10">✉️ Brieffreund/in</SelectItem>
              <SelectItem value="Ex-beste/r Freund/in" className="text-white hover:bg-white/10">💫 Ex-beste/r Freund/in</SelectItem>
              <SelectItem value="Seelenverwandte/r" className="text-white hover:bg-white/10">✨ Seelenverwandte/r</SelectItem>
              <SelectItem value="Mutter" className="text-white hover:bg-white/10">👩 Mutter</SelectItem>
              <SelectItem value="Vater" className="text-white hover:bg-white/10">👨 Vater</SelectItem>
              <SelectItem value="Schwester" className="text-white hover:bg-white/10">👧 Schwester</SelectItem>
              <SelectItem value="Bruder" className="text-white hover:bg-white/10">👦 Bruder</SelectItem>
              <SelectItem value="Tochter" className="text-white hover:bg-white/10">👶 Tochter</SelectItem>
              <SelectItem value="Sohn" className="text-white hover:bg-white/10">👶 Sohn</SelectItem>
              <SelectItem value="Großmutter/Großvater" className="text-white hover:bg-white/10">👴 Großmutter/Großvater</SelectItem>
              <SelectItem value="Cousin/Cousine" className="text-white hover:bg-white/10">🧑‍🤝‍🧑 Cousin/Cousine</SelectItem>
              <SelectItem value="Tante/Onkel" className="text-white hover:bg-white/10">👨‍👩‍👧 Tante/Onkel</SelectItem>
              <SelectItem value="Stiefmutter/Stiefvater" className="text-white hover:bg-white/10">👤 Stiefmutter/Stiefvater</SelectItem>
              <SelectItem value="Stiefschwester/Stiefbruder" className="text-white hover:bg-white/10">👥 Stiefschwester/Stiefbruder</SelectItem>
              <SelectItem value="Adoptivmutter/Adoptivvater" className="text-white hover:bg-white/10">🫶 Adoptivmutter/Adoptivvater</SelectItem>
              <SelectItem value="Adoptivschwester/Adoptivbruder" className="text-white hover:bg-white/10">🤗 Adoptivschwester/Adoptivbruder</SelectItem>
              <SelectItem value="Schwiegermutter/Schwiegervater" className="text-white hover:bg-white/10">👩‍👦 Schwiegermutter/Schwiegervater</SelectItem>
              <SelectItem value="Schwager/Schwägerin" className="text-white hover:bg-white/10">👨‍👩‍👦 Schwager/Schwägerin</SelectItem>
              <SelectItem value="Patenonkel/Patentante" className="text-white hover:bg-white/10">🌟 Patenonkel/Patentante</SelectItem>
              <SelectItem value="Patenkind" className="text-white hover:bg-white/10">👼 Patenkind</SelectItem>
              <SelectItem value="Arbeitskollege/Arbeitskollegin" className="text-white hover:bg-white/10">💼 Arbeitskollege/in</SelectItem>
              <SelectItem value="Chef/in" className="text-white hover:bg-white/10">👔 Chef/in</SelectItem>
              <SelectItem value="Mitarbeiter/in" className="text-white hover:bg-white/10">🏢 Mitarbeiter/in</SelectItem>
              <SelectItem value="Geschäftspartner/in" className="text-white hover:bg-white/10">🤝 Geschäftspartner/in</SelectItem>
              <SelectItem value="Praktikant/in" className="text-white hover:bg-white/10">📋 Praktikant/in</SelectItem>
              <SelectItem value="Azubi" className="text-white hover:bg-white/10">🔧 Azubi</SelectItem>
              <SelectItem value="Mentor/in" className="text-white hover:bg-white/10">🎓 Mentor/in</SelectItem>
              <SelectItem value="Schüler/in" className="text-white hover:bg-white/10">📚 Schüler/in</SelectItem>
              <SelectItem value="Lehrer/in" className="text-white hover:bg-white/10">📖 Lehrer/in</SelectItem>
              <SelectItem value="Professor/in" className="text-white hover:bg-white/10">🎩 Professor/in</SelectItem>
              <SelectItem value="Rivale/Rivalin" className="text-white hover:bg-white/10">⚔️ Rivale/Rivalin</SelectItem>
              <SelectItem value="Feind/in" className="text-white hover:bg-white/10">😤 Feind/in</SelectItem>
              <SelectItem value="Erzfeind/in" className="text-white hover:bg-white/10">💀 Erzfeind/in</SelectItem>
              <SelectItem value="Nemesis" className="text-white hover:bg-white/10">🔥 Nemesis</SelectItem>
              <SelectItem value="Nachbar/in" className="text-white hover:bg-white/10">🏠 Nachbar/in</SelectItem>
              <SelectItem value="Mitbewohner/in" className="text-white hover:bg-white/10">🏡 Mitbewohner/in</SelectItem>
              <SelectItem value="WG-Mitbewohner/in" className="text-white hover:bg-white/10">🛋️ WG-Mitbewohner/in</SelectItem>
              <SelectItem value="Trainingspartner/in" className="text-white hover:bg-white/10">🏋️ Trainingspartner/in</SelectItem>
              <SelectItem value="Teamkamerad/in" className="text-white hover:bg-white/10">⚽ Teamkamerad/in</SelectItem>
              <SelectItem value="Bandkollege/in" className="text-white hover:bg-white/10">🎸 Bandkollege/in</SelectItem>
              <SelectItem value="Reisebekanntschaft" className="text-white hover:bg-white/10">✈️ Reisebekanntschaft</SelectItem>
              <SelectItem value="Therapeut/in" className="text-white hover:bg-white/10">🧘 Therapeut/in</SelectItem>
              <SelectItem value="Patient/in" className="text-white hover:bg-white/10">🏥 Patient/in</SelectItem>
              <SelectItem value="Arzt/Ärztin" className="text-white hover:bg-white/10">🩺 Arzt/Ärztin</SelectItem>
              <SelectItem value="Babysitter/in" className="text-white hover:bg-white/10">👶 Babysitter/in</SelectItem>
              <SelectItem value="Au-pair" className="text-white hover:bg-white/10">🌍 Au-pair</SelectItem>
              <SelectItem value="Nanny" className="text-white hover:bg-white/10">🍼 Nanny</SelectItem>
              <SelectItem value="Bodyguard" className="text-white hover:bg-white/10">🕶️ Bodyguard</SelectItem>
              <SelectItem value="Butler/Haushälterin" className="text-white hover:bg-white/10">🎩 Butler/Haushälterin</SelectItem>
              <SelectItem value="Vertraute/r" className="text-white hover:bg-white/10">🤫 Vertraute/r</SelectItem>
              <SelectItem value="Beichtvater/Beichtmutter" className="text-white hover:bg-white/10">🙏 Beichtvater/Beichtmutter</SelectItem>
              <SelectItem value="Fan/Bewunderer/in" className="text-white hover:bg-white/10">🌟 Fan/Bewunderer/in</SelectItem>
              <SelectItem value="Stalker/in" className="text-white hover:bg-white/10">👁️ Stalker/in</SelectItem>
              <SelectItem value="Fremde/r" className="text-white hover:bg-white/10">🚶 Fremde/r</SelectItem>
              <SelectItem value="Lebensretter/in" className="text-white hover:bg-white/10">🦸 Lebensretter/in</SelectItem>
              <SelectItem value="Dealer/in" className="text-white hover:bg-white/10">🧪 Dealer/in</SelectItem>
              <SelectItem value="Komplize/Komplizin" className="text-white hover:bg-white/10">🤐 Komplize/Komplizin</SelectItem>
              <SelectItem value="Gefängnismitinsasse/in" className="text-white hover:bg-white/10">⛓️ Gefängnismitinsasse/in</SelectItem>
              <SelectItem value="Kriegskamerad/in" className="text-white hover:bg-white/10">🎖️ Kriegskamerad/in</SelectItem>
              <SelectItem value="Verlorene/r Zwilling" className="text-white hover:bg-white/10">🪞 Verlorene/r Zwilling</SelectItem>
              <SelectItem value="Geist/Phantom" className="text-white hover:bg-white/10">👻 Geist/Phantom</SelectItem>
              <SelectItem value="Imaginäre/r Freund/in" className="text-white hover:bg-white/10">🌈 Imaginäre/r Freund/in</SelectItem>
              <SelectItem value="Zeitreisende/r" className="text-white hover:bg-white/10">⏳ Zeitreisende/r</SelectItem>
              <SelectItem value="Paralleluniversum-Ich" className="text-white hover:bg-white/10">🌀 Paralleluniversum-Ich</SelectItem>
              <SelectItem value="Haustierbesitzer/in" className="text-white hover:bg-white/10">🐾 Haustierbesitzer/in</SelectItem>
              <SelectItem value="Tierflüsterer/in" className="text-white hover:bg-white/10">🦊 Tierflüsterer/in</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Beziehungsdynamik</Label>
          <Select value={formData.relationship_dynamic} onValueChange={(val) => setFormData(prev => ({ ...prev, relationship_dynamic: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Dynamik wählen..." /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
              <SelectItem value="gleichberechtigt" className="text-white hover:bg-white/10">⚖️ Gleichberechtigt</SelectItem>
              <SelectItem value="dominant" className="text-white hover:bg-white/10">👑 Dominant</SelectItem>
              <SelectItem value="unterwürfig" className="text-white hover:bg-white/10">🙇 Unterwürfig</SelectItem>
              <SelectItem value="beschützend" className="text-white hover:bg-white/10">🛡️ Beschützend</SelectItem>
              <SelectItem value="abhängig" className="text-white hover:bg-white/10">🔗 Abhängig</SelectItem>
              <SelectItem value="unabhängig" className="text-white hover:bg-white/10">🦅 Unabhängig</SelectItem>
              <SelectItem value="wechselseitig" className="text-white hover:bg-white/10">🔄 Wechselseitig</SelectItem>
              <SelectItem value="einseitig" className="text-white hover:bg-white/10">➡️ Einseitig</SelectItem>
              <SelectItem value="konkurrierend" className="text-white hover:bg-white/10">🏁 Konkurrierend</SelectItem>
              <SelectItem value="co-abhängig" className="text-white hover:bg-white/10">🪢 Co-abhängig</SelectItem>
              <SelectItem value="toxisch" className="text-white hover:bg-white/10">☠️ Toxisch</SelectItem>
              <SelectItem value="heilend" className="text-white hover:bg-white/10">💚 Heilend</SelectItem>
              <SelectItem value="spielerisch" className="text-white hover:bg-white/10">🎲 Spielerisch</SelectItem>
              <SelectItem value="intellektuell" className="text-white hover:bg-white/10">🧠 Intellektuell</SelectItem>
              <SelectItem value="elterlich" className="text-white hover:bg-white/10">👨‍👧 Elterlich</SelectItem>
              <SelectItem value="geschwisterlich" className="text-white hover:bg-white/10">👫 Geschwisterlich</SelectItem>
              <SelectItem value="romantisch_spannend" className="text-white hover:bg-white/10">🔥 Romantisch-spannend</SelectItem>
              <SelectItem value="kalt_distanziert" className="text-white hover:bg-white/10">🧊 Kalt & distanziert</SelectItem>
              <SelectItem value="bewundernd" className="text-white hover:bg-white/10">🌟 Bewundernd</SelectItem>
              <SelectItem value="manipulativ" className="text-white hover:bg-white/10">🎭 Manipulativ</SelectItem>
              <SelectItem value="aufopfernd" className="text-white hover:bg-white/10">🕊️ Aufopfernd</SelectItem>
              <SelectItem value="rebellisch" className="text-white hover:bg-white/10">🤘 Rebellisch</SelectItem>
              <SelectItem value="symbiotisch" className="text-white hover:bg-white/10">🔗 Symbiotisch</SelectItem>
              <SelectItem value="mentor_schüler" className="text-white hover:bg-white/10">🎓 Mentor-Schüler</SelectItem>
              <SelectItem value="kumpelhaft" className="text-white hover:bg-white/10">🍻 Kumpelhaft</SelectItem>
              <SelectItem value="formell_höflich" className="text-white hover:bg-white/10">🎩 Formell & höflich</SelectItem>
              <SelectItem value="leidenschaftlich" className="text-white hover:bg-white/10">💘 Leidenschaftlich</SelectItem>
              <SelectItem value="vertrauensvoll" className="text-white hover:bg-white/10">🤝 Vertrauensvoll</SelectItem>
              <SelectItem value="misstrauisch_vorsichtig" className="text-white hover:bg-white/10">🤨 Misstrauisch & vorsichtig</SelectItem>
              <SelectItem value="neckend_flirtend" className="text-white hover:bg-white/10">😜 Neckend & flirtend</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Bindungsstil</Label>
          <Select value={formData.attachment_style} onValueChange={(val) => setFormData(prev => ({ ...prev, attachment_style: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              <SelectItem value="sicher" className="text-white hover:bg-white/10">🟢 Sicher</SelectItem>
              <SelectItem value="ängstlich" className="text-white hover:bg-white/10">🟡 Ängstlich</SelectItem>
              <SelectItem value="vermeidend" className="text-white hover:bg-white/10">🔴 Vermeidend</SelectItem>
              <SelectItem value="desorganisiert" className="text-white hover:bg-white/10">🟠 Desorganisiert</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">Beeinflusst wie der Charakter Nähe und Distanz handhabt</p>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Liebessprache</Label>
          <Select value={formData.love_language} onValueChange={(val) => setFormData(prev => ({ ...prev, love_language: val }))}>
            <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
              <SelectItem value="Worte der Bestätigung" className="text-white hover:bg-white/10">💬 Worte der Bestätigung</SelectItem>
              <SelectItem value="Geschenke" className="text-white hover:bg-white/10">🎁 Geschenke</SelectItem>
              <SelectItem value="Hilfsbereitschaft" className="text-white hover:bg-white/10">🤲 Hilfsbereitschaft</SelectItem>
              <SelectItem value="Körperkontakt" className="text-white hover:bg-white/10">🤗 Körperkontakt</SelectItem>
              <SelectItem value="Zweisamkeit" className="text-white hover:bg-white/10">👫 Zweisamkeit</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">Wie drückt der Charakter Zuneigung aus?</p>
        </div>
      </div>

      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-2"><Shield className="w-4 h-4" /> Emotionale Eigenschaften</h3>
      </div>
      <div className="space-y-4 p-4 bg-[#262626] rounded-xl border border-white/5">
        <div className="space-y-2">
          <div className="flex justify-between items-center"><Label className="text-gray-300">Vertrauen</Label><span className="text-sm text-pink-400">{formData.trust_level}/10</span></div>
          <Slider value={[formData.trust_level]} onValueChange={([val]) => setFormData(prev => ({ ...prev, trust_level: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-pink-500" />
          <p className="text-xs text-gray-500">1 = sehr misstrauisch • 10 = blindes Vertrauen</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center"><Label className="text-gray-300">Eifersucht</Label><span className="text-sm text-pink-400">{formData.jealousy_level}/10</span></div>
          <Slider value={[formData.jealousy_level]} onValueChange={([val]) => setFormData(prev => ({ ...prev, jealousy_level: val }))} min={1} max={10} step={1} className="[&_[role=slider]]:bg-pink-500" />
          <p className="text-xs text-gray-500">1 = überhaupt nicht eifersüchtig • 10 = extrem eifersüchtig</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Beziehungsentwicklung</Label>
        <Select value={formData.relationship_evolution} onValueChange={(val) => setFormData(prev => ({ ...prev, relationship_evolution: val }))}>
          <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
            <SelectItem value="statisch" className="text-white hover:bg-white/10">⏸️ Statisch – bleibt wie sie ist</SelectItem>
            <SelectItem value="sich_annähernd" className="text-white hover:bg-white/10">💞 Sich annähernd</SelectItem>
            <SelectItem value="sich_entfernend" className="text-white hover:bg-white/10">💨 Sich entfernend</SelectItem>
            <SelectItem value="schwankend" className="text-white hover:bg-white/10">🌊 Schwankend – mal nah, mal fern</SelectItem>
            <SelectItem value="sich_vertiefend" className="text-white hover:bg-white/10">🌹 Sich vertiefend</SelectItem>
            <SelectItem value="kompliziert" className="text-white hover:bg-white/10">🔀 Kompliziert</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">Bestimmt wie sich die Beziehung im Laufe der Gespräche verändert</p>
      </div>

      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Gemeinsame Geschichte</h3>
      </div>
      <div className="space-y-2">
        <Label className="text-gray-300">Beziehungs-Geschichte</Label>
        <Textarea value={formData.relationship_backstory} onChange={(e) => setFormData(prev => ({ ...prev, relationship_backstory: e.target.value }))} placeholder="Wie habt ihr euch kennengelernt? Was verbindet euch?" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[100px]" />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-300">Aktuelles Szenario</Label>
        <Textarea value={formData.relationship_scenario} onChange={(e) => setFormData(prev => ({ ...prev, relationship_scenario: e.target.value }))} placeholder="Was ist gerade los zwischen euch?" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-300">Gemeinsame Erinnerungen</Label>
        <Textarea value={formData.shared_memories} onChange={(e) => setFormData(prev => ({ ...prev, shared_memories: e.target.value }))} placeholder="z.B. 'Der Roadtrip nach Italien letzten Sommer'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label className="text-gray-300">Insider-Witze</Label><Textarea value={formData.inside_jokes} onChange={(e) => setFormData(prev => ({ ...prev, inside_jokes: e.target.value }))} placeholder="Witze die nur ihr versteht..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" /></div>
        <div className="space-y-2"><Label className="text-gray-300">Kosenamen</Label><Textarea value={formData.pet_names} onChange={(e) => setFormData(prev => ({ ...prev, pet_names: e.target.value }))} placeholder="z.B. 'Schatz', 'Buddy'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" /></div>
      </div>
      <div className="space-y-2">
        <Label className="text-gray-300">Grenzen in der Beziehung</Label>
        <Textarea value={formData.relationship_boundaries} onChange={(e) => setFormData(prev => ({ ...prev, relationship_boundaries: e.target.value }))} placeholder="z.B. 'Spricht nicht über seine Familie'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
      </div>
    </TabsContent>
  );
}