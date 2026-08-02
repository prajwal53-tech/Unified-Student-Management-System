import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../services/auth";
import { User, Lock, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Profile() {
  const { user, updateUserState } = useAuth();
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const updated = await updateProfile(profileData);
      updateUserState(updated);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New passwords do not match!");
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(passwordData);
      alert("Password changed successfully!");
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to change password. Check old password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {(user?.username?.[0] || "A").toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{user?.username || "Admin User"}</h1>
            <p className="text-sm text-slate-500 capitalize">Role: {user?.role || "Administrator"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Edit Profile Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="text-blue-600" size={20} /> Personal Details
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
                <Input disabled value={profileData.username} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                  <Input
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                  <Input
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
              <Button type="submit" disabled={profileLoading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full">
                <Save size={16} /> {profileLoading ? "Saving..." : "Save Profile Details"}
              </Button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Lock className="text-blue-600" size={20} /> Security & Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password</label>
                <Input
                  type="password"
                  required
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
                <Input
                  type="password"
                  required
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password</label>
                <Input
                  type="password"
                  required
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={passwordLoading} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 w-full">
                <ShieldCheck size={16} /> {passwordLoading ? "Updating..." : "Change Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Profile;
