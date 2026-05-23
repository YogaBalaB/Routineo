import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Mail,
  Shield,
  Bell,
  Palette,
  Globe,
  Trash2,
  Camera,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  LogOut,
  Check,
  Download,
  AlertTriangle,
  ChevronRight,
  Monitor,
  Moon,
  Sun,
  Laptop
} from "lucide-react";
import { User } from "../types";
import { cn } from "../lib/utils";
import PrimaryButton from "../components/PrimaryButton";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  user: User;
}

type TabType = "account" | "email" | "security" | "notifications" | "appearance" | "language" | "danger";

export default function ProfilePage({ user }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("account");

  const tabs = [
    { id: "account", label: "Account Info", icon: UserIcon },
    { id: "email", label: "Email Address", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "language", label: "Language & Region", icon: Globe },
    { id: "danger", label: "Danger Zone", icon: Trash2, danger: true },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] -mx-4 sm:-mx-6 md:-mx-8 -my-8 px-6 py-10">
      <div className="max-w-[1100px] mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">Settings</h1>
          <p className="text-sm text-[#6B7280]">Manage your account and preferences</p>
          <div className="h-px bg-[#E5E7EB] w-full mt-6" />
        </header>

        <div className="flex flex-col md:flex-row gap-7 items-start">
          {/* Sidebar */}
          <aside className="w-full md:w-[240px] flex-shrink-0">
            <nav className="flex md:flex-col overflow-x-auto md:overflow-visible no-scrollbar bg-white rounded-xl border border-[#E5E7EB] p-2 shadow-sm">
              {tabs.map((tab, idx) => (
                <React.Fragment key={tab.id}>
                  {tab.danger && <div className="h-px bg-[#F3F4F6] mx-2 my-1 hidden md:block" />}
                  <button
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={cn(
                      "flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap md:w-full",
                      activeTab === tab.id
                        ? "bg-[#F3F0FF] text-[#7C3AED]"
                        : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                    )}
                  >
                    <tab.icon size={16} className={cn(activeTab === tab.id ? "text-[#7C3AED]" : "text-[#9CA3AF]")} />
                    <span>{tab.label}</span>
                  </button>
                </React.Fragment>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0 w-full">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <TabContent activeTab={activeTab} user={user} />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function TabContent({ activeTab, user }: {
  activeTab: TabType;
  user: User;
}) {
  switch (activeTab) {
    case "account": return <AccountSection user={user} />;
    case "email": return <EmailSection user={user} />;
    case "security": return <SecuritySection />;
    case "notifications": return <NotificationsSection />;
    case "appearance": return <AppearanceSection />;
    case "language": return <LanguageSection />;
    case "danger": return <DangerSection />;
    default: return null;
  }
}

// --- Sections ---

function AccountSection({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.name.toLowerCase().replace(" ", "_"));
  const [bio, setBio] = useState("Routineo enthusiast. Level 5 Focus Seeker.");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!name.trim()) return;
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClasses = "w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/8 outline-none transition-all placeholder:text-[#9CA3AF]";

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Account Info"
        description="Update your photo and personal details here."
      />

      <div className="flex flex-col gap-8">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#EDE9FE] flex items-center justify-center overflow-hidden border border-[#E5E7EB] relative">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#7C3AED]">{name.charAt(0)}</span>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 border border-[#E5E7EB] rounded-lg text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              <Camera size={14} />
              Change Photo
            </button>
            <p className="text-xs text-[#6B7280]">JPG, PNG up to 2MB</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Full Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Your full name"
            />
          </FormGroup>
          <FormGroup label="Username">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={cn(inputClasses, "pl-8")}
                placeholder="username"
              />
            </div>
          </FormGroup>
          <div className="md:col-span-2">
            <FormGroup label="Bio">
              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  rows={3}
                  className={cn(inputClasses, "resize-none pr-14")}
                  placeholder="Tell us about yourself..."
                />
                <span className="absolute right-3.5 bottom-2.5 text-[10px] text-[#9CA3AF] font-medium uppercase">
                  {bio.length}/160
                </span>
              </div>
            </FormGroup>
          </div>
          <div className="md:col-span-2">
            <FormGroup label="Joined Date">
              <input
                value="May 12, 2024"
                readOnly
                className={cn(inputClasses, "bg-[#F9FAFB] text-[#9CA3AF] cursor-not-allowed")}
              />
            </FormGroup>
          </div>
        </div>

        <SaveRow onSave={handleSave} isSaved={isSaved} />
      </div>
    </div>
  );
}

function EmailSection({ user }: { user: User }) {
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");
    return `${name.slice(0, 2)}**@${domain}`;
  };

  const handleSendVerification = () => {
    if (!newEmail.trim() || !password.trim()) return;
    setEmailSent(true);
  };

  const inputClasses = "w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/8 outline-none transition-all placeholder:text-[#9CA3AF]";

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Email Address"
        description="Choose the email address you use to sign in and receive notifications."
      />

      <div className="bg-[#F9FAFB] p-5 rounded-lg flex items-center justify-between border border-[#E5E7EB]">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB] text-[#6B7280]">
            <Lock size={18} />
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider mb-0.5">Current Email</p>
            <p className="text-sm font-semibold text-[#111827]">{maskEmail(user.email)}</p>
          </div>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
          >
            Change Email
          </button>
        )}
      </div>

      {showForm && !emailSent && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-6 pt-6 border-t border-[#F3F4F6]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="New Email Address">
              <input
                type="email"
                placeholder="example@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={inputClasses}
              />
            </FormGroup>
            <FormGroup label="Current Password">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
              />
            </FormGroup>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm font-semibold text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">Cancel</button>
            <PrimaryButton label="Send Verification" onClick={handleSendVerification} className="bg-[#7C3AED] px-6" />
          </div>
        </motion.div>
      )}

      {emailSent && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-100 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <Check size={14} />
          </div>
          <p className="text-sm font-medium">Verification email sent ✓</p>
        </div>
      )}
    </div>
  );
}

function SecuritySection() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, device: "Chrome / Windows", location: "TamilNadu, India", date: "Now", current: true },
    { id: 2, device: "Safari / iPhone 13", location: "Mumbai, India", date: "2 hours ago" },
    { id: 3, device: "Firefox / macOS", location: "Bangalore, India", date: "Oct 12, 2024" },
  ]);

  const handleUpdatePassword = () => {
    if (!currentPw || !newPw || !confirmPw) {
      setPwError("All fields are required");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match");
      return;
    }
    if (newPw.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    setPwError("");
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 3000);
  };

  const passwordStrength = () => {
    if (newPw.length === 0) return { label: "", color: "bg-[#E5E7EB]", width: "0%" };
    if (newPw.length < 6) return { label: "Weak", color: "bg-red-500", width: "25%" };
    if (newPw.length < 10) return { label: "Medium", color: "bg-amber-500", width: "66%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };

  const strength = passwordStrength();
  const inputClasses = "w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/8 outline-none transition-all placeholder:text-[#9CA3AF]";

  return (
    <div className="space-y-12">
      <section>
        <SectionHeader
          title="Change Password"
          description="Update your password to keep your account secure."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <FormGroup label="Current Password">
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className={inputClasses}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormGroup>
          <div className="hidden md:block" />
          <FormGroup label="New Password">
            <input
              type="password"
              placeholder="Min 8 characters"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className={inputClasses}
            />
            {newPw && (
              <div className="mt-3 space-y-2">
                <div className="h-1.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden flex gap-1">
                  <div className={cn("h-full transition-all duration-500 rounded-full", newPw.length > 0 ? strength.color : "bg-[#E5E7EB]")} style={{ width: strength.width }} />
                </div>
                <div className="flex justify-between items-center text-[11px] font-semibold uppercase tracking-wider">
                  <span className="text-[#9CA3AF]">Strength: {strength.label}</span>
                </div>
              </div>
            )}
          </FormGroup>
          <FormGroup label="Confirm New Password">
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className={inputClasses}
            />
          </FormGroup>
        </div>
        <div className="mt-7 flex flex-col items-start gap-4">
          <div className="flex items-center gap-4">
            <PrimaryButton label="Update Password" onClick={handleUpdatePassword} className="bg-[#7C3AED] px-7" />
            {pwSaved && <p className="text-sm font-semibold text-green-600">Password updated ✓</p>}
          </div>
          {pwError && <p className="text-sm font-semibold text-red-500">{pwError}</p>}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account by requiring more than just a password to log in."
        />
        <div className="flex items-center justify-between py-4 bg-[#F9FAFB] px-5 rounded-lg border border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">Authenticator App</p>
              <p className="text-xs text-[#6B7280]">Use an app like Google Authenticator or Authy.</p>
            </div>
          </div>
          <Switch enabled={twoFA} onChange={setTwoFA} />
        </div>

        {twoFA && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-white rounded-lg border border-[#E5E7EB] flex flex-col md:flex-row items-center gap-8">
            <div className="w-36 h-36 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg flex items-center justify-center p-3">
              {/* Mock QR Code */}
              <div className="w-full h-full border-2 border-dashed border-[#D1D5DB] rounded-md flex flex-col items-center justify-center gap-1.5 text-[#9CA3AF]">
                <Check size={20} className="text-[#D1D5DB]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">QR Code</span>
              </div>
            </div>
            <div className="space-y-4 max-w-sm">
              <p className="text-sm font-semibold text-[#111827]">Scan with your authenticator app</p>
              <p className="text-xs text-[#6B7280] leading-relaxed">Scan the QR code above or enter the secret code into your authenticator app to enable 2FA.</p>
              <div className="flex gap-3">
                <input placeholder="000000" className="w-full px-3.5 py-2 rounded-lg border border-[#E5E7EB] outline-none text-sm text-center font-bold tracking-[0.2em]" />
                <button className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-semibold">Verify</button>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      <section>
        <SectionHeader
          title="Active Sessions"
          description="Manage the devices where you are currently logged in to Routineo."
        />
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border border-[#E5E7EB] bg-white">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#6B7280]">
                  {session.device.includes("iPhone") ? <Smartphone size={18} /> : <Monitor size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#111827]">{session.device}</p>
                    {session.current && <span className="text-[10px] px-2 py-0.5 bg-[#F3F0FF] text-[#7C3AED] rounded-full font-semibold border border-[#E9D5FF]">This Device</span>}
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">{session.location} • {session.date}</p>
                </div>
              </div>
              {!session.current && (
                <button
                  type="button"
                  onClick={() => setSessions(prev => prev.filter(s => s.id !== session.id))}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    taskDue: true,
    habitStreak: true,
    dailyFocus: false,
    weeklyReport: true,
    badgeEarned: true,
    friendActivity: false,
    email: true,
    push: true
  });
  const [time, setTime] = useState("08:00");
  const [notifSaved, setNotifSaved] = useState(false);

  const togglePref = (key: keyof typeof prefs) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  const inputClasses = "w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/8 outline-none transition-all";

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Notifications"
        description="Configure how and when you want to be notified."
      />

      <div className="space-y-10">
        <div>
          <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4 block">Study Reminders</label>
          <div className="divide-y divide-[#F3F4F6]">
            <SettingToggle label="Task Due Reminders" active={prefs.taskDue} onToggle={() => togglePref("taskDue")} />
            <SettingToggle label="Habit Streak Alerts" active={prefs.habitStreak} onToggle={() => togglePref("habitStreak")} />
            <SettingToggle label="Daily Focus Reminder" active={prefs.dailyFocus} onToggle={() => togglePref("dailyFocus")} />
          </div>
          <div className="mt-6 md:w-1/2">
            <FormGroup label="Focus reminder time">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={cn(inputClasses, "font-semibold")}
              />
            </FormGroup>
          </div>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4 block">Account Activity</label>
          <div className="divide-y divide-[#F3F4F6]">
            <SettingToggle label="Weekly Progress Report" active={prefs.weeklyReport} onToggle={() => togglePref("weeklyReport")} />
            <SettingToggle label="Badge Earned Alerts" active={prefs.badgeEarned} onToggle={() => togglePref("badgeEarned")} />
            <SettingToggle label="Friend Activity" active={prefs.friendActivity} onToggle={() => togglePref("friendActivity")} />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4 block">Channels</label>
          <div className="divide-y divide-[#F3F4F6]">
            <SettingToggle label="Email Notifications" active={prefs.email} onToggle={() => togglePref("email")} />
            <SettingToggle label="Browser Push Notifications" active={prefs.push} onToggle={() => togglePref("push")} />
          </div>
        </div>
      </div>

      <SaveRow onSave={handleSave} isSaved={notifSaved} />
    </div>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [accentColor, setAccentColor] = useState("#7C3AED");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [compact, setCompact] = useState(false);
  const [appearSaved, setAppearSaved] = useState(false);

  const accents = [
    { name: "Purple", color: "#7C3AED" },
    { name: "Blue", color: "#3B82F6" },
    { name: "Green", color: "#10B981" },
    { name: "Orange", color: "#F59E0B" },
    { name: "Pink", color: "#EC4899" },
    { name: "Red", color: "#EF4444" },
  ];

  const handleSave = () => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    setAppearSaved(true);
    setTimeout(() => setAppearSaved(false), 3000);
  };

  const themeOptions = [
    { id: "light", label: "Light", icon: Sun, bg: "bg-white" },
    { id: "dark", label: "Dark", icon: Moon, bg: "bg-slate-900" },
    { id: "system", label: "System", icon: Laptop, bg: "bg-slate-100" }
  ];

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Appearance"
        description="Customize the look and feel of your workspace."
      />

      <div className="space-y-5">
        <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Themes</label>
        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id as any)}
              className={cn(
                "group relative flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:border-[#7C3AED]/30",
                theme === opt.id ? "border-[#7C3AED] bg-[#F3F0FF]" : "border-[#E5E7EB] bg-white"
              )}
            >
              <div className={cn("w-full aspect-[4/3] rounded-lg mb-3 flex items-center justify-center border border-[#E5E7EB] transition-colors", opt.bg)}>
                <opt.icon size={20} className={theme === opt.id ? "text-[#7C3AED]" : "text-[#9CA3AF]"} />
              </div>
              <span className={cn("text-xs font-semibold", theme === opt.id ? "text-[#7C3AED]" : "text-[#6B7280]")}>
                {opt.label}
              </span>
              {theme === opt.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#7C3AED] rounded-full flex items-center justify-center border-2 border-white">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Accent Color</label>
        <div className="flex flex-wrap gap-3.5">
          {accents.map((a) => (
            <button
              key={a.name}
              type="button"
              onClick={() => setAccentColor(a.color)}
              className={cn(
                "w-7 h-7 rounded-full transition-all hover:scale-110 relative",
                accentColor === a.color ? "ring-2 ring-offset-2 ring-[#7C3AED]" : ""
              )}
              style={{ backgroundColor: a.color }}
            >
              {accentColor === a.color && (
                <Check size={12} className="text-white absolute inset-0 m-auto" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Interface</label>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 text-left">
              <p className="text-sm font-medium text-[#111827]">Font Size</p>
              <p className="text-xs text-[#6B7280]">Adjust the legibility of text content.</p>
            </div>
            <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
              {["small", "medium", "large"].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size as any)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-semibold transition-all capitalize",
                    fontSize === size ? "bg-white text-[#111827] shadow-sm" : "text-[#9CA3AF] hover:text-[#6B7280]"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#F3F4F6] w-full" />

          <SettingToggle
            label="Compact Mode"
            active={compact}
            onToggle={() => setCompact(!compact)}
            description="Reduces spacing between elements."
          />
        </div>
      </div>

      <SaveRow onSave={handleSave} isSaved={appearSaved} />
    </div>
  );
}

function LanguageSection() {
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState("12"); // "12" or "24"
  const [weekStart, setWeekStart] = useState("Monday");
  const [langSaved, setLangSaved] = useState(false);

  const languages = [
    { code: "en", name: "English (UK)", flag: "🇬🇧" },
    { code: "hi", name: "Hindi (हिन्दी)", flag: "🇮🇳" },
    { code: "ta", name: "Tamil (தமிழ்)", flag: "🇮🇳" },
    { code: "es", name: "Spanish (Español)", flag: "🇪🇸" },
    { code: "fr", name: "French (Français)", flag: "🇫🇷" },
    { code: "de", name: "German (Deutsch)", flag: "🇩🇪" },
    { code: "ja", name: "Japanese (日本語)", flag: "🇯🇵" },
  ];

  const handleSave = () => {
    setLangSaved(true);
    setTimeout(() => setLangSaved(false), 3000);
  };

  const inputClasses = "w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/8 outline-none transition-all placeholder:text-[#9CA3AF] appearance-none";

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Language & Region"
        description="Update your language preference and regional formatting."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <FormGroup label="Interface Language">
            <div className="relative group">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={inputClasses}
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                ))}
              </select>
              <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] rotate-90 pointer-events-none" />
            </div>
          </FormGroup>
        </div>

        <FormGroup label="Date Format">
          <div className="relative">
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className={inputClasses}
            >
              {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
            <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] rotate-90 pointer-events-none" />
          </div>
        </FormGroup>

        <FormGroup label="Timezone">
          <div className="relative">
            <select className={inputClasses} defaultValue="GMT+05:30">
              <option>GMT+05:30 (India Standard Time)</option>
              <option>GMT+00:00 (UTC)</option>
              <option>GMT-05:00 (EST)</option>
            </select>
            <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] rotate-90 pointer-events-none" />
          </div>
        </FormGroup>

        <div className="md:col-span-2 space-y-4 pt-4">
          <div className="h-px bg-[#F3F4F6] w-full" />
          <SettingToggle label="24-Hour Time Format" active={timeFormat === "24"} onToggle={() => setTimeFormat(timeFormat === "12" ? "24" : "12")} />
          <SettingToggle label="Week Starts on Monday" active={weekStart === "Monday"} onToggle={() => setWeekStart(weekStart === "Sunday" ? "Monday" : "Sunday")} />
        </div>
      </div>

      <SaveRow onSave={handleSave} isSaved={langSaved} />
    </div>
  );
}

function DangerSection() {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 2000);
  };

  const handleConfirmDelete = () => {
    setIsDeleted(true);
    setShowConfirm(false);
    setDeleteConfirmation("");
  };

  if (isDeleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6">
          <Trash2 size={40} />
        </div>
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-[#111827]">Account Deleted</h2>
          <p className="text-[#6B7280]">Your account has been permanently removed from Routineo.</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-[#111827] text-white font-semibold rounded-lg hover:bg-black transition-all"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Danger Zone"
        description="Permanently delete your account and all of your data. This action is not reversible."
      />

      <div className="rounded-xl border border-[#FECACA] bg-[#FFF5F5] overflow-hidden">
        <div className="p-6 divide-y divide-[#FEE2E2]">
          <div className="pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#111827]">Export Account Data</p>
              <p className="text-xs text-[#6B7280]">Get a copy of your tasks, habits and focus history in JSON format.</p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className={cn(
                "px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-all flex items-center justify-center gap-2",
                exporting && "opacity-50 cursor-not-allowed"
              )}
            >
              {exporting ? "Preparing..." : downloaded ? "Downloaded ✓" : <><Download size={16} /> Export Data</>}
            </button>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-600">Delete Account</p>
              <p className="text-xs text-[#6B7280]">Permanently remove your account and all associated data.</p>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 rounded-lg border border-red-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-all underline decoration-red-200 underline-offset-4"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="fixed inset-0 bg-[#111827]/40 backdrop-blur-[2px] z-[999]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl p-8 shadow-2xl z-[1000] border border-[#E5E7EB]"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#111827]">Are you absolutely sure?</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </p>
                </div>
                <div className="w-full space-y-3">
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                    Type <span className="text-[#111827] select-all">DELETE</span> to confirm
                  </p>
                  <input
                    autoFocus
                    placeholder="Type DELETE"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:border-red-500 focus:ring-4 focus:ring-red-500/5 outline-none text-sm font-semibold text-center"
                  />
                </div>
                <div className="flex flex-col w-full gap-3">
                  <button
                    disabled={deleteConfirmation !== "DELETE"}
                    onClick={handleConfirmDelete}
                    className={cn(
                      "w-full py-2.5 rounded-lg text-sm font-semibold transition-all",
                      deleteConfirmation === "DELETE" ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/10" : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
                    )}
                  >
                    Delete Forever
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="w-full py-2 text-[#6B7280] text-xs font-semibold hover:text-[#111827] transition-colors"
                  >
                    Keep Account
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Reusable Components ---

function SectionHeader({ title, description }: { title: string, description?: string }) {
  return (
    <header className="mb-6">
      <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
      {description && <p className="text-[13px] text-[#6B7280] mt-1">{description}</p>}
      <div className="h-px bg-[#F3F4F6] w-full mt-4" />
    </header>
  );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function SettingToggle({ label, active, onToggle, description }: {
  label: string,
  active: boolean,
  onToggle: () => void,
  description?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-bottom border-[#F3F4F6] last:border-0">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-[#111827]">{label}</p>
        {description && <p className="text-xs text-[#6B7280]">{description}</p>}
      </div>
      <Switch enabled={active} onChange={onToggle} />
    </div>
  );
}

function Switch({ enabled, onChange }: { enabled: boolean, onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      type="button"
      className={cn(
        "relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
        enabled ? "bg-[#7C3AED]" : "bg-[#D1D5DB]"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          enabled ? "translate-x-[18px]" : "translate-x-0"
        )}
      />
    </button>
  );
}

function SaveRow({ onSave, isSaved, onCancel }: { onSave: () => void, isSaved: boolean, onCancel?: () => void }) {
  return (
    <div className="mt-7 pt-5 border-t border-[#F3F4F6] flex items-center justify-end gap-3">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          Cancel
        </button>
      )}
      <div className="flex items-center gap-3">
        {isSaved && <p className="text-xs font-bold text-green-600">Saved ✓</p>}
        <PrimaryButton
          label="Save"
          onClick={onSave}
          className="bg-[#7C3AED] px-7 py-2.5 rounded-lg text-sm font-medium"
        />
      </div>
    </div>
  );
}
