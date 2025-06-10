import React from 'react';
import { Select } from '@mantine/core';

interface Team {
  teamName: string;
}

interface TeamsDropdownProps {
  teams: Team[];
  selectedTeamProject: string | null;
  setSelectedTeamProject: React.Dispatch<React.SetStateAction<string | null>>;
}

const TeamsDropdown: React.FC<TeamsDropdownProps> = ({
  teams,
  selectedTeamProject,
  setSelectedTeamProject,
}) => {

  return (
    <div data-testid="teams-dropdown">
      <Select
        label="Please select your team"
        placeholder="-select one of the team projects below-"
        value={selectedTeamProject}
        data={teams.map((team) => team.teamName)}
        onChange={setSelectedTeamProject}
      />
    </div>
  );
};

export default TeamsDropdown;
