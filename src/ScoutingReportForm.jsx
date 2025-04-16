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
      // Try local running API first (priority)
      let response = await fetch(`http://localhost:8000/player/${playerId}`);
      if (!response.ok) throw new Error("Local API failed");
      let data = await response.json();

      setFormData((prev) => ({
        ...prev,
        playerName: data.name || '',
        team: data.club || '',
        position: data.position || '',
        nationality: data.nationality || '',
        age: data.age || '',
        photoUrl: data.image || ''
      }));
    } catch (err1) {
      console.warn("Local API failed, trying GitHub-hosted fallback", err1);
      try {
        const fallback = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://transfermarkt-api.vercel.app/player/${playerId}`)}`);
        const data = await fallback.json();

        if (!data.name) throw new Error("Fallback API failed or player not found");

        setFormData((prev) => ({
          ...prev,
          playerName: data.name || '',
          team: data.club || '',
          position: data.position || '',
          nationality: data.nationality || '',
          age: data.age || '',
          photoUrl: data.image || ''
        }));
      } catch (err2) {
        console.error("Both APIs failed:", err2);
        alert("Player not found. Check the link or try a different one.");
      }
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
      {/* Other form fields go here... */}
    </div>
  );
}
