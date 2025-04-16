import { useState } from 'react';

export default function ScoutingReportForm() {
  const [formData, setFormData] = useState({
    playerName: '',
    reportDate: '',
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
    nationality: '',
    age: '',
    photoUrl: ''
  });

  const [report, setReport] = useState('');
  const [fixtureOptions, setFixtureOptions] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedFixtureIndex, setSelectedFixtureIndex] = useState(null);

  const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzIh7QXuXyqi9jmXTFocNtPac4kUBBJNGHX4_reWsZ9hyoJHfrfudnaNMaMIUMQiENu/exec";

  const extractTransfermarktId = (url) => {
    const match = url.match(/spieler\/(\d+)/);
    return match ? match[1] : null;
  };

  const autoFillFromTransfermarkt = async () => {
    const url = formData.transfermarktUrl;
    const playerId = extractTransfermarktId(url);
    if (!playerId) {
      alert("Could not extract player ID from URL");
      return;
    }

    try {
      const response = await fetch(`https://corsproxy.io/?https://transfermarkt-api.vercel.app/player/${playerId}`);
      const data = await response.json();

      if (!data.name) {
        alert("Player not found. Try a different Transfermarkt URL.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        playerName: data.name || '',
        team: data.club || '',
        position: data.position || '',
        nationality: data.nationality || '',
        age: data.age || '',
        photoUrl: data.image || ''
      }));
    } catch (err) {
      console.error("Failed to fetch Transfermarkt data:", err);
      alert("Something went wrong while fetching data.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateReport = async () => {
    const {
      playerName, reportDate, team, opposition, position, formation, tacticalRole,
      mg, physical, oop, ip, summary, transfermarktUrl, fixtureSearch
    } = formData;

    const transfermarktId = extractTransfermarktId(transfermarktUrl);
    const transfermarktLink = transfermarktId
      ? `https://www.transfermarkt.com/player/profil/spieler/${transfermarktId}`
      : '';

    const fullReport = `**Player:** ${playerName}\n**Date:** ${reportDate}\n**Team:** ${team}\n**Opposition:** ${opposition}\n**Position:** ${position}\n**Formation:** ${formation}\n**Tactical Role:** ${tacticalRole}\n**MG:** ${mg}/10\n${
      transfermarktLink ? `**Transfermarkt Profile:** [Link](${transfermarktLink})\n` : ''
    }${
      fixtureSearch ? `**Fixture:** ${fixtureSearch}\n` : ''
    }\n**Physical**\n${physical}\n\n**OOP**\n${oop}\n\n**IP**\n${ip}\n\n**Summary**\n${summary}`;

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
      alert("Report successfully submitted!");
      setPopupVisible(true);
    } catch (err) {
      console.error("Error sending to Google Sheets:", err);
      alert("Failed to submit to Google Sheets");
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: 'auto', padding: '1rem' }}>
      <h2>Scouting Report Form</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '10px' }}>
        <input
          name="transfermarktUrl"
          placeholder="Transfermarkt URL"
          value={formData.transfermarktUrl}
          onChange={(e) => setFormData({ ...formData, transfermarktUrl: e.target.value })}
          style={{ flex: 3, padding: '8px' }}
        />
        <button onClick={autoFillFromTransfermarkt} style={{ flex: 1, padding: '8px 16px' }}>Search</button>
      </div>

      {formData.photoUrl && (
        <img src={formData.photoUrl} alt="Player" style={{ width: '100px', borderRadius: '8px', marginBottom: '10px' }} />
      )}

      {[
        ['playerName', 'Player Name'],
        ['reportDate', 'Report Date'],
        ['team', 'Team / Club'],
        ['opposition', 'Opposition'],
        ['position', 'Position'],
        ['formation', 'Formation'],
        ['tacticalRole', 'Tactical Role'],
        ['mg', 'MG (1–10)'],
        ['nationality', 'Nationality'],
        ['age', 'Age'],
        ['fixtureTeamName', 'Team Name for Fixture Search']
      ].map(([key, label]) => (
        <input key={key} name={key} placeholder={label} onChange={handleChange} value={formData[key]} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      ))}

      <textarea name="physical" placeholder="Physical" onChange={handleChange} style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }} />
      <textarea name="oop" placeholder="OOP" onChange={handleChange} style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }} />
      <textarea name="ip" placeholder="IP" onChange={handleChange} style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }} />
      <textarea name="summary" placeholder="Summary" onChange={handleChange} style={{ width: '100%', minHeight: '100px', marginBottom: '10px', padding: '8px' }} />

      <button onClick={generateReport} style={{ width: '100%', padding: '12px', background: '#222', color: '#fff', border: 'none' }}>
        Upload Report
      </button>

      {report && (
        <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          {report}
        </div>
      )}
    </div>
  );
}
