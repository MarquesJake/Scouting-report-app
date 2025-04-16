import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ScoutingReportForm() {
  const [formData, setFormData] = useState({
    playerName: '',
    date: '',
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
    fixtureDate: ''
  });

  const [report, setReport] = useState('');
  const [fixtureOptions, setFixtureOptions] = useState([]);

  const extractTransfermarktId = (url) => {
    const match = url.match(/spieler\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const autoFillFromTransfermarkt = async (url) => {
    const playerId = extractTransfermarktId(url);
    if (!playerId) return;

    try {
      const response = await fetch(`/api/player-info/${playerId}`);
      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        playerName: data.name || prev.playerName,
        team: data.club || prev.team,
        dateOfBirth: data.dob || '',
        nationality: data.nationality || ''
      }));
    } catch (error) {
      console.error("Error fetching Transfermarkt data", error);
    }
  };

  const handleTransfermarktChange = async (e) => {
    const url = e.target.value;
    setFormData({ ...formData, transfermarktUrl: url });
    await autoFillFromTransfermarkt(url);
  };

  const handleFixtureSearch = async () => {
    const { fixtureTeamName, fixtureDate } = formData;

    // TEMP: replace with real API call
    const mockFixtures = [
      `${fixtureTeamName} vs FC Example - ${fixtureDate}`,
      `${fixtureTeamName} vs Another Team - ${fixtureDate}`,
      `${fixtureTeamName} vs Sample Club - ${fixtureDate}`
    ];

    setFixtureOptions(mockFixtures);
  };

  const selectFixture = (fixture) => {
    setFormData({ ...formData, fixtureSearch: fixture });
  };

  const generateReport = () => {
    const {
      playerName,
      date,
      team,
      opposition,
      position,
      formation,
      tacticalRole,
      mg,
      physical,
      oop,
      ip,
      summary,
      transfermarktUrl,
      fixtureSearch
    } = formData;

    const transfermarktId = extractTransfermarktId(transfermarktUrl);
    const transfermarktLink = transfermarktId
      ? `https://www.transfermarkt.com/player/profil/spieler/${transfermarktId}`
      : '';

    const fullReport = `**Player:** ${playerName}\n**Date:** ${date}\n**Team:** ${team}\n**Opposition:** ${opposition}\n**Position:** ${position}\n**Formation:** ${formation}\n**Tactical Role:** ${tacticalRole}\n**MG:** ${mg}/10\n${
      transfermarktLink ? `**Transfermarkt Profile:** [Link](${transfermarktLink})\n` : ''
    }${
      fixtureSearch ? `**Fixture:** ${fixtureSearch}\n` : ''
    }\n**Physical**\n${physical}\n\n**OOP**\n${oop}\n\n**IP**\n${ip}\n\n**Summary**\n${summary}`;

    setReport(fullReport);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input name="playerName" placeholder="Player Name" value={formData.playerName} onChange={handleChange} />
          <Input name="date" placeholder="Date" onChange={handleChange} />
          <Input name="team" placeholder="Team / Club" value={formData.team} onChange={handleChange} />
          <Input name="opposition" placeholder="Opposition" onChange={handleChange} />
          <Input name="position" placeholder="Position" onChange={handleChange} />
          <Input name="formation" placeholder="Formation" onChange={handleChange} />
          <Input name="tacticalRole" placeholder="Tactical Role" onChange={handleChange} />
          <Input name="mg" placeholder="MG (1-10)" type="number" min="1" max="10" onChange={handleChange} />
          <Input name="transfermarktUrl" placeholder="Transfermarkt URL" onChange={handleTransfermarktChange} />

          <div className="space-y-2">
            <Input name="fixtureTeamName" placeholder="Team Name for Fixture Search" onChange={handleChange} />
            <Input name="fixtureDate" type="date" placeholder="Fixture Date" onChange={handleChange} />
            <Button onClick={handleFixtureSearch}>Search Fixtures</Button>
            {fixtureOptions.length > 0 && (
              <div className="space-y-2">
                {fixtureOptions.map((fixture, index) => (
                  <Button key={index} variant="outline" onClick={() => selectFixture(fixture)}>
                    {fixture}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Textarea name="physical" placeholder="Physical" onChange={handleChange} />
          <Textarea name="oop" placeholder="OOP" onChange={handleChange} />
          <Textarea name="ip" placeholder="IP" onChange={handleChange} />
          <Textarea name="summary" placeholder="Summary" onChange={handleChange} />

          <Button onClick={generateReport}>Generate Report</Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardContent className="whitespace-pre-wrap pt-6">
            {report}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
