"use client";
import { useState, useEffect } from "react";
import { Filter, Search, MoreVertical } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";
import type { Faculty } from "@/constants/interface";

interface GroupedTeachers {
  [key: string]: Faculty[];
}

interface FacultyUploadResponse {
  success: boolean;
  message: string;
  stats: {
    total: number;
    successful: number;
    failed: number;
  };
  data: any[];
  errors?: any[];
}

export default function Faculty() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [teachers, setTeachers] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addTeacher, setAddTeacher] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] =
    useState<FacultyUploadResponse | null>(null);

  const departmentMap: Record<string, string> = {
    "DEPT-CSE": "Computer Science & Engineering",
    "DEPT-APSCI": "Applied Science",
    "DEPT-IT": "Information Technology",
    "DEPT-ECE": "Electronics",
    "DEPT-MECH": "Mechanical Engineering",
    "DEPT-CIVIL": "Civil Engineering",
    "DEPT-EEE": "Electrical & Electronics",
  };

  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleUploadCSV = async () => {
    if (!csvFile) return;
    setUploading(true);
    try {
      const res = await uploadFacultyCSV(csvFile);
      setUploadResult(res);
      fetchTeacher();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, []);

  const fetchTeacher = async (): Promise<void> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/faculty/all`
      );
      console.log(res);
      const data = await res.json();
      console.log(data.data);
      setTeachers(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const groupedTeachers: GroupedTeachers = teachers.reduce((acc, teacher) => {
    const type = teacher.type || "Other";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(teacher);
    return acc;
  }, {} as GroupedTeachers);

  const filteredGroupedTeachers: GroupedTeachers = Object.entries(
    groupedTeachers
  ).reduce((acc, [type, teacherList]) => {
    let filtered = teacherList;

    // Filter by search
    filtered = filtered.filter((teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((teacher) => teacher.type === filterType);
    }

    // Filter by department
    if (filterDept !== "all") {
      filtered = filtered.filter(
        (teacher) => teacher.departmentId === filterDept 
      );
    }

    if (filtered.length > 0) acc[type] = filtered;
    return acc;
  }, {} as GroupedTeachers);

  const uploadFacultyCSV = async (
    file: File
  ): Promise<FacultyUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append("csvFile", file);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/admin/faculties/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return res.data as FacultyUploadResponse;
    } catch (error: any) {
      console.error("Faculty CSV Upload Error:", error);
      throw error.response?.data ?? { error: "Upload failed" };
    }
  };

  const downloadFacultyPDF = () => {
    if (!uploadResult || !uploadResult.data) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Uploaded Faculty List", 14, 16);

    const tableData = uploadResult.data.map((item) => [
      item.name,
      item.email,
      "Faculty@123",
    ]);

    autoTable(doc, {
      startY: 25,
      head: [["Name", "Email", "Password"]],
      body: tableData,
    });

    doc.save("faculty_credentials.pdf");
  };

  const TeacherCard = ({ teacher }: { teacher: Faculty }) => (
    <div
      onClick={() => {router.push(`/admin/faculty/${teacher.uid}`)}}
      className={`
      rounded-2xl p-6 relative transition-all
      hover:shadow-lg hover:-translate-y-1
      cursor-pointer
      ${theme === "dark" ? "bg-gray-800" : "bg-white"}
    `}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`
          w-20 h-20 rounded-full flex items-center justify-center mb-5
          shadow-sm
          ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}
        `}
        >
          <svg
            className={`
            w-10 h-10
            ${theme === "dark" ? "text-gray-500" : "text-gray-400"}
          `}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>

        <h3
          className={`
          text-xl font-semibold
          ${theme === "dark" ? "text-white" : "text-gray-900"}
        `}
        >
          {teacher.name}
        </h3>

        <p
          className={`
          text-sm mt-1 mb-6
          ${theme === "dark" ? "text-gray-400" : "text-gray-500"}
        `}
        >
          ID: {teacher.facultyId}
        </p>

        <div className="w-full space-y-4 text-left rounded-lg border-1 border-gray-200 shadow bg-gray-50 p-5">
          <div>
            <p
              className={`
              text-xs font-medium uppercase tracking-wide mb-1
              ${theme === "dark" ? "text-gray-500" : "text-gray-500"}
            `}
            >
              Department
            </p>
            <p
              className={`
              text-sm
              ${theme === "dark" ? "text-gray-200" : "text-gray-800"}
            `}
            >
              {departmentMap[teacher.departmentId] || "Unknown Department"}
            </p>
          </div>

          <div>
            <p
              className={`
              text-xs font-medium uppercase tracking-wide mb-1
              ${theme === "dark" ? "text-gray-500" : "text-gray-500"}
            `}
            >
              Email
            </p>
            <p
              className={`
              text-sm break-all leading-relaxed
              ${theme === "dark" ? "text-gray-200" : "text-gray-800"}
            `}
            >
              {teacher.officialEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen p-2 md:p-8 transition-colors ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold transition-colors ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Manage Faculties
          </h1>
          <p
            className={`mt-1 transition-colors ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            View and manage faculties' information
          </p>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="search for the teacher you want"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border-2 rounded-xl pl-12 pr-5 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-11 text-sm rounded-xl px-4 flex gap-2 border-2 items-center transition-colors ${
              theme === "dark"
                ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                : "border-gray-200 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <button
            onClick={() => {
              setAddTeacher(!addTeacher);
            }}
            className={`h-11 text-sm cursor-pointer rounded-xl px-4 flex gap-2 border-2 items-center justify-center transition-colors ${
              theme === "dark"
                ? "border-red-600 bg-red-600 hover:bg-red-700 text-white"
                : "border-red-500 bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            + Add Faculty
          </button>
        </div>

        {showFilters && (
          <div
            className={`
      p-5 rounded-xl border mb-6
      ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }
    `}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Department Filter */}
              <div>
                <label
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Filter by Department
                </label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className={`
            w-full mt-2 border rounded-lg px-3 py-2 text-sm
            ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            }
          `}
                >
                  <option value="all">All Departments</option>
                  {Object.entries(departmentMap).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Filter by Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`
            w-full mt-2 border rounded-lg px-3 py-2 text-sm
            ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            }
          `}
                >
                  <option value="all">All Types</option>
                  {Object.keys(groupedTeachers).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {addTeacher && (
          <div
            className={`p-8 rounded-2xl border-2 transition-all mb-10 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-6 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Upload Faculty CSV
            </h2>

            <label
              className={`w-full border-2 rounded-xl cursor-pointer flex flex-col items-center justify-center py-12 transition-all ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <svg
                className={`w-12 h-12 mb-3 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 4v16m8-8H4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Click to upload CSV file
              </p>

              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            {csvFile && (
              <p
                className={`mt-4 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Selected File:{" "}
                <span className="font-medium">{csvFile.name}</span>
              </p>
            )}

            <button
              onClick={handleUploadCSV}
              disabled={uploading || !csvFile}
              className={`mt-6 w-full py-3 rounded-xl text-sm font-medium transition-all ${
                uploading
                  ? "opacity-60 cursor-not-allowed"
                  : theme === "dark"
                  ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                  : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              }`}
            >
              {uploading ? "Uploading..." : "Upload CSV"}
            </button>

            {uploadResult && (
              <div
                className={`mt-6 p-4 rounded-xl text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Uploaded: {uploadResult.stats.successful} /{" "}
                {uploadResult.stats.total}
                <div className="w-full flex justify-center">
                  <button
                    onClick={downloadFacultyPDF}
                    className="mt-4 w-fit text-center px-5 m-auto py-1 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {Object.entries(filteredGroupedTeachers).map(([type, teacherList]) => (
          <div key={type} className="mb-10">
            <h2
              className={`text-2xl font-bold mb-6 ${
                theme === "dark" ? "text-red-400" : "text-red-500"
              }`}
            >
              {type === "Assistant Professor"
                ? "Assistant Professors"
                : type === "Lab Assistant"
                ? "LAB ASSISTANT"
                : type}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherList.map((teacher, index) => (
                <TeacherCard
                  key={teacher._id || `${teacher.name}-${index}`}
                  teacher={teacher}
                />
              ))}
            </div>
          </div>
        ))}

        {teachers.length === 0 && (
          <div
            className={`text-center py-12 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No faculties found. Click "Add Faculty" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
