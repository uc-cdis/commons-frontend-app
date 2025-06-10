import React, { useState, useEffect } from 'react';
import { Modal, Button, Loader } from '@mantine/core';
import LoadingErrorMessage from '../../LoadingErrorMessage/LoadingErrorMessage';
import TeamsDropdown from './TeamsDropdown/TeamsDropdown';
import { useRouter } from 'next/router';

const runningApplicationClientSide = typeof window !== 'undefined';
interface Team {
  teamName: string;
}
interface TeamProjectModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  setBannerText: (bannerText: string) => void;
  data: { teams: Team[] } | null;
  status: 'loading' | 'error' | 'success';
  selectedTeamProject: string | null;
  setSelectedTeamProject: React.Dispatch<React.SetStateAction<string | null>>;
}

const TeamProjectModal: React.FC<TeamProjectModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  setBannerText,
  data,
  status,
  selectedTeamProject,
  setSelectedTeamProject,
}) => {
  const [redirect, setRedirect] = useState(false);
  const router = useRouter();
  const closeAndUpdateTeamProject = () => {
    setIsModalOpen(false);
    if( selectedTeamProject) {
      setBannerText(selectedTeamProject);
    }
    if ( runningApplicationClientSide &&
      selectedTeamProject) {
        localStorage.setItem('teamProject', selectedTeamProject);
      }
  };
  useEffect(() => {
    // non-editable view should redirect to app selection if user doesn't have a storedTeamProject
    if (redirect) {
      router.push('/')
    }
  }, [redirect]);
  const redirectToHomepage = () => {
    setRedirect(true);
  };

  if (status === 'error') {
    return (
      <Modal
        opened={isModalOpen}
        title="Team Projects"
        onClose={() => null}
        closeOnClickOutside={false}
        closeOnEscape={false}
        size="lg"
      >
        <LoadingErrorMessage
          message={'Error while trying to retrieve user access details'}
        />
      </Modal>
    );
  }
  if (data) {
    if (data.teams.length > 0) {
      return (
        <Modal
          title="Team Projects"
          opened={isModalOpen}
          onClose={() =>
            runningApplicationClientSide &&
            localStorage.getItem('teamProject') &&
            setIsModalOpen(false)
          }
          closeOnClickOutside={false}
          closeOnEscape={false}
          size="lg"
          // onCancel={() => setIsModalOpen(false)}
          // closable={localStorage.getItem('teamProject')}
          // maskClosable={localStorage.getItem('teamProject')}
          // keyboard={localStorage.getItem('teamProject')}
        >
          <TeamsDropdown
            teams={data.teams}
            selectedTeamProject={selectedTeamProject}
            setSelectedTeamProject={setSelectedTeamProject}
          />
          <Button
            className="mb-4 float-right"
            disabled={!selectedTeamProject}
            onClick={() => closeAndUpdateTeamProject()}
          >
            Submit
          </Button>
        </Modal>
      );
    }
    return (
      <Modal
        opened={isModalOpen}
        title="Team Projects"
        size="lg"
        onClose={() => null}
      >
        <div className="team-project-modal_modal-description">
          Please reach out to{' '}
          <a href="mailto:vadc-support@gen3.org">vadc-support@gen3.org</a>{' '}
          to gain access to the system
        </div>
        <Button key="submit" onClick={redirectToHomepage}>
          Ok
        </Button>
      </Modal>
    );
  }
  return (
    <Modal opened={isModalOpen} title="Team Projects" onClose={() => null}>
      <div className="spinner-container">
        <Loader /> Retrieving the list of team projects.
        <br />
        Please wait...
      </div>
    </Modal>
  );
};

export default TeamProjectModal;
