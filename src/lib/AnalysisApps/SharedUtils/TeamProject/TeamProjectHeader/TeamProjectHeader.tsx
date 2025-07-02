import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EditIcon from './Icons/EditIcon';
import isEnterOrSpace from '../../AccessibilityUtils/IsEnterOrSpace';
import TeamProjectModal from '../TeamProjectModal/TeamProjectModal';
import IsCurrentTeamProjectValid from './IsCurrentTeamProjectValid';
//import { TeamProjectsEndpoint } from '../../Endpoints';
import { Loader } from '@mantine/core';
//import useSWR from 'swr';

const runningApplicationClientSide = typeof window !== 'undefined';

interface TeamProjectHeaderProps {
  isEditable: boolean;
}
const TeamProjectHeader: React.FC<TeamProjectHeaderProps> = ({
  isEditable,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerText, setBannerText] = useState('- -');
  const [selectedTeamProject, setSelectedTeamProject] = useState<string | null>(runningApplicationClientSide && localStorage.getItem('teamProject') || null);
  const [redirect, setRedirect] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const router = useRouter();

  const rerouteToAppSelectionIfNeeded = () => {
    if (
      !isEditable &&
      runningApplicationClientSide &&
      !localStorage.getItem('teamProject')
    ) {
      if ( redirect === false) {
        setRedirect(true);
      }
    }
  };
  useEffect(() => {
    // non-editable view should redirect to app selection if user doesn't have a storedTeamProject
    if (redirect) {
      router.push('/resource-browser');
    }
  }, [redirect]);

  // SWR CODE
  /*const { data, error, isLoading } = useSWR(TeamProjectsEndpoint, (...args) =>
    fetch(...args).then((res) => res.json()),
  );*/
  // TODO: Replace with actual API call when available
  const data = {
    teams: [
        {
          teamName: '/gwas_projects/project1',
        },
        {
          teamName: '/gwas_projects/project2',
        },
      ],
    };
  const error = 'success';
  const isLoading = false;

  let currentTeamProjectIsValid = false;
  if (data) {
    currentTeamProjectIsValid = IsCurrentTeamProjectValid(data);
    if (!currentTeamProjectIsValid) {
      if ( runningApplicationClientSide) {
        localStorage.removeItem('teamProject');
      }
      rerouteToAppSelectionIfNeeded();
    }
  }

  useEffect(() => {
    const storedTeamProject =
      runningApplicationClientSide && localStorage.getItem('teamProject');
    if (storedTeamProject) {
      setBannerText(storedTeamProject);
    } else if (isEditable) {
      showModal();
    }
    rerouteToAppSelectionIfNeeded();
  }, [isEditable, currentTeamProjectIsValid, data]);

  const getLastPathSegment = (path: string) => path.split('/').filter(Boolean).pop();

  if (isLoading) return <Loader size="sm" />;
  return (
    <div>
      <div
        data-testid="team-project-header"
        className="text-vadc-secondary text-lg"
      >
        <strong className="text-xl ">Team Project</strong>: {getLastPathSegment(bannerText)}
        {isEditable && (
          <button
            className="team-project-header_modal-button ml-2"
            aria-label="Change Team Project"
            type="button"
            tabIndex={0}
            data-testid="team-project-edit"
            onClick={() => {
              showModal();
            }}
            onKeyDown={(e) => {
              if (isEnterOrSpace(e)) showModal();
            }}
          >
            <EditIcon />
          </button>
        )}
      </div>
      {isEditable && (
        <TeamProjectModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          setBannerText={setBannerText}
          data={data}
          status={error}
          selectedTeamProject={selectedTeamProject}
          setSelectedTeamProject={setSelectedTeamProject}
        />
      )}
    </div>
  );
};

export default TeamProjectHeader;
