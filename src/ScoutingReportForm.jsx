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

  const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzIh7QXuXyqi9jmXTFocNtPac4kUBBJNGHX4_reWsZ9hyoJHfrfudnaNMaMIUMQiENu/exec";

  const extractTransfermarktId = (url) => {
    const match = url.match(/spieler\/(\d+)/);
    return match ? match[1] : null;
  };

  const autoFillFromTransfermarkt = async () => {
    const url = formData.transfermarktUrl;
    const playerId = extractTransfermarktId(url);
    if (!playerId) {
      alert("Invalid Transfermarkt link");
      return;
    }

    try {
      const response = await fetch(`/api/player-info/${playerId}`); // <--- Backend proxy route
      const data = await response.json();

      if (!data.name) {
        alert("Player not found. Double check the link.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        playerName: data.name,
        team: data.club,
        position: data.position,
        nationality: data.nationality,
        age: data.age,
        photoUrl: data.image
      }));
    } catch (error) {
      console.error("Error fetching Transfermarkt data", error);
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

      <input name="playerName" placeholder="Player Name" value={formData.playerName} readOnly style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <input name="team" placeholder="Team / Club" value={formData.team} readOnly style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <input name="position" placeholder="Position" value={formData.position} readOnly style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <input name="nationality" placeholder="Nationality" value={formData.nationality} readOnly style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <input name="age" placeholder="Age" value={formData.age} readOnly style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
    </div>
  );
}
