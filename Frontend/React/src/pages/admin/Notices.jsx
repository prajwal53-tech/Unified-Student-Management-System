import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getNotices, createNotice, updateNotice, deleteNotice } from "../../services/apiServices";
import { useAuth } from "../../context/AuthContext";
import { Bell, Plus, Search, Pin, Calendar, Users, Edit, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function Notices() {
  const { user } = useAuth();
  const role = (user?.role || "student").toLowerCase();
  const isAdmin = role === "admin";
  const isFaculty = role === "faculty";
  const isStudent = role === "student";
  const canPostNotices = isAdmin || isFaculty;

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audience: "All",
    is_pinned: false,
    expiry_date: "",
  });

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const data = await getNotices();
      setNotices(data.results || data || []);
    } catch (err) {
      console.error("Error loading notices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingNotice(null);
    setFormData({
      title: "",
      description: "",
      audience: "All",
      is_pinned: false,
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      audience: notice.audience || "All",
      is_pinned: notice.is_pinned || false,
      expiry_date: notice.expiry_date || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await updateNotice(editingNotice.id, formData);
      } else {
        await createNotice(formData);
      }
      setShowModal(false);
      loadNotices();
    } catch (err) {
      console.error(err);
      alert("Failed to save notice announcement.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await deleteNotice(id);
        loadNotices();
      } catch (err) {
        console.error(err);
        alert("Failed to delete notice.");
      }
    }
  };

  const handleTogglePin = async (notice) => {
    try {
      await updateNotice(notice.id, { is_pinned: !notice.is_pinned });
      loadNotices();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotices = notices.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase());
    const matchAudience = audienceFilter === "All" || n.audience === audienceFilter || n.audience === "All";
    return matchSearch && matchAudience;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="text-amber-500" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">
                {isStudent ? "Campus Notices & Bulletins" : "Notices & Circulars Management"}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isStudent
                ? "Official university notices, exam updates, and academic announcements"
                : "Publish university-wide announcements, exam notifications, and campus news"}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search notices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {canPostNotices && (
              <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-600/20">
                <Plus size={16} /> Post Notice
              </Button>
            )}
          </div>
        </div>

        {/* Audience Filter Badges */}
        <div className="flex gap-2">
          {["All", "Students", "Faculty"].map((aud) => (
            <button
              key={aud}
              onClick={() => setAudienceFilter(aud)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition ${
                audienceFilter === aud
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Audience: {aud}
            </button>
          ))}
        </div>

        {/* Notice Cards List */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse bg-white rounded-xl border">
            Loading Notices...
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border">No notices found matching filters.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotices.map((notice) => {
              const isAuthorOrAdmin = isAdmin || (notice.posted_by_name === user?.username);
              const canEditNotice = canPostNotices && isAuthorOrAdmin;

              return (
                <div
                  key={notice.id}
                  className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between transition-all ${
                    notice.is_pinned ? "border-amber-400 bg-amber-50/20" : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {notice.is_pinned && <Pin size={18} className="text-amber-500 fill-amber-500 rotate-45" />}
                        <h3 className="font-bold text-slate-800 text-base leading-snug">{notice.title}</h3>
                      </div>
                      <Badge
                        className={
                          notice.audience === "Students"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : notice.audience === "Faculty"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }
                      >
                        {notice.audience}
                      </Badge>
                    </div>

                    <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed mb-4">{notice.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 font-medium text-slate-500">
                        <User size={13} /> {notice.posted_by_name || "Administration"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} /> {new Date(notice.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {canEditNotice && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-amber-600"
                          onClick={() => handleTogglePin(notice)}
                          title="Toggle Pin"
                        >
                          <Pin size={16} className={notice.is_pinned ? "fill-amber-500 text-amber-500" : ""} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-blue-600"
                          onClick={() => handleOpenEdit(notice)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-rose-600"
                          onClick={() => handleDelete(notice.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post / Edit Notice Modal */}
      {showModal && canPostNotices && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
              {editingNotice ? "Edit Notice Announcement" : "Post New Notice"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notice Title</label>
                <Input
                  required
                  placeholder="e.g. End Semester Examination Schedule 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Content</label>
                <textarea
                  required
                  rows="4"
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Write complete notice description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Audience</label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  >
                    <option value="All">All (Students & Faculty)</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry Date</label>
                  <Input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                />
                <label htmlFor="pinCheck" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Pin to top of Dashboard and Notices List
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Publish Notice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Notices;