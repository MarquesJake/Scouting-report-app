import React, { useState } from 'react';
import './style.css';

const ScoutingReportForm = () => {
  const [playerUrl, setPlayerUrl] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [formFields, setFormFields] = useState({
    playerName: '',
    reportDate: '',
    team: '',
    opposition: '',
    position: '',
    formation: '',
    tacticalRole: '',
    mg: '',
    nationality: '',
    age: '',
    fixtureSearch: '',
    physical: '',
    oop: '',
    ip: '',
    summary: ''
  });

  const extractPlayerName = (url) => {
    const regex = /transfermarkt\.[^/]+\/([^/]+)\/profil/;
    const match = url.match(regex);
    return match ? match[1].replace(/-/g, ' ') : null;
  };

  const handleSearch = async () => {
    const playerName = extractPlayerName(playerUrl);
    if (!playerName) {
      alert('Invalid Transfermarkt URL');
      return;
    }

    try {
      const response = await fetch(
        `https://transfermarkt-db.p.rapidapi.com/v1/search/quick-search?locale=DE&query=${encodeURIComponent(playerName)}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': 'ec0f6da911msh397a0a7a4ac8a3fp1f44f2jsn249a9bbcf3cd',
            'X-RapidAPI-Host': 'transfermarkt-db.p.rapidapi.com'
          }
        }
      );

      const data = await response.json();
      console.log('API response:', data);

      if (!data || !data.results || data.results.length === 0) {
        alert('Player not found or invalid response from API.');
        return;
      }

      const player = data.results[0];
      setPlayerData(player);
      setFormFields((prev) => ({
        ...prev,
        playerName: player.name || '',
        team: player.club || '',
        age: player.age || '',
        nationality: player.nationality || '',
        position: player.position || ''
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Something went wrong while fetching data.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container">
      <h1>Scouting Report Form</h1>
      <div className="input-group">
        <input
          type="text"
          value={playerUrl}
          onChange={(e) => setPlayerUrl(e.target.value)}
          placeholder="Paste Transfermarkt player URL"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="form">
        <input name="playerName" value={formFields.playerName} onChange={handleChange} placeholder="Player Name" />
        <input name="reportDate" value={formFields.reportDate} onChange={handleChange} placeholder="Report Date" />
        <input name="team" value={formFields.team} onChange={handleChange} placeholder="Team / Club" />
        <input name="opposition" value={formFields.opposition} onChange={handleChange} placeholder="Opposition" />
        <input name="position" value={formFields.position} onChange={handleChange} placeholder="Position" />
        <input name="formation" value={formFields.formation} onChange={handleChange} placeholder="Formation" />
        <input name="tacticalRole" value={formFields.tacticalRole} onChange={handleChange} placeholder="Tactical Role" />
        <input name="mg" value={formFields.mg} onChange={handleChange} placeholder="MG (1–10)" />
        <input name="nationality" value={formFields.nationality} onChange={handleChange} placeholder="Nationality" />
        <input name="age" value={formFields.age} onChange={handleChange} placeholder="Age" />
        <input name="fixtureSearch" value={formFields.fixtureSearch} onChange={handleChange} placeholder="Team Name for Fixture Search" />
        <textarea name="physical" value={formFields.physical} onChange={handleChange} placeholder="Physical" />
        <textarea name="oop" value={formFields.oop} onChange={handleChange} placeholder="OOP" />
        <textarea name="ip" value={formFields.ip} onChange={handleChange} placeholder="IP" />
        <textarea name="summary" value={formFields.summary} onChange={handleChange} placeholder="Summary" />
      </div>
    </div>
  );
};

export default ScoutingReportForm;
