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
    if (!playerId) return;

    try {
      const response = await fetch(`/api/player-info?playerId=${playerId}`);
      const data = await response.json();

      if (!data.name) {
        alert("Player not found. Double check the Transfermarkt link or try a different player.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        playerName: data.name || prev.playerName,
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

  const generateReport = async () => {
    const response = await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    setPopupVisible(true);
    setTimeout(() => {
      setPopupVisible(false);
      window.location.reload();
    }, 1800);
  };

  const handleFixtureSearch = () => {
    const team = formData.fixtureTeamName || formData.team || 'Sample Club';
    const mockFixtures = [
      `${team} vs FC Example`,
      `${team} vs Another Team`,
      `${team} vs Sample Club`
    ];
    setFixtureOptions(mockFixtures);
  };

  const selectFixture = (fixture, index) => {
    setFormData({ ...formData, fixtureSearch: fixture });
    setSelectedFixtureIndex(index);
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
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={autoFillFromTransfermarkt} style={{ padding: '8px 16px' }}>Search</button>
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

      <button onClick={handleFixtureSearch} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
        Search Fixtures
      </button>

      {fixtureOptions.map((fixture, i) => (
        <button
          key={i}
          onClick={() => selectFixture(fixture, i)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '5px',
            backgroundColor: i === selectedFixtureIndex ? '#ccc' : '#f5f5f5',
            border: i === selectedFixtureIndex ? '2px solid #333' : '1px solid #ccc'
          }}
        >
          {fixture}
        </button>
      ))}

      <textarea name="physical" placeholder="Physical" value={formData.physical} onChange={handleChange} style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }} />
      <textarea name="oop" placeholder="OOP" value={formData.oop} onChange={handleChange} style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }} />
      <textarea name="ip" placeholder="IP" value={formData.ip} onChange={handleChange} style={{ width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px' }} />
      <textarea name="summary" placeholder="Summary" value={formData.summary} onChange={handleChange} style={{ width: '100%', minHeight: '100px', marginBottom: '10px', padding: '8px' }} />

      <button onClick={generateReport} style={{ width: '100%', padding: '12px', background: '#222', color: '#fff', border: 'none' }}>
        Upload Report
      </button>

      {popupVisible && (
        <div style={{ background: '#dff0d8', color: '#3c763d', padding: '10px', marginTop: '15px', textAlign: 'center', borderRadius: '5px' }}>
          Report submitted!
        </div>
      )}
    </div>
  );
}
