"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../../context/theme";
import { Search, Filter } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";
import type { Student } from "@/constants/interface";

interface GroupedStudents {
  [key: string]: Student[];
}

interface StudentUploadResponse {
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

export default function Students() {
  const router = useRouter();
  const { theme } = useTheme();

  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filterBranch, setFilterBranch] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  const [addStudent, setAddStudent] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] =
    useState<StudentUploadResponse | null>(null);

  const branchOptions = ["AIML", "AIDS", "CSE", "CSE-AM", "VLSI", "IIOT"];

  const fetchStudents = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/student/all`
      );
      const json = await res.json();
      setStudents(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const uploadStudentCSV = async (
    file: File
  ): Promise<StudentUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append("csvFile", file);

      const res = await axios.post(
        "https://your-backend-url/api/admin/students/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return res.data;
    } catch (error: any) {
      console.error(error);
      throw error.response?.data ?? { error: "Upload failed" };
    }
  };

  const handleUploadCSV = async () => {
    if (!csvFile) return;
    setUploading(true);

    try {
      const res = await uploadStudentCSV(csvFile);
      setUploadResult(res);
      fetchStudents();
    } finally {
      setUploading(false);
    }
  };

  const downloadStudentPDF = () => {
    if (!uploadResult?.data) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Uploaded Student Credentials", 14, 16);

    const tableData = uploadResult.data.map((s) => [
      s.name,
      s.email,
      "Student@123",
    ]);

    autoTable(doc, {
      startY: 25,
      head: [["Name", "Email", "Password"]],
      body: tableData,
    });

    doc.save("student_credentials.pdf");
  };

  const groupedStudents: GroupedStudents = students.reduce((acc, s) => {
    const year = s.batchEnd || "Others";
    if (!acc[year]) acc[year] = [];
    acc[year].push(s);
    return acc;
  }, {} as GroupedStudents);

  const filteredStudents: GroupedStudents = Object.entries(
    groupedStudents
  ).reduce((acc, [year, list]) => {
    let filtered = list;

    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterBranch !== "all") {
      filtered = filtered.filter((s) => s.branch === filterBranch);
    }

    if (filterYear !== "all") {
      filtered = filtered.filter((s) => s.batchEnd === filterYear);
    }

    if (filtered.length > 0) acc[year] = filtered;
    return acc;
  }, {} as GroupedStudents);

  const StudentCard = ({ student }: { student: Student }) => (
    <div
      onClick={() => {
        router.push(`/admin/students/${student.uid}`);
      }}
      className={`
        p-6 rounded-2xl shadow transition-all cursor-pointer
        ${
          theme === "dark"
            ? "bg-gray-800 hover:bg-gray-700"
            : "bg-white hover:shadow-lg"
        }
      `}
    >
      <h3
        className={`text-xl font-semibold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        {student.name}
      </h3>
      <p
        className={`text-sm mt-1 ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Enrollment Number: {student.enrollmentNo}
      </p>

      <div className="mt-4 text-sm">
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-800"}>
          <strong>Branch:</strong> {student.branch}
        </p>
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-800"}>
          <strong>Phone:</strong> {student.phone}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen p-3 md:p-8 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <h1
          className={`text-3xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Manage Students
        </h1>
        <p
          className={`mt-1 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          View and manage student information
        </p>

        <div className="flex items-center gap-3 mt-8">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a student"
              className={`w-full border-2 rounded-xl pl-12 pr-5 py-3 text-sm ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-11 px-4 rounded-xl border-2 flex gap-2 items-center ${
              theme === "dark"
                ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                : "border-gray-200 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <button
            onClick={() => setAddStudent(!addStudent)}
            className={`h-11 px-4 rounded-xl ${
              theme === "dark"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            + Add Student
          </button>
        </div>

        {showFilters && (
          <div
            className={`mt-5 p-5 rounded-xl border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium">Filter by Branch</label>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className={`w-full mt-2 border rounded-lg px-3 py-2 text-sm ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-200"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="all">All Branches</option>
                  {branchOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Filter by Batch</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className={`w-full mt-2 border rounded-lg px-3 py-2 text-sm ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-200"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="all">All Batches</option>
                  <option value="1st">Class of 2029</option>
                  <option value="2nd">Class of 2028</option>
                  <option value="3rd">Class of 2027</option>
                  <option value="4th">Class of 2026</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {addStudent && (
          <div
            className={`p-8 rounded-2xl mt-8 border-2 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold">Upload Students CSV</h2>

            <label
              className={`mt-4 w-full border-2 rounded-xl cursor-pointer flex flex-col items-center py-12 ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <p className="text-sm">Click to upload CSV file</p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            {csvFile && (
              <p className="mt-3 text-sm">
                Selected File: <strong>{csvFile.name}</strong>
              </p>
            )}

            <button
              onClick={handleUploadCSV}
              disabled={uploading || !csvFile}
              className={`mt-6 w-full py-3 rounded-xl text-sm font-medium ${
                uploading
                  ? "opacity-60 cursor-not-allowed"
                  : theme === "dark"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {uploading ? "Uploading..." : "Upload CSV"}
            </button>

            {uploadResult && (
              <div
                className={`mt-6 p-4 rounded-xl ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                Uploaded: {uploadResult.stats.successful} of{" "}
                {uploadResult.stats.total}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={downloadStudentPDF}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {Object.entries(filteredStudents).map(([year, list]) => (
          <div key={year} className="mt-10">
            <h2
              className={`text-2xl font-bold mb-6 ${
                theme === "dark" ? "text-red-400" : "text-red-500"
              }`}
            >
              Class of {year}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((s) => (
                <StudentCard key={s._id} student={s} />
              ))}
            </div>
          </div>
        ))}

        {students.length === 0 && (
          <p
            className={`text-center mt-20 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No students found. Click "Add Student" to upload data.
          </p>
        )}
      </div>
    </div>
  );
}
