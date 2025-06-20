import React from 'react';
import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

interface SearchBarProps {
  searchTerm: string;
  handleSearch: (value: string) => void;
  field?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  handleSearch,
  field = 'variable name',
}) => (
  <div data-tour="search-bar" className="text-sm w-64">
    <TextInput
      type="text"
      rightSection={<IconSearch size={16} />}
      placeholder={`Search by ${field}...`}
      value={searchTerm}
      onChange={(e) => handleSearch(e.target.value)}
    />
  </div>
);

export default SearchBar;
