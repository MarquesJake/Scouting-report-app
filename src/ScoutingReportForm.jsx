import { useState, useEffect } from 'react';

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
    if (!playerId) return;

    try {
      const response = await fetch(`https://transfermarkt-api.vercel.app/player/${playerId}`);
      const data = await response.json();

      const formattedName = data.name || '';

      setFormData((prev) => ({
        ...prev,
        playerName: formattedName,
        team: data.club || prev.team,
        position: data.position || prev.position,
        nationality: data.nationality || prev.nationality,
        age: data.age || prev.age,
        photoUrl: data.image || prev.photoUrl
      }));
    } catch (error) {
      console.error("Error fetching Transfermarkt data", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTransfermarktChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, transfermarktUrl: url }));
  };

  const handleFixtureSearch = async () => {
    const { fixtureTeamName } = formData;
    if (!fixtureTeamName) return;

    try {
      const response = await fetch(`https://transfermarkt-api.vercel.app/fixtures/${encodeURIComponent(fixtureTeamName)}`);
      const data = await response.json();

      const fixtures = data.fixtures?.map(match => `${match.home} vs ${match.away} - ${match.date}`) || [];
      setFixtureOptions(fixtures);
    } catch (err) {
      console.error("Error fetching fixtures from Transfermarkt API:", err);
      setFixtureOptions([]);
    }
  };

  const selectFixture = (fixture, index) => {
    setFormData({ ...formData, fixtureSearch: fixture });
    setSelectedFixtureIndex(index);
  };

  const generateReport = async () => {
    const transfermarktId = extractTransfermarktId(formData.transfermarktUrl);
    const transfermarktLink = transfermarktId
      ? `https://www.transfermarkt.com/player/profil/spieler/${transfermarktId}`
      : '';

    const fullReport = `**Player:** ${formData.playerName}\n**Date:** ${formData.reportDate}\n**Team:** ${formData.team}\n**Opposition:** ${formData.opposition}\n**Position:** ${formData.position}\n**Formation:** ${formData.formation}\n**Tactical Role:** ${formData.tacticalRole}\n**MG:** ${formData.mg}/10\n$${
      transfermarktLink ? `**Transfermarkt Profile:** [Link](${transfermarktLink})\n` : ''
    }$${
      formData.fixtureSearch ? `**Fixture:** ${formData.fixtureSearch}\n` : ''
    }
**Nationality:** ${formData.nationality}\n**Age:** ${formData.age}\n
**Physical**\n${formData.physical}\n\n**OOP**\n${formData.oop}\n\n**IP**\n${formData.ip}\n\n**Summary**\n${formData.summary}`;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        {formData.photoUrl && (
          <img src={formData.photoUrl} alt="Player" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
        )}
        <h2 style={{ marginBottom: '0' }}>Scouting Report Form</h2>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <input name="transfermarktUrl" placeholder="Transfermarkt URL" onChange={handleTransfermarktChange} value={formData.transfermarktUrl} style={{ flex: 4, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <button onClick={autoFillFromTransfermarkt} style={{ flex: 1, padding: '10px 0', borderRadius: '6px', border: '1px solid #ccc', background: '#eee' }}>Search</button>
      </div>

      {[['playerName', 'Player Name'], ['reportDate', 'Report Date'], ['team', 'Team / Club'], ['opposition', 'Opposition'], ['position', 'Position'], ['formation', 'Formation'], ['tacticalRole', 'Tactical Role'], ['mg', 'MG (1–10)'], ['nationality', 'Nationality'], ['age', 'Age']]
        .map(([key, label]) => (
          <input key={key} name={key} placeholder={label} onChange={handleChange} value={formData[key]} style={{ width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        ))}

      <input name="fixtureTeamName" placeholder="Team Name for Fixture Search" onChange={handleChange} value={formData.fixtureTeamName} style={{ width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
      <button onClick={handleFixtureSearch} style={{ width: '100%', padding: '10px', marginBottom: '12px', background: '#eee', borderRadius: '6px' }}>Search Fixtures</button>

      {fixtureOptions.map((fixture, i) => (
        <button
          key={i}
          onClick={() => selectFixture(fixture, i)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: selectedFixtureIndex === i ? '#d1e7dd' : '#f9f9f9',
            fontWeight: selectedFixtureIndex === i ? 'bold' : 'normal'
          }}
        >
          {fixture}
        </button>
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

