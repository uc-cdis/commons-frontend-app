import React from 'react';

interface Team {
  teamName: string;
}

interface TeamsDropdownProps {
  teams: Team[];
  selectedTeamProject: string | null | false;
  setSelectedTeamProject: (selectedTeamProject: string) => void;
}

const TeamsDropdown: React.FC<TeamsDropdownProps> = ({
  teams,
  selectedTeamProject,
  setSelectedTeamProject,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedTeamProject(selectedValue);
  };

  const selectedValue =
    selectedTeamProject === null || selectedTeamProject === false
      ? 'placeholder'
      : selectedTeamProject;

  return (
    <div data-testid="teams-dropdown">
      <label id="team-select-label" className="sr-only" htmlFor="team-select">
        Select Team Project
      </label>
      <select
        id="team-select"
        className="mb-6 w-full"
        aria-labelledby="team-select-label"
        value={selectedValue}
        onChange={handleChange}
      >
        {selectedTeamProject === null && (
          <option value="placeholder" disabled>
            -select one of the team projects below-
          </option>
        )}
        {teams.map((team, index) => (
          <option key={index} value={team.teamName}>
            {team.teamName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TeamsDropdown;
