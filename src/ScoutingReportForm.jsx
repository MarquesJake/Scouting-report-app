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

  const extractPlayerId = (url) => {
    const match = url.match(/spieler\/(\d+)/);
    return match ? match[1] : null;
  };

  const autoFillFromTransfermarkt = async () => {
    const playerId = extractPlayerId(formData.transfermarktUrl);
    if (!playerId) {
      alert("Could not extract player ID from URL");
      return;
    }

    try {
      const response = await fetch(`https://transfermarkt13.p.rapidapi.com/player_info?player_id=${playerId}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'ec0f6da911msh397a0a7a4ac8a3fp1f44f2jsn249a9bbcf3cd',
          'X-RapidAPI-Host': 'transfermarkt13.p.rapidapi.com'
        }
      });

      const data = await response.json();

      if (!data.name) {
        alert("Player not found. Check the link or try a different one.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        playerName: data.name || '',
        team: data.current_club?.name || '',
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
        <button onClick={autoFillFromTransfermarkt} style={{ flex: 1, padding: '8px 16px' }}>
          Search
        </button>
      </div>

      {formData.photoUrl && (
        <img src={formData.photoUrl} alt="Player" style={{ width: '100px', borderRadius: '8px', marginBottom: '10px' }} />
      )}

      <input placeholder="Player Name" value={formData.playerName} readOnly />
      <input placeholder="Report Date" value={formData.reportDate} onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })} />
      <input placeholder="Team / Club" value={formData.team} readOnly />
      <input placeholder="Opposition" value={formData.opposition} onChange={(e) => setFormData({ ...formData, opposition: e.target.value })} />
      <input placeholder="Position" value={formData.position} readOnly />
      <input placeholder="Formation" value={formData.formation} onChange={(e) => setFormData({ ...formData, formation: e.target.value })} />
      <input placeholder="Tactical Role" value={formData.tacticalRole} onChange={(e) => setFormData({ ...formData, tacticalRole: e.target.value })} />
      <input placeholder="MG (1–10)" value={formData.mg} onChange={(e) => setFormData({ ...formData, mg: e.target.value })} />
      <input placeholder="Nationality" value={formData.nationality} readOnly />
      <input placeholder="Age" value={formData.age} readOnly />
    </div>
  );
}
