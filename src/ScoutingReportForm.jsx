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
  const [popupVisible, setPopupVisible] = useState(false);
  const [report, setReport] = useState('');

  const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzIh7QXuXyqi9jmXTFocNtPac4kUBBJNGHX4_reWsZ9hyoJHfrfudnaNMaMIUMQiENu/exec';

  const extractTransfermarktId = (url) => {
    const match = url.match(/spieler\/(\d+)/);
    return match ? match[1] : null;
  };

  const autoFillFromTransfermarkt = async () => {
    const playerId = extractTransfermarktId(formData.transfermarktUrl);
    if (!playerId) return alert("Invalid Transfermarkt URL");

    try {
      const res = await fetch(`https://corsproxy.io/?https://transfermarkt-api.vercel.app/player/${playerId}`);
      const data = await res.json();

      if (!data.name) return alert("Failed to retrieve player data");

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
      console.error("Error fetching player data:", err);
      alert("Something went wrong while fetching data.");
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
        <input
          key={key}
          name={key}
          placeholder={label}
          value={formData[key]}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
      ))}

      {['physical', 'oop', 'ip', 'summary'].map((key) => (
        <textarea
          key={key}
          name={key}
          placeholder={key.toUpperCase()}
          value={formData[key]}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }}
        />
      ))}

      <button
        onClick={() => {
          alert('Coming soon: Upload to sheet!');
        }}
        style={{ width: '100%', padding: '12px', background: '#222', color: '#fff', border: 'none', borderRadius: '6px' }}
      >
        Upload Report
      </button>
    </div>
  );
}
