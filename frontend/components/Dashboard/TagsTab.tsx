import React from 'react';
import { Tag } from 'lucide-react';
import { useUserContext } from '../../contexts/UserContext';

const TagsTab: React.FC = () => {
    const { tags, activateTag } = useUserContext();

    const handleActivateTag = async (tagId: string) => {
        const success = await activateTag(tagId);
        if (!success) {
            alert('Failed to activate tag');
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-4xl font-bold text-white">My Tags</h2>
                <p className="text-gray-400 mt-1">Manage your pet tracking tags</p>
            </div>

            <div className="grid gap-4">
                {tags.map(tag => (
                    <div 
                        key={tag._id} 
                        className="bg-gradient-to-br from-primary via-black to-black rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-black shadow-md shadow-primary rounded-lg flex items-center justify-center">
                                    <Tag className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white font-mono">{tag.qrCode}</h3>
                                    <p className="text-sm text-gray-400">
                                        Purchased: {new Date(tag.createdAt).toLocaleDateString()}
                                    </p>
                                    {tag.pet.name && (
                                        <p className="text-sm text-primary mt-1">Assigned to: {tag.pet.name}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                                    tag.status === 'active'
                                        ? 'bg-black text-primary shadow-md shadow-primary'
                                        : 'bg-gray-400 text-gray-800'
                                }`}>
                                    {tag.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                                {tag.status === 'inactive' && (
                                    <button
                                        onClick={() => handleActivateTag(tag._id)}
                                        className="px-4 py-2 bg-gradient-to-br from-primary via-black via-80% to-black shadow-md shadow-primary text-white rounded-lg hover:shadow-lg transition-all"
                                    >
                                        Activate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {tags.length === 0 && (
                <div className="text-center py-16">
                    <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No tags yet</h3>
                    <p className="text-gray-400">Purchase tags to track your pets</p>
                </div>
            )}
        </div>
    );
};

export default TagsTab;