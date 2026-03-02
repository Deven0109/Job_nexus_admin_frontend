import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Country, State, City } from 'country-state-city';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
import {
    HiOutlineArrowLeft,
    HiOutlineBriefcase,
    HiOutlineMapPin,
    HiOutlineCurrencyRupee,
    HiOutlineUsers,
    HiOutlineClock,
    HiOutlineBolt,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlinePencilSquare,
    HiOutlineXMark,
    HiOutlineDocumentText,
    HiOutlineArrowPath,
} from 'react-icons/hi2';

const STATUS_COLORS = {
    pending: 'bg-warning-100 text-warning-800',
    approved: 'bg-success-100 text-success-800',
    rejected: 'bg-danger-100 text-danger-800',
    active: 'bg-primary-100 text-primary-800',
};

const URGENCY_COLORS = {
    Low: 'bg-slate-100 text-slate-600',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-red-100 text-red-700',
};

const CATEGORIES = [
    'Programming', 'Data Science', 'Designing', 'Networking', 'Management',
    'Marketing', 'Cybersecurity', 'Information Technology', 'Healthcare',
    'Finance & Banking', 'Education', 'Manufacturing', 'Sales', 'Human Resources',
    'Engineering', 'Design', 'Customer Service', 'Legal', 'Accounting',
    'Operations', 'Other',
];
const WORK_TYPES = ['Remote', 'Hybrid', 'Onsite'];
const URGENCY_LEVELS = ['Low', 'Medium', 'High'];

const AdminEditJobRequest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editMode = searchParams.get('edit') === 'true';

    const [jobRequest, setJobRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editData, setEditData] = useState({});
    const [skillInput, setSkillInput] = useState('');

    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await adminAPI.getJobRequestById(id);
                if (res.data.success && res.data.data) {
                    const req = res.data.data.jobRequest;
                    setJobRequest(req);
                    setIsEditing(editMode);
                    if (editMode) {
                        const allCountries = Country.getAllCountries();
                        const countryObj = allCountries.find(c => c.name === req.country);
                        const states = countryObj ? State.getStatesOfCountry(countryObj.isoCode) : [];
                        const stateObj = states.find(s => s.name === req.state);
                        const cities = (countryObj && stateObj) ? City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode) : [];

                        setStatesList(states);
                        setCitiesList(cities);
                        setEditData({
                            ...req,
                            countryCode: countryObj?.isoCode || '',
                            stateCode: stateObj?.isoCode || ''
                        });
                    }
                }
            } catch (error) {
                toast.error('Failed to load job request');
                navigate('/jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate, editMode]);

    const handleEdit = () => {
        const allCountries = Country.getAllCountries();
        const countryObj = allCountries.find(c => c.name === jobRequest.country);
        const states = countryObj ? State.getStatesOfCountry(countryObj.isoCode) : [];
        const stateObj = states.find(s => s.name === jobRequest.state);
        const cities = (countryObj && stateObj) ? City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode) : [];

        setStatesList(states);
        setCitiesList(cities);
        setEditData({
            ...jobRequest,
            countryCode: countryObj?.isoCode || '',
            stateCode: stateObj?.isoCode || ''
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setEditData({});
        setIsEditing(false);
        setSkillInput('');
    };

    const handleChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddSkill = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
            e.preventDefault();
            if (!editData.requiredSkills?.includes(skillInput.trim())) {
                setEditData(prev => ({ ...prev, requiredSkills: [...(prev.requiredSkills || []), skillInput.trim()] }));
            }
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (index) => {
        setEditData(prev => ({
            ...prev,
            requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        if (!editData.jobTitle?.trim()) return toast.error('Job title is required');
        if (!editData.jobCategory) return toast.error('Category is required');
        if (!editData.experienceRequired?.trim()) return toast.error('Experience is required');
        if (!editData.salaryMin) return toast.error('Minimum salary is required');
        if (!editData.salaryMax) return toast.error('Maximum salary is required');
        if (Number(editData.salaryMax) < Number(editData.salaryMin)) return toast.error('Max salary must be ≥ min salary');
        if (!editData.country) return toast.error('Country is required');
        if (!editData.state) return toast.error('State is required');
        if (!editData.city) return toast.error('City is required');
        if (!editData.requiredSkills || editData.requiredSkills.length === 0) return toast.error('At least one skill is required');
        if (!editData.jobDescription?.trim()) return toast.error('Description is required');

        setIsSaving(true);
        try {
            const res = await adminAPI.updateJobRequest(id, {
                jobTitle: editData.jobTitle,
                jobCategory: editData.jobCategory,
                numberOfVacancies: Number(editData.numberOfVacancies),
                experienceRequired: editData.experienceRequired,
                salaryMin: Number(editData.salaryMin),
                salaryMax: Number(editData.salaryMax),
                workType: editData.workType,
                country: editData.country,
                state: editData.state,
                city: editData.city,
                pincode: editData.pincode,
                requiredSkills: editData.requiredSkills,
                jobDescription: editData.jobDescription,
                urgency: editData.urgency,
            });
            if (res.data.success) {
                setJobRequest(res.data.data.jobRequest);
                setIsEditing(false);
                toast.success('Job request updated');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setIsSaving(false);
        }
    };

    const formatSalary = (n) => {
        if (n === null || n === undefined || isNaN(Number(n))) return '—';
        const num = Number(n);
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
        return `₹${num}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const inputCls = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none";

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="card p-8 animate-pulse">
                    <div className="h-8 w-64 bg-slate-200 rounded-xl mb-6"></div>
                    <div className="space-y-4">
                        {Array(6).fill().map((_, i) => (
                            <div key={i} className="h-12 bg-slate-100 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!jobRequest) return null;

    const data = isEditing ? editData : jobRequest;

    return (
        <div className="space-y-6">

            {/* Header / Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90" />

                <div className="relative px-8 py-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <button
                        onClick={() => navigate('/jobs')}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all border border-white/10 z-10"
                    >
                        <HiOutlineXMark className="w-5 h-5" />
                    </button>

                    <div className="flex items-start gap-5">
                        <button
                            onClick={() => navigate('/jobs')}
                            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10"
                        >
                            <HiOutlineArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[jobRequest.status]} ring-1 ring-white/20`}>
                                    {jobRequest.status}
                                </span>
                                {jobRequest.companyId?.companyName && (
                                    <span className="text-xs font-bold text-white/80">
                                        by {jobRequest.companyId.companyName}
                                    </span>
                                )}
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${URGENCY_COLORS[jobRequest.urgency]}`}>
                                    {jobRequest.urgency} Priority
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">{jobRequest.jobTitle}</h2>
                            <p className="text-blue-100 font-medium flex items-center gap-2">
                                <HiOutlineBriefcase className="w-4 h-4" />
                                {jobRequest.jobCategory}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isEditing && (
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 text-sm font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                <HiOutlinePencilSquare className="w-4 h-4" />
                                Edit Job
                            </button>
                        )}
                        {isEditing && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-6 py-3 bg-white/10 text-white text-sm font-bold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    <HiOutlineCheckCircle className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Category Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                        {isEditing ? (
                            <select value={data.jobCategory} onChange={e => handleChange('jobCategory', e.target.value)} className={`${inputCls} appearance-none cursor-pointer border-none bg-white`}>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        ) : (
                            <p className="text-sm font-black text-slate-900">{data.jobCategory}</p>
                        )}
                    </div>

                    {/* Vacancies Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vacancies</label>
                        {isEditing ? (
                            <input type="number" min="1" value={data.numberOfVacancies} onChange={e => handleChange('numberOfVacancies', e.target.value)} className={`${inputCls} border-none bg-white`} />
                        ) : (
                            <p className="text-sm font-black text-slate-900">{data.numberOfVacancies} positions</p>
                        )}
                    </div>

                    {/* Experience Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Experience</label>
                        {isEditing ? (
                            <input type="text" value={data.experienceRequired} onChange={e => handleChange('experienceRequired', e.target.value)} className={`${inputCls} border-none bg-white`} />
                        ) : (
                            <p className="text-sm font-black text-slate-900">{data.experienceRequired}</p>
                        )}
                    </div>

                    {/* Salary Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Salary Range</label>
                        {isEditing ? (
                            <div className="flex gap-3">
                                <input type="number" value={data.salaryMin} onChange={e => handleChange('salaryMin', e.target.value)} className={`${inputCls} border-none bg-white`} placeholder="Min" />
                                <input type="number" value={data.salaryMax} onChange={e => handleChange('salaryMax', e.target.value)} className={`${inputCls} border-none bg-white`} placeholder="Max" />
                            </div>
                        ) : (
                            <p className="text-sm font-black text-slate-900">{formatSalary(data.salaryMin)} – {formatSalary(data.salaryMax)}</p>
                        )}
                    </div>

                    {/* Work Type Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Work Type</label>
                        {isEditing ? (
                            <select value={data.workType} onChange={e => handleChange('workType', e.target.value)} className={`${inputCls} appearance-none cursor-pointer border-none bg-white`}>
                                {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        ) : (
                            <p className="text-sm font-black text-slate-900">{data.workType}</p>
                        )}
                    </div>

                    {/* Location Box */}
                    <div className="md:col-span-2 p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Location Details</label>
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Country</label>
                                    <select
                                        value={editData.countryCode}
                                        onChange={(e) => {
                                            const code = e.target.value;
                                            const name = e.target.options[e.target.selectedIndex].text;
                                            setEditData(p => ({ ...p, countryCode: code, country: name, stateCode: '', state: '', city: '' }));
                                            setStatesList(State.getStatesOfCountry(code));
                                            setCitiesList([]);
                                        }}
                                        className={`${inputCls} appearance-none cursor-pointer border-none bg-white text-xs`}
                                    >
                                        <option value="">Select Country</option>
                                        {Country.getAllCountries().map(c => (
                                            <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">State</label>
                                    <select
                                        value={editData.stateCode}
                                        onChange={(e) => {
                                            const code = e.target.value;
                                            const name = e.target.options[e.target.selectedIndex].text;
                                            setEditData(p => ({ ...p, stateCode: code, state: name, city: '' }));
                                            setCitiesList(City.getCitiesOfState(editData.countryCode, code));
                                        }}
                                        className={`${inputCls} appearance-none cursor-pointer border-none bg-white text-xs`}
                                        disabled={!editData.countryCode}
                                    >
                                        <option value="">Select State</option>
                                        {statesList.map(s => (
                                            <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">City</label>
                                    <select
                                        value={editData.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        className={`${inputCls} appearance-none cursor-pointer border-none bg-white text-xs`}
                                        disabled={!editData.stateCode}
                                    >
                                        <option value="">Select City</option>
                                        {citiesList.map(c => (
                                            <option key={c.name} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        value={editData.pincode || ''}
                                        onChange={e => handleChange('pincode', e.target.value)}
                                        className={`${inputCls} border-none bg-white text-xs`}
                                        placeholder="Pincode"
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                {[data.city, data.state, data.country].filter(Boolean).join(', ')}
                                {data.pincode ? ` - ${data.pincode}` : ''}
                            </p>
                        )}
                    </div>

                    {/* Urgency Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Urgency</label>
                        {isEditing ? (
                            <select value={data.urgency} onChange={e => handleChange('urgency', e.target.value)} className={`${inputCls} appearance-none cursor-pointer border-none bg-white`}>
                                {URGENCY_LEVELS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        ) : (
                            <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black md:text-[10px] uppercase tracking-wider ${URGENCY_COLORS[data.urgency]}`}>
                                {data.urgency}
                            </span>
                        )}
                    </div>

                    {/* Submitted Box */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Submitted</label>
                        <p className="text-sm font-black text-slate-900 uppercase">{formatDate(jobRequest.createdAt)}</p>
                    </div>

                    {/* Skills */}
                    <div className="md:col-span-2 pt-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Required Skills</label>
                        {isEditing ? (
                            <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl">
                                <div className="flex flex-wrap gap-2 min-h-[56px] items-center">
                                    {data.requiredSkills?.map((skill, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-primary-700 font-bold text-xs rounded-xl border border-slate-200">
                                            {skill}
                                            <button type="button" onClick={() => handleRemoveSkill(i)} className="hover:text-red-500">
                                                <HiOutlineXMark className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={e => setSkillInput(e.target.value)}
                                        onKeyDown={handleAddSkill}
                                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-1 font-bold placeholder:text-slate-300"
                                        placeholder="Add skill..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {data.requiredSkills?.map((skill, i) => (
                                    <span key={i} className="px-5 py-2.5 bg-indigo-50/30 border border-indigo-100/50 text-indigo-600 font-black text-xs rounded-2xl shadow-sm tracking-tight transition-all hover:bg-indigo-50">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 pt-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Job Description</label>
                        {isEditing ? (
                            <textarea
                                value={data.jobDescription}
                                onChange={e => handleChange('jobDescription', e.target.value)}
                                rows="5"
                                maxLength={5000}
                                className={`${inputCls} resize-none leading-relaxed bg-white border border-slate-200 p-5 rounded-[24px]`}
                                placeholder="Enter full job details..."
                            />
                        ) : (
                            <div className="p-8 bg-slate-50/30 rounded-3xl border border-slate-100/50 min-h-[160px]">
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-bold">{data.jobDescription}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-10 bg-white border-t border-slate-50 flex items-center justify-center">
                    <button
                        onClick={() => navigate('/jobs')}
                        className="w-full max-w-md px-10 py-4 border-2 border-slate-100 text-slate-900 text-sm font-black rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminEditJobRequest;
