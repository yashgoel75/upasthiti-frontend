"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useTheme } from "../../../context/theme";
import { useAuth } from "../../../context/auth";

import { Phone, Mail, IdCard, Building2, Landmark, School } from "lucide-react";
import Footer from "@/components/footer/page";
import axios from "axios";

import Link from "next/link";
import { branchMap } from "@/constants/branch";
import type { Student } from "@/constants/interface";

interface Settings {
  appearance: {
    theme: string;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
  };
}

export default function SingleStudent() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();

  const studentId = params.studentId as string;

  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const { schoolData } = useAuth();

  const fetchStudent = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/student?uid=${studentId}`
      );
      const json = await res.data;
      setStudentData(json.data[0]);
      console.log(json.data[0]);
    } catch (err) {
      console.error("Failed to fetch student:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  const [settings, setSettings] = useState<Settings>({
    appearance: {
      theme: "light",
    },
    privacy: {
      showEmail: true,
      showPhone: false,
    },
  });

  return (
    <div
      className={`min-h-screen p-2 md:p-8 transition-colors ${
        theme == "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold transition-colors ${
              theme == "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Student Details
          </h1>
          <p
            className={`mt-1 transition-colors ${
              theme == "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            View and manage your student's information
          </p>
        </div>

        {studentData ? (
          <>
            <div
              className={`rounded-3xl shadow-sm overflow-hidden mb-6 transition-colors ${
                theme == "dark"
                  ? "bg-gray-800 border-2 border-gray-700"
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              <div
                className={`h-32 transition-colors ${
                  theme == "dark"
                    ? "bg-gradient-to-r from-red-800 to-red-800"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                }`}
              ></div>

              <div className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-16 mb-8">
                  <div className="relative">
                    <div className="relative w-32 h-32">
                      {studentData.profilePicture ? (
                        <Image
                          src={studentData.profilePicture}
                          alt="Profile"
                          fill
                          className={`rounded-full object-cover shadow-lg transition-colors ${
                            theme == "dark"
                              ? "border-4 border-gray-800"
                              : "border-4 border-white"
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-full h-full rounded-full flex items-center justify-center text-4xl font-bold shadow-lg transition-colors ${
                            theme == "dark"
                              ? "bg-red-600 text-white border-4 border-gray-800"
                              : "bg-red-500 text-white border-4 border-white"
                          }`}
                        >
                          {studentData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left mt-16 sm:mt-20">
                    <h2
                      className={`text-2xl font-bold transition-colors ${
                        theme == "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {studentData.name}
                    </h2>
                    <p
                      className={`mt-1 transition-colors ${
                        theme == "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {schoolData?.name}
                    </p>
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg transition-colors ${
                      theme == "dark"
                        ? "bg-red border border-white"
                        : "bg-white border border-white"
                    }`}
                  >
                    <School
                      className={`w-4 h-4 ${
                        theme == "dark" ? "text-white" : "text-red-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        theme == "dark" ? "text-white" : "text-red-600"
                      }`}
                    >
                      Student
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-red-900/40" : "bg-red-100"
                        }`}
                      >
                        <IdCard
                          className={`w-5 h-5 ${
                            theme == "dark" ? "text-red-400" : "text-red-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Enrollment Number
                        </p>
                        <p
                          className={`text-base font-semibold transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {studentData.enrollmentNo}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-blue-900/40" : "bg-blue-100"
                        }`}
                      >
                        <Building2
                          className={`w-5 h-5 ${
                            theme == "dark" ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          School ID
                        </p>
                        <p
                          className={`text-base font-semibold transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {studentData.schoolId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-green-900/40" : "bg-green-100"
                        }`}
                      >
                        <Mail
                          className={`w-5 h-5 ${
                            theme == "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Official Email
                        </p>
                        <p
                          className={`text-base font-semibold truncate transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {studentData.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-purple-900/40" : "bg-purple-100"
                        }`}
                      >
                        <Phone
                          className={`w-5 h-5 ${
                            theme == "dark"
                              ? "text-purple-400"
                              : "text-purple-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Phone Number
                        </p>
                        <p
                          className={`text-base font-semibold transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {studentData.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-orange-900/40" : "bg-orange-100"
                        }`}
                      >
                        <Landmark
                          className={`w-5 h-5 ${
                            theme == "dark"
                              ? "text-orange-400"
                              : "text-orange-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Branch
                        </p>
                        <p
                          className={`text-base font-semibold transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {branchMap[studentData.branch] || studentData.branch}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-yellow-900/40" : "bg-yellow-100"
                        }`}
                      >
                        <School
                          className={`w-5 h-5 ${
                            theme == "dark"
                              ? "text-yellow-400"
                              : "text-yellow-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Class ID
                        </p>
                        <p
                          className={`text-base font-semibold transition-colors cursor-pointer ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          <Link href={`/admin/class/${studentData.classId}`}>
                            {studentData.classId}
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`rounded-3xl p-6 transition-colors ${
                  theme == "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3
                  className={`text-xl font-bold mb-4 transition-colors ${
                    theme == "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  School Information
                </h3>
                <div
                  className={`rounded-xl p-6 transition-colors ${
                    theme == "dark"
                      ? "bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-800"
                      : "bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        theme == "dark" ? "bg-red-600" : "bg-red-500"
                      }`}
                    >
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p
                        className={`text-sm mb-1 transition-colors ${
                          theme == "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Affiliated School
                      </p>
                      <p
                        className={`text-lg font-bold transition-colors ${
                          theme == "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {schoolData?.name}
                      </p>
                      <p
                        className={`text-sm transition-colors ${
                          theme == "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        ID: {studentData.schoolId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            className={`rounded-3xl shadow-sm overflow-hidden transition-colors ${
              theme == "dark"
                ? "bg-gray-800 border-2 border-gray-700"
                : "bg-white border-2 border-gray-200"
            }`}
          >
            <div
              className={`h-32 animate-pulse ${
                theme == "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            ></div>
            <div className="px-8 pb-8">
              <div className="flex items-start gap-6 -mt-16 mb-8">
                <div
                  className={`w-32 h-32 rounded-full animate-pulse ${
                    theme == "dark"
                      ? "bg-gray-700 border-4 border-gray-800"
                      : "bg-gray-300 border-4 border-white"
                  }`}
                ></div>
                <div className="flex-1 mt-20">
                  <div
                    className={`h-8 rounded w-1/2 mb-2 animate-pulse ${
                      theme == "dark" ? "bg-gray-700" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`h-5 rounded w-1/3 animate-pulse ${
                      theme == "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div
                      className={`h-16 rounded animate-pulse ${
                        theme == "dark" ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
