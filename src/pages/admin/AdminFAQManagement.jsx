import { useState, useEffect, useCallback } from 'react';
import { faqAPI } from '../../api/faq.api';
import toast from 'react-hot-toast';
import {
    HiOutlineMagnifyingGlass,
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineXMark,
    HiOutlineCheckCircle,
    HiOutlineArrowPath,
    HiOutlineQuestionMarkCircle,
    HiOutlineChatBubbleLeftRight,
    HiOutlineChevronLeft,
    HiOutlineChevronRight
} from 'react-icons/hi2';

const AdminFAQManagement = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [viewingFaq, setViewingFaq] = useState(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        status: 'active'
    });
    const [formLoading, setFormLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchFaqs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await faqAPI.getAllFAQs();
            if (res.data.success) {
                setFaqs(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const handleOpenModal = (faq = null) => {
        if (faq) {
            setEditingFaq(faq);
            setFormData({
                question: faq.question,
                answer: faq.answer,
                status: faq.status
            });
        } else {
            setEditingFaq(null);
            setFormData({
                question: '',
                answer: '',
                status: 'active'
            });
        }
        setShowModal(true);
    };

    const handleOpenViewModal = (faq) => {
        setViewingFaq(faq);
        setShowViewModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.question.trim() || !formData.answer.trim()) {
            return toast.error('Both question and answer are required');
        }

        setFormLoading(true);
        try {
            if (editingFaq) {
                await faqAPI.updateFAQ(editingFaq._id, formData);
                toast.success('FAQ updated successfully');
            } else {
                await faqAPI.createFAQ(formData);
                toast.success('FAQ created successfully');
            }
            setShowModal(false);
            fetchFaqs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save FAQ');
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleStatus = async (faq) => {
        const newStatus = faq.status === 'active' ? 'inactive' : 'active';
        try {
            await faqAPI.updateFAQ(faq._id, { status: newStatus });
            toast.success(`FAQ ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
            fetchFaqs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
        try {
            await faqAPI.deleteFAQ(id);
            toast.success('FAQ deleted successfully');
            fetchFaqs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete FAQ');
        }
    };

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch =
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || faq.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
    const paginatedFaqs = filteredFaqs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const activeCount = faqs.filter((f) => f.status === 'active').length;
    const inactiveCount = faqs.filter((f) => f.status !== 'active').length;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black tracking-tight">FAQ Management</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Manage frequently asked questions for candidates</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#5b4eff] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-[#5b4eff]/20 active:scale-95"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    Add FAQ
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="card p-5 rounded-3xl border-none ring-1 ring-slate-100 bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                            <HiOutlineQuestionMarkCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-black leading-none">
                                {faqs.length}
                            </p>
                            <p className="text-xs text-slate-700 font-bold mt-1 uppercase tracking-wider">Total</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 rounded-3xl border-none ring-1 ring-slate-100 bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <HiOutlineCheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-black leading-none">{activeCount}</p>
                            <p className="text-xs text-slate-700 font-bold mt-1 uppercase tracking-wider">Active</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 rounded-3xl border-none ring-1 ring-slate-100 bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                            <HiOutlineXMark className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-black leading-none">{inactiveCount}</p>
                            <p className="text-xs text-slate-700/95 font-bold mt-1 uppercase tracking-wider">inactive</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-5 rounded-3xl border-none ring-1 ring-slate-100 bg-white">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/5 transition-all outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-600 focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/5 transition-all outline-none appearance-none cursor-pointer min-w-[150px]"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                    >
                        <HiOutlineArrowPath className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card rounded-3xl border-none ring-1 ring-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">Question</th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest hidden md:table-cell">Answer Preview</th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest text-center">Status</th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest hidden lg:table-cell text-center">Created</th>
                                <th className="text-center px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4"><div className="w-3/4 h-4 bg-dark-100 rounded"></div></td>
                                        <td className="px-5 py-4 hidden md:table-cell"><div className="w-1/2 h-4 bg-dark-100 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="w-16 h-6 bg-dark-100 rounded-md"></div></td>
                                        <td className="px-5 py-4 hidden lg:table-cell"><div className="w-20 h-4 bg-dark-100 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="w-24 h-8 bg-dark-100 rounded-md ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredFaqs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center text-dark-400 font-medium">No FAQs found</td>
                                </tr>
                            ) : (
                                paginatedFaqs.map((faq) => (
                                    <tr key={faq._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 max-w-xs transition-colors group">
                                            <p className="font-bold text-black line-clamp-2 group-hover:text-blue-600 transition-colors uppercase text-[13px] tracking-tight">{faq.question}</p>
                                        </td>
                                        <td className="px-6 py-5 hidden md:table-cell max-w-sm">
                                            <p className="text-black font-bold line-clamp-1 text-[12px] cursor-help" title={faq.answer}>{faq.answer}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(faq)}
                                                title={faq.status === 'active' ? 'Click to deactivate' : 'Click to activate'}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border ${faq.status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 shadow-sm shadow-emerald-50'
                                                    : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${faq.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                {faq.status === 'inactive' ? 'inactive' : faq.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 hidden lg:table-cell text-center">
                                            <p className="text-slate-700 font-bold text-[12px] uppercase tracking-tight">{formatDate(faq.createdAt)}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => handleOpenModal(faq)} className="text-slate-700 hover:text-blue-600 transition-all" title="Edit FAQ"><HiOutlinePencilSquare className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(faq._id)} className="text-slate-700 hover:text-red-600 transition-all" title="Delete FAQ"><HiOutlineTrash className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredFaqs.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-white">
                        <p className="text-[12px] font-medium text-slate-400/95">
                            Showing <span className="text-slate-900 font-bold">{Math.min(filteredFaqs.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="text-slate-900 font-bold">{Math.min(filteredFaqs.length, currentPage * itemsPerPage)}</span> of <span className="text-slate-900 font-bold">{filteredFaqs.length}</span> entries
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-100 text-slate-400/95 hover:text-[#5b4eff] hover:bg-slate-50 disabled:opacity-50 transition-all"
                            >
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1
                                        ? 'bg-[#5b4eff] text-white shadow-lg shadow-[#5b4eff]/20'
                                        : 'text-slate-400/95 hover:bg-slate-50 hover:text-slate-600 border border-transparent hover:border-slate-100'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-100 text-slate-400/95 hover:text-[#5b4eff] hover:bg-slate-50 disabled:opacity-50 transition-all"
                            >
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm shadow-2xl transition-all" onClick={() => !formLoading && setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-dark-50 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-dark-900">{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-dark-50 transition-colors"><HiOutlineXMark className="w-5 h-5 text-dark-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-dark-500 uppercase tracking-widest mb-1.5">Question *</label>
                                <textarea
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-dark-200 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                    rows="2"
                                    placeholder="Enter question"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-dark-500 uppercase tracking-widest mb-1.5">Answer *</label>
                                <textarea
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-dark-200 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                    rows="4"
                                    placeholder="Enter answer"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-dark-500 uppercase tracking-widest mb-1.5">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-dark-200 text-sm focus:border-primary-500 transition-all outline-none appearance-none bg-white cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-dark-200 text-sm font-bold text-dark-600 hover:bg-dark-50 transition-all">Cancel</button>
                                <button type="submit" disabled={formLoading} className="flex-1 py-3 gradient-primary text-white text-sm font-medium rounded-xl shadow-lg shadow-primary-500/20 disabled:opacity-70">
                                    {formLoading ? 'Saving...' : editingFaq ? 'Update FAQ' : 'Create FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && viewingFaq && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-dark-50 flex items-center justify-between bg-dark-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600"><HiOutlineQuestionMarkCircle className="w-6 h-6" /></div>
                                <h3 className="text-xl font-bold text-dark-900">FAQ Details</h3>
                            </div>
                            <button onClick={() => setShowViewModal(false)} className="p-2 rounded-xl hover:bg-white hover:shadow-lg transition-all"><HiOutlineXMark className="w-5 h-5 text-dark-400" /></button>
                        </div>
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-dark-400/95 uppercase tracking-widest flex items-center gap-2">
                                    <HiOutlineChatBubbleLeftRight className="w-3.5 h-3.5" />
                                    Question
                                </p>
                                <h4 className="text-xl font-medium text-dark-900 leading-snug">{viewingFaq.question}</h4>
                            </div>
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-dark-400/95 uppercase tracking-widest">Answer</p>
                                <div className="bg-dark-50/50 rounded-2xl p-6 border border-dark-100 shadow-inner">
                                    <p className="text-dark-600 text-base leading-relaxed whitespace-pre-wrap font-medium">{viewingFaq.answer}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-dark-50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-dark-400/95 uppercase tracking-widest">Status</p>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${viewingFaq.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                        {viewingFaq.status === 'inactive' ? 'inactive' : viewingFaq.status}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-dark-400/95 uppercase tracking-widest">Created Date</p>
                                    <p className="font-medium text-dark-700">{formatDate(viewingFaq.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 pt-0">
                            <button onClick={() => setShowViewModal(false)} className="w-full py-4 rounded-2xl bg-dark-900 text-white font-medium hover:bg-black transition-all shadow-xl shadow-dark-900/10">Close Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFAQManagement;
