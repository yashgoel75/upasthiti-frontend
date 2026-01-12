"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { auth } from "@/lib/firebase.admin";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Search, Bell, Camera } from "lucide-react";
import Footer from "@/components/footer/page";
import { useAuth } from "../../context/auth";
import { useTheme } from "../../context/theme";
import type { Admin } from "@/constants/interface";

interface School {
  name: string;
}

interface FacultyCounts {
  professor: number;
  professorOfPractice: number;
  associateProfessor: number;
  assistantProfessor: number;
}

interface BranchCounts {
  [key: string]: number;
}

interface CountsData {
  studentCount: number;
  facultyCounts: FacultyCounts;
  branchCounts: BranchCounts;
}

interface PrivacySettings {
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
  };
}

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const { user, setAdminData, adminData, schoolData, loading } = useAuth();
  const [counts, setCounts] = useState<CountsData>({
    studentCount: 0,
    facultyCounts: {
      professor: 0,
      professorOfPractice: 0,
      associateProfessor: 0,
      assistantProfessor: 0,
    },
    branchCounts: {},
  });
  const [currentTime, setCurrentTime] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const branches = ["CSE", "AIML", "AIDS", "VLSI", "IIOT", "CSAM", "CSE-CS"];

  const CACHE_INTERVAL = 50000;

  const [settings, setSettings] = useState<PrivacySettings>({
    privacy: {
      showEmail: true,
      showPhone: false,
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
    }
  }, []);

  const getCount = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/count`
      );
      const data = res.data;

      const branchCounts: BranchCounts = {};
      if (data.students?.byBranch) {
        Object.keys(data.students.byBranch).forEach((branch) => {
          branchCounts[branch] = data.students.byBranch[branch].count || 0;
        });
      }

      setCounts({
        studentCount: data.students?.total || 0,
        facultyCounts: {
          professor: data.faculty?.byType?.Professor?.count || 0,
          professorOfPractice:
            data.faculty?.byType?.ProfessorOfPractice?.count || 0,
          associateProfessor:
            data.faculty?.byType?.AssociateProfessor?.count || 0,
          assistantProfessor:
            data.faculty?.byType?.AssistantProfessor?.count || 0,
        },
        branchCounts,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    getCount();
  }, []);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingImage(true);
    try {
      const signRes = await fetch("/api/signprofilepicture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "profilepictures" }),
      });

      const { timestamp, signature, apiKey, folder } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await uploadRes.json();
      const imageUrl = data.secure_url;

      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/admin/update`,
        {
          uid: user.uid,
          updates: { profilePicture: imageUrl },
        }
      );

      setAdminData((prev: Admin) =>
        prev ? { ...prev, profilePicture: imageUrl } : prev
      );
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const facultyStats = [
    {
      count: counts.facultyCounts.professor,
      label: "Professor",
    },
    {
      count: counts.facultyCounts.professorOfPractice,
      label: "Professor of Practice",
    },
    {
      count: counts.facultyCounts.associateProfessor,
      label: "Associate Professor",
    },
    {
      count: counts.facultyCounts.assistantProfessor,
      label: "Assistant Professor",
    },
    { count: counts.studentCount, label: "Students" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              theme == "dark" ? "text-gray-500" : "text-gray-400"
            }`}
          />
          <input
            type="text"
            placeholder="Search your things"
            className={`w-full border-2 rounded-xl pl-12 pr-5 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors ${
              theme == "dark"
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <button
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
            theme == "dark"
              ? "border-gray-700 hover:bg-gray-800"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Bell
            className={`w-5 h-5 ${
              theme == "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Profile Section */}
      <section
        className={`rounded-3xl p-6 mb-8 shadow-sm border-2 transition-colors ${
          theme == "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative">
            <div className="relative w-28 h-28">
              {adminData?.profilePicture ? (
                <Image
                  src={adminData.profilePicture}
                  alt="Profile"
                  fill
                  className={`rounded-full object-cover border-2 ${
                    theme == "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-red-400 text-3xl font-semibold text-white">
                  {adminData?.name?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`absolute bottom-0 right-0 border-2 text-white p-2 rounded-full transition-colors ${
                theme == "dark"
                  ? "bg-red-600 border-gray-800"
                  : "bg-red-500 border-white"
              }`}
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureChange}
            />
          </div>

          <div className="text-center lg:text-left">
            {adminData ? (
              <>
                <h2
                  className={`text-3xl font-bold transition-colors ${
                    theme == "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {getGreeting()}, {adminData.name}
                </h2>
                <p
                  className={`transition-colors ${
                    theme == "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {schoolData.name}
                </p>
                <div
                  className={`flex flex-wrap gap-4 mt-3 text-sm transition-colors ${
                    theme == "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <p>
                    <b>Admin ID:</b> {adminData.adminId}
                  </p>
                  <p>
                    <b>Email:</b>{" "}
                    {settings.privacy.showEmail
                      ? adminData.officialEmail
                      : "•••••"}
                  </p>
                  <p>
                    <b>Phone:</b>{" "}
                    {settings.privacy.showPhone
                      ? adminData.phoneNumber
                      : "•••••"}
                  </p>
                </div>
              </>
            ) : (
              <div className="animate-pulse">
                <div
                  className={`h-8 rounded w-3/4 mx-auto lg:mx-0 mb-3 ${
                    theme == "dark" ? "bg-gray-700" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`h-4 rounded w-1/2 mx-auto lg:mx-0 mb-4 ${
                    theme == "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div className="flex flex-wrap gap-4 mt-3 justify-center lg:justify-start">
                  <div
                    className={`h-3 rounded w-32 ${
                      theme == "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-3 rounded w-40 ${
                      theme == "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-3 rounded w-28 ${
                      theme == "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6 text-center">
          {facultyStats.map((s, i) => (
            <div
              key={i}
              className={`rounded-xl p-5 border transition-colors ${
                theme == "dark"
                  ? "bg-gray-900/50 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <p
                className={`text-2xl font-bold transition-colors ${
                  theme == "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {s.count}
              </p>
              <p
                className={`text-sm mt-1 transition-colors ${
                  theme == "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Branch Section */}
      <section
        className={`rounded-3xl p-6 shadow-sm border-2 transition-colors ${
          theme == "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <h3
          className={`text-2xl font-bold mb-6 text-center transition-colors ${
            theme == "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Explore Branches
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {branches.map((branch) => (
            <div
              onClick={() => {
                router.push(`/admin/branch/${branch}`);
              }}
              key={branch}
              className={`rounded-xl p-6 border-2 hover:shadow-lg transition-all ${
                theme == "dark"
                  ? "bg-gray-900/50 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <p
                className={`text-lg font-bold transition-colors ${
                  theme == "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {branch}
              </p>
              <p
                className={`text-sm font-semibold mt-2 transition-colors ${
                  theme == "dark" ? "text-orange-400" : "text-orange-600"
                }`}
              >
                No. of Students: {counts.branchCounts[branch] || 0}
              </p>
              <button
                className={`mt-4 border-2 px-6 py-1.5 rounded-lg transition-all text-sm cursor-pointer ${
                  theme == "dark"
                    ? "border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                }`}
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
