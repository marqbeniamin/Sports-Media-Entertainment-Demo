import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { Search } from 'lucide-react'; // Ensure you're importing the Search icon from lucide-react
import { PubNubConext, PubNubType } from '@/context/PubNubContext';
import { Channel } from '@pubnub/chat';

interface CommunitySearchProps {
  onJoinCommunity: (community: Channel) => void;
}

const CommunitySearch: React.FC<CommunitySearchProps> = ({ onJoinCommunity }) => {

  const {
    communities,
  } = useContext(PubNubConext) as PubNubType;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredCommunities, setFilteredCommunities] = useState<Channel[]>(communities || []);

  // Handle the search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      setFilteredCommunities(
        communities.filter(c => c.name?.toLowerCase().includes(query.toLowerCase()))
      );
    } else {
      setFilteredCommunities(communities);
    }
  };

  return (
    <div className="p-6 bg-gray-900 h-full flex flex-col rounded-lg shadow-md">
      {/* Search Input */}
      <div className="relative flex items-center mb-6">
        {/* Search Icon */}
        <Search className="w-5 h-5 text-gray-400 absolute left-4" />

        <input
          type="text"
          placeholder="Search for communities..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full h-12 pl-12 pr-4 text-white bg-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* Community List */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {filteredCommunities.length > 0 ? (
          filteredCommunities.map((community, index) => (
            <div
              key={index}
              className="p-4 mb-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition flex justify-between items-center"
            >
              <span className="text-white font-medium">{community.name || "Unnamed Community"}</span>
              <button
                onClick={() => onJoinCommunity(community)}
                className="text-blue-500 hover:underline transition"
              >
                Join
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No communities found.</p>
        )}
      </div>
    </div>
  );
};

export default CommunitySearch;