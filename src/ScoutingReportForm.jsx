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
  const [popupVisible, setPopupVisible] = useState(false);

  const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzIh7QXuXyqi9jmXTFocNtPac4kUBBJNGHX4_reWsZ9hyoJHfrfudnaNMaMIUMQiENu/exec";

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

  const generateReport = async () => {
    const transfermarktId = extractTransfermarktId(formData.transfermarktUrl);
    const transfermarktLink = transfermarktId
      ? `https://www.transfermarkt.com/player/profil/spieler/${transfermarktId}`
      : '';

    const fullReport = `**Player:** ${formData.playerName}\n**Date:** ${formData.date}\n**Team:** ${formData.team}\n**Opposition:** ${formData.opposition}\n**Position:** ${formData.position}\n**Formation:** ${formData.formation}\n**Tactical Role:** ${formData.tacticalRole}\n**MG:** ${formData.mg}/10\n$${
      transfermarktLink ? `**Transfermarkt Profile:** [Link](${transfermarktLink})\n` : ''
    }$${
      formData.fixtureSearch ? `**Fixture:** ${formData.fixtureSearch}\n` : ''
    }\n**Physical**\n${formData.physical}\n\n**OOP**\n${formData.oop}\n\n**IP**\n${formData.ip}\n\n**Summary**\n${formData.summary}`;

    setReport(fullReport);

    try {
      await fetch(SHEETS_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      setPopupVisible(true);
      setTimeout(() => {
        setPopupVisible(false);
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error("Error sending to Google Sheets:", err);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: 'auto', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '1rem' }}>Scouting Report Form</h2>

      {[['playerName', 'Player Name'], ['date', 'Date'], ['team', 'Team / Club'], ['opposition', 'Opposition'], ['position', 'Position'], ['formation', 'Formation'], ['tacticalRole', 'Tactical Role'], ['mg', 'MG (1–10)']]
        .map(([key, label]) => (
          <input key={key} name={key} placeholder={label} onChange={handleChange} value={formData[key]} style={{ width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        ))}

      <input name="transfermarktUrl" placeholder="Transfermarkt URL" onChange={handleTransfermarktChange} style={{ width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />

      <input name="fixtureTeamName" placeholder="Team Name for Fixture Search" onChange={handleChange} style={{ width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
      <input name="fixtureDate" type="date" onChange={handleChange} style={{ width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
      <button onClick={handleFixtureSearch} style={{ width: '100%', padding: '10px', marginBottom: '12px', background: '#eee', borderRadius: '6px' }}>Search Fixtures</button>

      {fixtureOptions.map((fixture, i) => (
        <button key={i} onClick={() => selectFixture(fixture)} style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #ccc', background: '#f9f9f9' }}>{fixture}</button>
      ))}

      {[['physical', 'Physical'], ['oop', 'OOP'], ['ip', 'IP'], ['summary', 'Summary']]
        .map(([key, label]) => (
          <textarea key={key} name={key} placeholder={label} onChange={handleChange} value={formData[key]} style={{ width: '100%', minHeight: '80px', marginBottom: '12px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        ))}

      <button onClick={generateReport} style={{ width: '100%', padding: '12px', background: '#222', color: '#fff', border: 'none', borderRadius: '6px' }}>Submit Report</button>

      {popupVisible && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#4CAF50', color: '#fff', padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
          ✅ Report submitted!
        </div>
      )}
    </div>
  );
}
