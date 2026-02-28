import { useState } from 'react';
import {
    HiOutlineCog6Tooth,
    HiOutlineClipboardDocumentList,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlinePlusCircle,
    HiOutlineArrowsUpDown,
    HiOutlineInformationCircle,
    HiOutlineCheckCircle,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

// Default pipeline stages (to be stored in DB later)
const DEFAULT_STAGES = [
    { id: '1', name: 'Applied', color: '#6366F1', description: 'Initial application received', order: 1 },
    { id: '2', name: 'Screening', color: '#8B5CF6', description: 'Resume screening by recruiter', order: 2 },
    { id: '3', name: 'Shortlisted', color: '#06B6D4', description: 'Candidate shortlisted for employer review', order: 3 },
    { id: '4', name: 'Submitted to Employer', color: '#F59E0B', description: 'Profile sent to employer for review', order: 4 },
    { id: '5', name: 'Interviewing', color: '#3B82F6', description: 'Interview process underway', order: 5 },
    { id: '6', name: 'Offered', color: '#10B981', description: 'Offer extended to candidate', order: 6 },
    { id: '7', name: 'Hired', color: '#22C55E', description: 'Candidate accepted and hired', order: 7 },
    { id: '8', name: 'Rejected', color: '#EF4444', description: 'Candidate rejected', order: 8 },
];

const AdminSettings = () => {
    const [stages, setStages] = useState(DEFAULT_STAGES);
    const [editingStage, setEditingStage] = useState(null);
    const [newStage, setNewStage] = useState({ name: '', color: '#6366F1', description: '' });
    const [showAddForm, setShowAddForm] = useState(false);

    const handleSaveStage = () => {
        if (editingStage) {
            setStages((prev) =>
                prev.map((s) => (s.id === editingStage.id ? { ...editingStage } : s))
            );
            setEditingStage(null);
            toast.success('Stage updated');
        }
    };

    const handleAddStage = () => {
        if (!newStage.name.trim()) {
            toast.error('Stage name is required');
            return;
        }
        const stage = {
            id: Date.now().toString(),
            name: newStage.name,
            color: newStage.color,
            description: newStage.description,
            order: stages.length + 1,
        };
        setStages((prev) => [...prev, stage]);
        setNewStage({ name: '', color: '#6366F1', description: '' });
        setShowAddForm(false);
        toast.success('Stage added');
    };

    const handleDeleteStage = (id) => {
        setStages((prev) => prev.filter((s) => s.id !== id));
        toast.success('Stage removed');
    };

    const moveStage = (id, direction) => {
        const index = stages.findIndex((s) => s.id === id);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === stages.length - 1)
        ) return;

        const newStages = [...stages];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newStages[index], newStages[swapIndex]] = [newStages[swapIndex], newStages[index]];
        newStages.forEach((s, i) => (s.order = i + 1));
        setStages(newStages);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-dark-900">System Settings</h2>
                <p className="text-sm text-dark-500 mt-0.5">
                    Configure pipeline stages and platform settings
                </p>
            </div>

            {/* Pipeline Stages */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <HiOutlineClipboardDocumentList className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-dark-900">Pipeline Stages</h3>
                            <p className="text-xs text-dark-400">
                                Configure the hiring pipeline stages for all jobs
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 gradient-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md"
                    >
                        <HiOutlinePlusCircle className="w-4 h-4" />
                        Add Stage
                    </button>
                </div>

                {/* Info */}
                <div className="mb-5 p-3 bg-info-50 border border-info-200 rounded-lg flex items-start gap-2">
                    <HiOutlineInformationCircle className="w-4 h-4 text-info-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-info-700">
                        These stages define the hiring pipeline flow. Drag to reorder or use the arrows to
                        change the sequence. Changes will apply to all new jobs.
                    </p>
                </div>

                {/* Add Stage Form */}
                {showAddForm && (
                    <div className="mb-5 p-4 bg-dark-50 rounded-xl border border-dark-200">
                        <h4 className="text-sm font-semibold text-dark-800 mb-3">New Stage</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                                type="text"
                                value={newStage.name}
                                onChange={(e) =>
                                    setNewStage((prev) => ({ ...prev, name: e.target.value }))
                                }
                                placeholder="Stage name"
                                className="px-3 py-2 rounded-lg border border-dark-200 text-sm text-dark-800 placeholder-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            />
                            <input
                                type="text"
                                value={newStage.description}
                                onChange={(e) =>
                                    setNewStage((prev) => ({ ...prev, description: e.target.value }))
                                }
                                placeholder="Description (optional)"
                                className="px-3 py-2 rounded-lg border border-dark-200 text-sm text-dark-800 placeholder-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={newStage.color}
                                    onChange={(e) =>
                                        setNewStage((prev) => ({ ...prev, color: e.target.value }))
                                    }
                                    className="w-10 h-10 rounded-lg border border-dark-200 cursor-pointer"
                                />
                                <button
                                    onClick={handleAddStage}
                                    className="flex-1 py-2 gradient-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="py-2 px-3 rounded-lg border border-dark-200 text-xs font-medium text-dark-600 hover:bg-dark-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stages List */}
                <div className="space-y-2">
                    {stages.map((stage, index) => (
                        <div
                            key={stage.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${editingStage?.id === stage.id
                                    ? 'border-primary-300 bg-primary-50/30 shadow-sm'
                                    : 'border-dark-100 bg-white hover:border-dark-200 hover:shadow-sm'
                                }`}
                        >
                            {/* Order Number */}
                            <div className="w-7 h-7 rounded-lg bg-dark-100 flex items-center justify-center text-xs font-bold text-dark-500 flex-shrink-0">
                                {index + 1}
                            </div>

                            {/* Color Dot */}
                            <div
                                className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                                style={{ backgroundColor: stage.color }}
                            />

                            {/* Name & Description */}
                            {editingStage?.id === stage.id ? (
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        value={editingStage.name}
                                        onChange={(e) =>
                                            setEditingStage((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        className="px-2.5 py-1.5 rounded-md border border-primary-300 text-sm text-dark-800 focus:ring-2 focus:ring-primary-100"
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={editingStage.color}
                                            onChange={(e) =>
                                                setEditingStage((prev) => ({
                                                    ...prev,
                                                    color: e.target.value,
                                                }))
                                            }
                                            className="w-8 h-8 rounded border border-dark-200 cursor-pointer"
                                        />
                                        <button
                                            onClick={handleSaveStage}
                                            className="px-3 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-md hover:bg-primary-600 transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingStage(null)}
                                            className="px-3 py-1.5 border border-dark-200 text-xs font-medium text-dark-600 rounded-md hover:bg-dark-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-dark-800">
                                        {stage.name}
                                    </p>
                                    {stage.description && (
                                        <p className="text-xs text-dark-400 truncate">
                                            {stage.description}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            {editingStage?.id !== stage.id && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => moveStage(stage.id, 'up')}
                                        disabled={index === 0}
                                        className="p-1 rounded text-dark-400 hover:text-dark-600 hover:bg-dark-100 disabled:opacity-30 transition-colors"
                                        title="Move up"
                                    >
                                        <HiOutlineArrowsUpDown className="w-3.5 h-3.5 rotate-180" />
                                    </button>
                                    <button
                                        onClick={() => moveStage(stage.id, 'down')}
                                        disabled={index === stages.length - 1}
                                        className="p-1 rounded text-dark-400 hover:text-dark-600 hover:bg-dark-100 disabled:opacity-30 transition-colors"
                                        title="Move down"
                                    >
                                        <HiOutlineArrowsUpDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setEditingStage({ ...stage })}
                                        className="p-1 rounded text-dark-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                        title="Edit"
                                    >
                                        <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStage(stage.id)}
                                        className="p-1 rounded text-dark-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                                        title="Remove"
                                    >
                                        <HiOutlineTrash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* General Settings Section */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center">
                        <HiOutlineCog6Tooth className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-dark-900">General Settings</h3>
                        <p className="text-xs text-dark-400">
                            Platform-wide configuration options
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Setting item */}
                    {[
                        {
                            label: 'Auto-approve Employer Registration',
                            description:
                                'When enabled, new employer accounts are automatically approved without admin review.',
                            enabled: false,
                        },
                        {
                            label: 'Candidate Email Verification Required',
                            description:
                                'Require candidates to verify their email before applying to jobs.',
                            enabled: true,
                        },
                        {
                            label: 'Allow Multiple Applications per Job',
                            description:
                                'When disabled, candidates can only submit one application per job listing.',
                            enabled: false,
                        },
                        {
                            label: 'Send Notifications on Stage Change',
                            description:
                                'Automatically notify candidates when their application moves to a new pipeline stage.',
                            enabled: true,
                        },
                    ].map((setting, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-4 rounded-xl border border-dark-100 hover:border-dark-200 transition-colors"
                        >
                            <div className="flex-1 pr-4">
                                <p className="text-sm font-semibold text-dark-800">
                                    {setting.label}
                                </p>
                                <p className="text-xs text-dark-400 mt-0.5">
                                    {setting.description}
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    defaultChecked={setting.enabled}
                                    className="sr-only peer"
                                    onChange={() =>
                                        toast.success(`Setting ${setting.enabled ? 'disabled' : 'enabled'} (preview)`)
                                    }
                                />
                                <div className="w-11 h-6 bg-dark-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                            </label>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-dark-100">
                    <button
                        onClick={() => toast.success('Settings saved (preview mode)')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 gradient-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md"
                    >
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
