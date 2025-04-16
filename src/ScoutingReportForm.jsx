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

  const [fixtureOptions, setFixtureOptions] = useState([]);

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
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://transfermarkt-api.vercel.app/player/${playerId}`)}`);
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

  return (
    <div style={{ maxWidth: '720px', margin: 'auto', padding: '1rem' }}>
      <h2>Scouting Report Form</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '10px' }}>
        <input
          name="transfermarktUrl"
          placeholder="Transfermarkt URL"
          value={formData.transfermarktUrl}
          onChange={handleChange}
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
        <input
          key={key}
          name={key}
          placeholder={label}
          value={formData[key]}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
      ))}

      <textarea
        name="physical"
        placeholder="Physical"
        onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }}
      />
      <textarea
        name="oop"
        placeholder="OOP"
        onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }}
      />
      <textarea
        name="ip"
        placeholder="IP"
        onChange={handleChange}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }}
      />
      <textarea
        name="summary"
        placeholder="Summary"
        onChange={handleChange}
        style={{ width: '100%', minHeight: '100px', marginBottom: '10px', padding: '8px' }}
      />
    </div>
  );
}
