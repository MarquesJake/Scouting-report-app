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

  const [popupVisible, setPopupVisible] = useState(false);

  const extractTransfermarktId = (url) => {
    const match = url.match(/spieler\/(\d+)/);
    return match ? match[1] : null;
  };

  const autoFillFromTransfermarkt = async () => {
    const playerId = extractTransfermarktId(formData.transfermarktUrl);
    if (!playerId) {
      alert("Invalid Transfermarkt URL. Could not extract player ID.");
      return;
    }

    try {
      const response = await fetch(
        `https://corsproxy.io/?https://transfermarkt-api.vercel.app/player/${playerId}`
      );
      const data = await response.json();

      if (!data || !data.name) {
        alert("Player data not found. Check Transfermarkt ID.");
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
    } catch (error) {
      console.error("Error fetching data:", error);
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
        <button
          onClick={autoFillFromTransfermarkt}
          style={{ flex: 1, padding: '8px 16px', cursor: 'pointer' }}
        >
          Search
        </button>
      </div>

      {formData.photoUrl && (
        <img
          src={formData.photoUrl}
          alt="Player"
          style={{ width: '100px', borderRadius: '8px', marginBottom: '10px' }}
        />
      )}

      <input placeholder="Player Name" value={formData.playerName} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <input placeholder="Report Date" value={formData.reportDate} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <input placeholder="Team / Club" value={formData.team} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <input placeholder="Position" value={formData.position} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <input placeholder="Nationality" value={formData.nationality} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <input placeholder="Age" value={formData.age} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      
      {/* You can add the rest of the fields here just like above */}
    </div>
  );
}
