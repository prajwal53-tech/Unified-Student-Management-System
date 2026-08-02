import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { Settings as SettingsIcon, Database, Shield, Bell, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function Settings() {
  const [universityName, setUniversityName] = useState("University Student Management System");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [gradingSystem, setGradingSystem] = useState("10-Point CGPA");

  const handleSave = (e) => {
    e.preventDefault();
    alert("ERP System Settings updated successfully!");
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <SettingsIcon className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">ERP System Settings</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">Configure global university parameters, database, and authentication</p>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">System Healthy</Badge>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
              <Server size={18} className="text-blue-600" /> General ERP Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">University / Institute Name</label>
                <Input value={universityName} onChange={(e) => setUniversityName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Active Academic Year</label>
                <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Evaluation & Grading Standard</label>
              <select
                className="w-full border rounded-md p-2 text-sm"
                value={gradingSystem}
                onChange={(e) => setGradingSystem(e.target.value)}
              >
                <option value="10-Point CGPA">10-Point CGPA Scale</option>
                <option value="4-Point GPA">4-Point GPA Scale</option>
                <option value="Percentage">Percentage System</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
              <Database size={18} className="text-blue-600" /> System Architecture & Engine
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-50 p-3 rounded-lg border">
                <span className="text-slate-500 text-xs block">Backend Engine</span>
                <span className="font-bold text-slate-800">Django 6.0 REST</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border">
                <span className="text-slate-500 text-xs block">Authentication</span>
                <span className="font-bold text-slate-800">SimpleJWT Bearer</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border">
                <span className="text-slate-500 text-xs block">Database</span>
                <span className="font-bold text-slate-800">SQLite3</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              Save ERP Configurations
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default Settings;
