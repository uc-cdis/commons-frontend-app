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
  const getLastPathSegment = (path: string): string =>
    path.split('/').filter(Boolean).pop() ?? path;

  return (
    <div data-testid="teams-dropdown">
      <Select
        label="Please select your team"
        placeholder="-select one of the team projects below-"
        value={selectedTeamProject}
        data={teams.map((team) => ({
          value: team.teamName, // e.g., '/team_project/project1'
          label: getLastPathSegment(team.teamName), // e.g., 'project1'
        }))}
        onChange={setSelectedTeamProject}
      />
    </div>
  );
};

export default TeamsDropdown;
