import React, { useState } from 'react';

export default function PetProfile({ petData }) {
    const [activeTab, setActiveTab] = useState('Bio');

    // Default data if none provided
    const defaultPetData = {
        name: "Lorem Ipsum",
        breed: "Lorem Ipsum",
        color: "Lorem Ipsum",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80"
    };

    const data = petData || defaultPetData;

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Pet Profile</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* Pet Photo */}
                <div className="flex justify-center">
                    <div className="w-64 h-64 rounded-3xl overflow-hidden shadow-lg bg-slate-100">
                        <img 
                            src={data.image} 
                            alt="Pet profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Pet Details */}
                <div>
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        {['Bio', 'Medical', 'Owner', 'Other'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    activeTab === tab
                                        ? 'bg-amber-400 text-slate-800'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-slate-600 font-medium">Name</span>
                            <span className="col-span-2 text-slate-800">{data.name}</span>
                        </div>
                        <div className="h-px bg-slate-200"></div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-slate-600 font-medium">Breed</span>
                            <span className="col-span-2 text-slate-800">{data.breed}</span>
                        </div>
                        <div className="h-px bg-slate-200"></div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-slate-600 font-medium">Color</span>
                            <span className="col-span-2 text-slate-800">{data.color}</span>
                        </div>
                        <div className="h-px bg-slate-200"></div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <span className="text-slate-600 font-medium">Description</span>
                            <span className="col-span-2 text-slate-600 text-sm leading-relaxed">
                                {data.description}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Example usage demo
function Demo() {
    const samplePetData = {
        name: "Fluffy",
        breed: "Golden Retriever",
        color: "Golden Brown",
        description: "Friendly and energetic dog. Loves to play fetch and is great with children. Has a distinctive white patch on chest.",
        image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=500&q=80"
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-8">
            <PetProfile petData={samplePetData} />
        </div>
    );
}

export { Demo };