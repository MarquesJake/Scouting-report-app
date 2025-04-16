import { useState } from 'react';

export default function ScoutingReportForm() {
  const [formData, setFormData] = useState({
    playerName: '',
    date: '',
    team: '',
    opposition: '',
    position: '',
    formation: '',
    tacticalRole: '',
    mg: '',
    physical: '',
    oop: '',
    ip: '',
    summary: '',
    transfermarktUrl: '',
    fixtureSearch: '',
    fixtureTeamName: '',
    fixtureDate: ''
  });

  const [report, setReport] = useState('');
  const [fixtureOptions, setFixtureOptions] = useState([]);

  const extractTransfermarktId = (url) => {
    const match = url.match(/spieler\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const autoFillFromTransfermarkt = async (url) => {
    const playerId = extractTransfermarktId(url);
    if (!playerId) return;

    try {
      const response = await fetch(`/api/player-info/${playerId}`);
      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        playerName: data.name || prev.playerName,
        team: data.club || prev.team,
        dateOfBirth: data.dob || '',
        nationality: data.nationality || ''
      }));
    } catch (error) {
      console.error("Error fetching Transfermarkt data", error);
    }
  };

  const handleTransfermarktChange = async (e) => {
    const url = e.target.value;
    setFormData({ ...formData, transfermarktUrl: url });
    await autoFillFromTransfermarkt(url);
  };

  const handleFixtureSearch = async () => {
    const { fixtureTeamName, fixtureDate } = formData;
    const mockFixtures = [
      `${fixtureTeamName} vs FC Example - ${fixtureDate}`,
      `${fixtureTeamName} vs Another Team - ${fixtureDate}`,
      `${fixtureTeamName} vs Sample Club - ${fixtureDate}`
    ];
    setFixtureOptions(mockFixtures);
  };

  const selectFixture = (fixture) => {
    setFormData({ ...formData, fixtureSearch: fixture });
  };

  const generateReport = () => {
    const {
      playerName,
      date,
      team,
      opposition,
      position,
      formation,
      tacticalRole,
      mg,
      physical,
      oop,
      ip,
      summary,
      transfermarktUrl,
      fixtureSearch
    } = formData;

    const transfermarktId = extractTransfermarktId(transfermarktUrl);
    const transfermarktLink = transfermarktId
      ? `https://www.transfermarkt.com/player/profil/spieler/${transfermarktId}`
      : '';

    const fullReport = `**Player:** ${playerName}\n**Date:** ${date}\n**Team:** ${team}\n**Opposition:** ${opposition}\n**Position:** ${position}\n**Formation:** ${formation}\n**Tactical Role:** ${tacticalRole}\n**MG:** ${mg}/10\n${
      transfermarktLink ? `**Transfermarkt Profile:** [Link](${transfermarktLink})\n` : ''
    }${
      fixtureSearch ? `**Fixture:** ${fixtureSearch}\n` : ''
    }\n**Physical**\n${physical}\n\n**OOP**\n${oop}\n\n**IP**\n${ip}\n\n**Summary**\n${summary}`;

    setReport(fullReport);
  };

  return (
    <div style={{ maxWidth: '720px', margin: 'auto', padding: '1rem' }}>
      <h2>Scouting Report Form</h2>
      {[
        ['playerName', 'Player Name'],
        ['date', 'Date'],
        ['team', 'Team / Club'],
        ['opposition', 'Opposition'],
        ['position', 'Position'],
        ['formation', 'Formation'],
        ['tacticalRole', 'Tactical Role'],
        ['mg', 'MG (1–10)']
      ].map(([key, label]) => (
        <input key={key} name={key} placeholder={label} onChange={handleChange} value={formData[key]} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      ))}

      <input name="transfermarktUrl" placeholder="Transfermarkt URL" onChange={handleTransfermarktChange} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />

      <input name="fixtureTeamName" placeholder="Team Name for Fixture Search" onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <input name="fixtureDate" type="date" onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <button onClick={handleFixtureSearch} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>Search Fixtures</button>

      {fixtureOptions.map((fixture, i) => (
        <button key={i} onClick={() => selectFixture(fixture)} style={{ width: '100%', padding: '8px', marginBottom: '5px' }}>{fixture}</button>
      ))}

      <textarea name="physical" placeholder="Physical" onChange={handleChange} style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }} />
      <textarea name="oop" placeholder="OOP" onChange={handleChange} style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }} />
      <textarea name="ip" placeholder="IP" onChange={handleChange} style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }} />
      <textarea name="summary" placeholder="Summary" onChange={handleChange} style={{ width: '100%', minHeight: '100px', marginBottom: '10px', padding: '8px' }} />

      <button onClick={generateReport} style={{ width: '100%', padding: '12px', background: '#222', color: '#fff', border: 'none' }}>Generate Report</button>

      {report && (
        <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          {report}
        </div>
      )}
    </div>
  );
}
